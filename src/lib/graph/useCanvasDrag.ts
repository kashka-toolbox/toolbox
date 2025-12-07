"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { Position } from "./Position.type";

export const useCanvasDrag = (graphRef: RefObject<HTMLDivElement>) => {
    const dragStartRef = useRef<Position | null>(null);
    const scrollStartRef = useRef<Position | null>(null);
    const [isCurrentlyDragging, setCurrentlyDragging] = useState<boolean>(
        false,
    );

    const onStartDragCanvas = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            dragStartRef.current = {
                x: e.clientX,
                y: e.clientY
            };
            scrollStartRef.current = {
                x: graphRef.current?.scrollLeft || 0,
                y: graphRef.current?.scrollTop || 0,
            };
            setCurrentlyDragging(true);
        },
        [],
    );

    const onMouseMoveDragCanvas = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (
                dragStartRef.current != null && scrollStartRef.current != null
            ) {
                const deltaX = e.clientX - dragStartRef.current.x;
                const deltaY = e.clientY - dragStartRef.current.y;
                if (graphRef.current) {
                    graphRef.current.scrollLeft = scrollStartRef.current.x - deltaX;
                    graphRef.current.scrollTop = scrollStartRef.current.y - deltaY;
                }
            }
        },
        [],
    );

    const onEndDraggingCanvas = useCallback(
        (_: React.MouseEvent<HTMLDivElement>) => {
            dragStartRef.current = null;
            scrollStartRef.current = null;
            setCurrentlyDragging(false);
        },
        [],
    );

    return {
        onStartDragCanvas,
        onMouseMoveDragCanvas,
        onEndDraggingCanvas,
        isCurrentlyDragging,
    };
};
