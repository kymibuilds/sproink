import { ImageResponse } from "next/og";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  // Fetch user
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
    columns: { username: true, bio: true },
  });

  if (!user) {
    // Return a default "user not found" image
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            color: "#ffffff",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 700 }}>404</div>
          <div style={{ fontSize: 24, color: "#888", marginTop: 16 }}>
            User not found
          </div>
          <div style={{ fontSize: 18, color: "#666", marginTop: 32 }}>
            plob.dev
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: 60,
        }}
      >
        {/* Username */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          [{user.username}]
        </div>

        {/* Bio */}
        {user.bio && (
          <div
            style={{
              fontSize: 28,
              color: "#888888",
              textAlign: "center",
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            {user.bio.length > 120 ? user.bio.slice(0, 120) + "..." : user.bio}
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            width: 200,
            height: 1,
            backgroundColor: "#333",
            margin: "40px 0",
          }}
        />

        {/* Branding */}
        <div
          style={{
            fontSize: 24,
            color: "#666666",
            fontFamily: "monospace",
          }}
        >
          {user.username}.plob.dev
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
