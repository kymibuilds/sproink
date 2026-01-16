export function DashboardSkeleton() {
  return (
    <div className="w-full min-h-screen flex justify-center px-6 pt-24 pb-16 md:py-16 animate-pulse">
      <div className="w-full max-w-lg flex flex-col gap-10 text-sm text-center items-center">
        
        {/* Header Skeleton */}
        <div className="flex flex-col gap-2 items-center w-full">
          <div className="h-6 w-32 bg-muted/50 rounded" />
          <div className="h-3 w-48 bg-muted/30 rounded" />
        </div>

        {/* Divider Skeleton */}
        <div className="w-full h-px bg-border/50" />

        {/* Links Skeleton */}
        <div className="flex flex-col gap-4 items-center w-full">
          <div className="h-3 w-16 bg-muted/30 rounded" />
          <div className="flex gap-4">
            <div className="h-4 w-20 bg-muted/50 rounded" />
            <div className="h-4 w-24 bg-muted/50 rounded" />
            <div className="h-4 w-16 bg-muted/50 rounded" />
          </div>
        </div>

        {/* Blogs Skeleton */}
        <div className="flex flex-col gap-4 items-center w-full">
          <div className="h-3 w-16 bg-muted/30 rounded" />
          <div className="flex flex-col gap-3 w-full items-center">
            <div className="h-4 w-48 bg-muted/50 rounded" />
            <div className="h-4 w-56 bg-muted/50 rounded" />
            <div className="h-4 w-40 bg-muted/50 rounded" />
          </div>
        </div>

        {/* Products Skeleton */}
        <div className="flex flex-col gap-4 items-center w-full">
          <div className="h-3 w-20 bg-muted/30 rounded" />
          <div className="grid grid-cols-3 gap-2 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col border border-border/50 bg-card/30">
                <div className="aspect-[3/2] bg-muted/20 border-b border-border/50" />
                <div className="p-2 gap-2 flex flex-col">
                  <div className="h-3 w-3/4 bg-muted/40 rounded" />
                  <div className="h-2 w-1/4 bg-muted/30 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
