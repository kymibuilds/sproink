import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, or } from "drizzle-orm";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Rate limit: 5 login attempts per minute per IP
  const ip = getClientIP(req);
  const { success, remaining, resetIn } = rateLimit(`login:${ip}`, {
    maxRequests: 5,
    windowMs: 60000,
  });

  if (!success) {
    return new NextResponse("Too many login attempts. Please try again later.", {
      status: 429,
      headers: {
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(resetIn / 1000)),
      },
    });
  }

  const { identifier, password } = await req.json();

  const user = await db.query.users.findFirst({
    where: or(
      eq(users.email, identifier),
      eq(users.username, identifier)
    ),
  });

  if (!user) {
    return new NextResponse("Invalid credentials", { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return new NextResponse("Invalid credentials", { status: 401 });
  }

  const session = await auth.createSession(user.id, {});
  const sessionCookie = auth.createSessionCookie(session.id);

  return new NextResponse(null, {
    headers: {
      "Set-Cookie": sessionCookie.serialize(),
      "X-RateLimit-Remaining": String(remaining),
    },
  });
}

