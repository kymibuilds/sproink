import { NextResponse } from "next/server";
import { db } from "@/db";
import { integrations } from "@/db/schema";
import { getCurrentUser } from "@/lib/get-user";
import { eq } from "drizzle-orm";

// GET /api/integrations - Get current user's integration settings
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integration = await db.query.integrations.findFirst({
    where: eq(integrations.userId, user.id),
  });

  // Return default settings if none exist
  if (!integration) {
    return NextResponse.json({
      githubUsername: null,
      githubToken: null,
      githubEnabled: false,
    });
  }

  return NextResponse.json({
    githubUsername: integration.githubUsername,
    // Don't expose the full token, just indicate if it's set
    hasGithubToken: !!integration.githubToken,
    githubEnabled: integration.githubEnabled,
  });
}

// PATCH /api/integrations - Update current user's integration settings
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { githubUsername, githubToken, githubEnabled } = body;

  // Upsert integration settings
  const existing = await db.query.integrations.findFirst({
    where: eq(integrations.userId, user.id),
  });

  if (existing) {
    await db
      .update(integrations)
      .set({
        githubUsername: githubUsername !== undefined ? githubUsername : existing.githubUsername,
        githubToken: githubToken !== undefined ? githubToken : existing.githubToken,
        githubEnabled: githubEnabled !== undefined ? githubEnabled : existing.githubEnabled,
        updatedAt: new Date(),
      })
      .where(eq(integrations.userId, user.id));
  } else {
    await db.insert(integrations).values({
      userId: user.id,
      githubUsername: githubUsername ?? null,
      githubToken: githubToken ?? null,
      githubEnabled: githubEnabled ?? false,
    });
  }

  return NextResponse.json({ success: true });
}
