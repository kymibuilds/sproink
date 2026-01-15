import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Rate limit: 3 signups per hour per IP
  const ip = getClientIP(req);
  const { success, remaining, resetIn } = rateLimit(`signup:${ip}`, {
    maxRequests: 3,
    windowMs: 3600000, // 1 hour
  });

  if (!success) {
    return new NextResponse("Too many signup attempts. Please try again later.", {
      status: 429,
      headers: {
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(resetIn / 1000)),
      },
    });
  }

  const { email, username, password } = await req.json();

  if (!email || !username || !password) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({ email, username, passwordHash })
    .returning();

  const session = await auth.createSession(user.id, {});
  const sessionCookie = auth.createSessionCookie(session.id);

  return new NextResponse(null, {
    status: 201,
    headers: {
      "Set-Cookie": sessionCookie.serialize(),
      "X-RateLimit-Remaining": String(remaining),
    },
  });
}

