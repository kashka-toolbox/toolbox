"use client";

import { useGraphStore } from "@/components/graph/GraphContextProvider";
import { RefObject, useCallback, useEffect } from "react";

const ZOOM_SENSITIVITY = 0.001;

export const useZoom = (graphRef: RefObject<HTMLDivElement>) => {
  const zoomTo = useGraphStore((state) => state.zoomTo);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      
      e.preventDefault();
      
      if (!graphRef.current) return;
      
      const rect = graphRef.current.getBoundingClientRect();
      const point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      
      const delta = -e.deltaY * ZOOM_SENSITIVITY;
      zoomTo(delta, point);
    },
    [zoomTo, graphRef],
  );

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    graph.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      graph.removeEventListener("wheel", handleWheel);
    };
  }, [graphRef, handleWheel]);

  return {
    handleWheel,
  };
};
