"use client";

import { useGraphStore } from "@/components/graph/GraphContextProvider";
import { Position } from "./Position.type";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";

export const useCanvasDrag = (graphRef: RefObject<HTMLDivElement>) => {
    const dragStartRef = useRef<Position | null>(null);
    const panStartRef = useRef<Position | null>(null);
    const [isCurrentlyDragging, setCurrentlyDragging] = useState<boolean>(
        false,
    );
    
    const panOffset = useGraphStore((state) => state.panOffset);
    const setPanOffset = useGraphStore((state) => state.setPanOffset);

    const onStartDragCanvas = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            dragStartRef.current = {
                x: e.clientX,
                y: e.clientY
            };
            panStartRef.current = { ...panOffset };
            setCurrentlyDragging(true);
        },
        [panOffset],
    );

    const onMouseMoveDragCanvas = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (
                dragStartRef.current != null && panStartRef.current != null
            ) {
                const deltaX = e.clientX - dragStartRef.current.x;
                const deltaY = e.clientY - dragStartRef.current.y;
                setPanOffset({
                    x: panStartRef.current.x + deltaX,
                    y: panStartRef.current.y + deltaY,
                });
            }
        },
        [setPanOffset],
    );

    const onEndDraggingCanvas = useCallback(
        (_: React.MouseEvent<HTMLDivElement>) => {
            dragStartRef.current = null;
            panStartRef.current = null;
            setCurrentlyDragging(false);
        },
        [],
    );

    useEffect(() => {
        if (!isCurrentlyDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (dragStartRef.current != null && panStartRef.current != null) {
                const deltaX = e.clientX - dragStartRef.current.x;
                const deltaY = e.clientY - dragStartRef.current.y;
                setPanOffset({
                    x: panStartRef.current.x + deltaX,
                    y: panStartRef.current.y + deltaY,
                });
            }
        };

        const handleMouseUp = () => {
            dragStartRef.current = null;
            panStartRef.current = null;
            setCurrentlyDragging(false);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isCurrentlyDragging, setPanOffset]);

    return {
        onStartDragCanvas,
        onMouseMoveDragCanvas,
        onEndDraggingCanvas,
        isCurrentlyDragging,
    };
};
