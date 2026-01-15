import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { links } from "@/db/schema";
import { validateRequest } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

// DELETE: Delete a link by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user } = await validateRequest();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Ensure the link belongs to the user
  const [deleted] = await db
    .delete(links)
    .where(and(eq(links.id, id), eq(links.userId, user.id)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
