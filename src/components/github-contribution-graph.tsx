"use client";

import {
  ContributionGraph,
  ContributionGraphCalendar,
  ContributionGraphBlock,
  type Activity,
} from "@/components/kibo-ui/contribution-graph";
import { cn } from "@/lib/utils";

type Props = {
  data: Activity[];
};

export function GitHubContributionGraph({ data }: Props) {
  if (data.length === 0) {
    return null;
  }

  // Calculate year total (from full data)
  const total = data.reduce((acc, day) => acc + day.count, 0);

  // Take the last 28 weeks (196 days) to avoid horizontal scrolling
  const recentData = data.slice(-196);

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <div className="w-full overflow-hidden flex justify-center">
        <ContributionGraph
          data={recentData}
          blockSize={10}
          blockMargin={2}
          blockRadius={2}
        >
          <ContributionGraphCalendar 
            hideMonthLabels 
            className="!overflow-visible"
          >
            {({ activity, dayIndex, weekIndex }) => (
              <ContributionGraphBlock
                activity={activity}
                dayIndex={dayIndex}
                weekIndex={weekIndex}
                className={cn(
                  // Minimal monochrome palette
                  'data-[level="0"]:fill-muted/20',
                  'data-[level="1"]:fill-foreground/20',
                  'data-[level="2"]:fill-foreground/40',
                  'data-[level="3"]:fill-foreground/60',
                  'data-[level="4"]:fill-foreground',
                  "hover:stroke-1 hover:stroke-background transition-colors duration-200"
                )}
              />
            )}
          </ContributionGraphCalendar>
        </ContributionGraph>
      </div>
      
      {/* Minimal footer */}
      <div className="mono text-[10px] text-muted-foreground flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
        <span>{total} contributions in the last year</span>
      </div>
    </div>
  );
}
