import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { Position } from "./Position.type";

export const useCanvasDrag = (graphRef: RefObject<HTMLDivElement>) => {
    const dragStartRef = useRef<Position | null>(null);
    const scrollStartRef = useRef<Position | null>(null);
    const [isCurrentlyDragging, setCurrentlyDragging] = useState<boolean>(
        false,
    );

    const graphRefOffsets = useRef({ left: 0, top: 0 });

    useEffect(() => {
        graphRefOffsets.current.left = graphRef.current?.offsetLeft ?? 0;
    }, [graphRef.current?.offsetLeft]);
    useEffect(() => {
        graphRefOffsets.current.top = graphRef.current?.offsetTop ?? 0;
    }, [graphRef.current?.offsetTop]);

    const onStartDragCanvas = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            dragStartRef.current = { x: e.clientX, y: e.clientY };
            scrollStartRef.current = {
                x: graphRefOffsets.current.left || 0,
                y: graphRefOffsets.current.top || 0,
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
                console.log({
                    dragStartRef: dragStartRef.current,
                    scrollStartRef: scrollStartRef.current,
                    currentX: e.clientX,
                    currentY: e.clientY,
                    deltaX: e.clientX - dragStartRef.current.x,
                    deltaY: e.clientY - dragStartRef.current.y,
                });
                const currentX = e.clientX;
                const currentY = e.clientY;
                const deltaX = currentX - dragStartRef.current.x;
                const deltaY = currentY - dragStartRef.current.y;
                if (graphRef.current) {
                    graphRef.current.scrollTo({
                        left: scrollStartRef.current.x - deltaX,
                        top: scrollStartRef.current.y - deltaY,
                        behavior: "instant",
                    });
                }
            }
        },
        [graphRef],
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
