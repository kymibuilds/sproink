import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { links } from "@/db/schema";
import { validateRequest } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

// GET: Fetch all links for the authenticated user
export async function GET() {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userLinks = await db
    .select()
    .from(links)
    .where(eq(links.userId, user.id))
    .orderBy(desc(links.createdAt));

  return NextResponse.json(userLinks);
}

// POST: Create a new link
export async function POST(request: NextRequest) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, url } = body;

  if (!name || !url) {
    return NextResponse.json({ error: "Name and URL are required" }, { status: 400 });
  }

  const [newLink] = await db
    .insert(links)
    .values({
      userId: user.id,
      name,
      url,
    })
    .returning();

  return NextResponse.json(newLink, { status: 201 });
}
