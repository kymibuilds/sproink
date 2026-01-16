import { NextResponse } from "next/server";
import { db } from "@/db";
import { integrations } from "@/db/schema";
import { getCurrentUser } from "@/lib/get-user";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const integration = await db.query.integrations.findFirst({
    where: eq(integrations.userId, user.id),
  });

  if (!integration?.githubEnabled || !integration?.githubUsername || !integration?.githubToken) {
    return NextResponse.json({ error: "GitHub integration not configured" }, { status: 400 });
  }

  try {
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  contributionLevel
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${integration.githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: { username: integration.githubUsername } }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch from GitHub" }, { status: response.status });
    }

    const data = await response.json();
    const calendar = data?.data?.user?.contributionsCollection?.contributionCalendar;

    if (calendar?.weeks) {
        const levelMap: Record<string, number> = {
            'NONE': 0,
            'FIRST_QUARTILE': 1,
            'SECOND_QUARTILE': 2,
            'THIRD_QUARTILE': 3,
            'FOURTH_QUARTILE': 4,
        };

        const contributions = calendar.weeks.flatMap((week: { contributionDays: Array<{ date: string; contributionCount: number; contributionLevel: string }> }) =>
            week.contributionDays.map((day) => ({
                date: day.date,
                count: day.contributionCount,
                level: levelMap[day.contributionLevel] ?? 0,
            }))
        );

        return NextResponse.json({ contributions });
    }

    return NextResponse.json({ contributions: [] });

  } catch (error) {
    console.error("GitHub API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
