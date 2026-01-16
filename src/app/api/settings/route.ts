import { NextResponse } from "next/server";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { getCurrentUser } from "@/lib/get-user";
import { eq } from "drizzle-orm";

// GET /api/settings - Get current user's settings
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, user.id),
  });

  // Return default settings if none exist
  if (!settings) {
    return NextResponse.json({
      showLinks: true,
      showBlogs: true,
      showProducts: true,
      showIntegrations: true,
      linksLayout: "horizontal",
      bgColor: null,
      textColor: null,
    });
  }

  return NextResponse.json({
    showLinks: settings.showLinks,
    showBlogs: settings.showBlogs,
    showProducts: settings.showProducts,
    showIntegrations: settings.showIntegrations,
    linksLayout: settings.linksLayout,
    bgColor: settings.bgColor,
    textColor: settings.textColor,
  });
}

// PATCH /api/settings - Update current user's settings
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { showLinks, showBlogs, showProducts, showIntegrations, linksLayout, bgColor, textColor } = body;

  // Upsert settings
  const existing = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, user.id),
  });

  if (existing) {
    await db
      .update(userSettings)
      .set({
        showLinks: showLinks ?? existing.showLinks,
        showBlogs: showBlogs ?? existing.showBlogs,
        showProducts: showProducts ?? existing.showProducts,
        showIntegrations: showIntegrations ?? existing.showIntegrations,
        linksLayout: linksLayout ?? existing.linksLayout,
        bgColor: bgColor !== undefined ? bgColor : existing.bgColor,
        textColor: textColor !== undefined ? textColor : existing.textColor,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, user.id));
  } else {
    await db.insert(userSettings).values({
      userId: user.id,
      showLinks: showLinks ?? true,
      showBlogs: showBlogs ?? true,
      showProducts: showProducts ?? true,
      showIntegrations: showIntegrations ?? true,
      linksLayout: linksLayout ?? "horizontal",
      bgColor: bgColor ?? null,
      textColor: textColor ?? null,
    });
  }

  return NextResponse.json({ success: true });
}
