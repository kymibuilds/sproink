import React from "react";

function TrackCell({
  borders,
  pattern = false,
  children,
}: {
  borders?: string;
  pattern?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={`relative ${borders || ""} bg-background`}>
      {pattern && (
        <div className="absolute inset-0 bg-diagonal-stripes opacity-40 pointer-events-none" />
      )}
      {children}
    </div>
  );
}

export function CenteredLayout({ children }: { children: React.ReactNode }) {
  // 1fr [track] content [track] 1fr
  const gridCols = "1fr 1.5rem minmax(auto, 400px) 1.5rem 1fr";
  // 1fr [track] content [track] 1fr
  const gridRows = "1fr 1.5rem auto 1.5rem 1fr";

  return (
    <div
      className="min-h-screen w-full grid bg-background text-foreground"
      style={{
        gridTemplateColumns: gridCols,
        gridTemplateRows: gridRows,
      }}
    >
      {/* 
        Border Strategy:
        - Vertical Lines are owned by Col 2 (Left/Right) and Col 4 (Left/Right).
        - Horizontal Lines are owned by Row 2 (Top/Bottom) and Row 4 (Top/Bottom).
        This avoids double borders at intersections.
      */}

      {/* ================= Row 1 (Top Ext) ================= */}
      <div />
      <TrackCell borders="border-l border-r border-border" /> {/* Vertical Ext */}
      <div />
      <TrackCell borders="border-l border-r border-border" /> {/* Vertical Ext */}
      <div />

      {/* ================= Row 2 (Top Tracks) ================= */}
      {/* 1: Left Ext (Horizontal) */}
      <TrackCell borders="border-t border-b border-border" />

      {/* 2: Top Left Corner */}
      <TrackCell borders="border-t border-b border-l border-r border-border" />

      {/* 3: Top Center Track */}
      <TrackCell borders="border-t border-b border-border" pattern />

      {/* 4: Top Right Corner */}
      <TrackCell borders="border-t border-b border-l border-r border-border" />

      {/* 5: Right Ext (Horizontal) */}
      <TrackCell borders="border-t border-b border-border" />

      {/* ================= Row 3 (Main Content) ================= */}
      <div />

      {/* 2: Left Vertical Track */}
      <TrackCell borders="border-l border-r border-border" pattern />

      {/* 3: Content Area */}
      <div className="flex flex-col items-center justify-center p-8 bg-card/50 backdrop-blur-sm z-10">
        {children}
      </div>

      {/* 4: Right Vertical Track */}
      <TrackCell borders="border-l border-r border-border" pattern />

      <div />

      {/* ================= Row 4 (Bottom Tracks) ================= */}
      {/* 1: Left Ext */}
      <TrackCell borders="border-t border-b border-border" />

      {/* 2: Bottom Left Corner */}
      <TrackCell borders="border-t border-b border-l border-r border-border" />

      {/* 3: Bottom Center Track */}
      <TrackCell borders="border-t border-b border-border" pattern />

      {/* 4: Bottom Right Corner */}
      <TrackCell borders="border-t border-b border-l border-r border-border" />

      {/* 5: Right Ext */}
      <TrackCell borders="border-t border-b border-border" />

      {/* ================= Row 5 (Bottom Ext) ================= */}
      <div />
      <TrackCell borders="border-l border-r border-border" /> {/* Vertical Ext */}
      <div />
      <TrackCell borders="border-l border-r border-border" /> {/* Vertical Ext */}
      <div />
    </div>
  );
}
