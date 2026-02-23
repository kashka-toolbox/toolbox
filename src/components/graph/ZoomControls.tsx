"use client";

import { useGraphStore } from "@/components/graph/GraphContextProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ZoomControls({ className }: { className?: string }) {
  const scale = useGraphStore((state) => state.scale);
  const setScale = useGraphStore((state) => state.setScale);
  const resetZoom = useGraphStore((state) => state.resetZoom);

  const zoomIn = () => setScale(scale * 1.2);
  const zoomOut = () => setScale(scale / 1.2);

  return (
    <div
      className={cn(
        "flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md border border-border p-1",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={zoomOut}
        className="h-6 w-6 p-0 text-xs"
        disabled={scale <= 0.1}
      >
        -
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={resetZoom}
        className="h-6 px-2 text-xs min-w-[3rem]"
      >
        {Math.round(scale * 100)}%
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={zoomIn}
        className="h-6 w-6 p-0 text-xs"
        disabled={scale >= 4}
      >
        +
      </Button>
    </div>
  );
}
