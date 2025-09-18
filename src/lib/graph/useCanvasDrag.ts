import { RefObject, useState } from "react";

export const useCanvasDrag = (graphRef: RefObject<HTMLDivElement>) => {
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
        null,
    );
    const [scrollStart, setScrollStart] = useState<
        { x: number; y: number } | null
    >(null);

    const onStartDragCanvas = (e: React.MouseEvent<HTMLDivElement>) => {
        setDragStart({ x: e.clientX, y: e.clientY });
        setScrollStart({
            x: graphRef.current?.scrollLeft || 0,
            y: graphRef.current?.scrollTop || 0,
        });
    };

    const onMouseMoveDragCanvas = (e: React.MouseEvent<HTMLDivElement>) => {
        if (dragStart && scrollStart) {
            const currentX = e.clientX;
            const currentY = e.clientY;
            const deltaX = currentX - dragStart.x;
            const deltaY = currentY - dragStart.y;
            if (graphRef.current) {
                graphRef.current.scrollLeft = scrollStart.x - deltaX;
                graphRef.current.scrollTop = scrollStart.y - deltaY;
            }
        }
    };

    const onEndDraggingCanvas = (_: React.MouseEvent<HTMLDivElement>) => {
        setDragStart(null);
        setScrollStart(null);
    };

    const isCurrentlyDragging = dragStart != null;

    return { onStartDragCanvas, onMouseMoveDragCanvas, onEndDraggingCanvas, isCurrentlyDragging };
};
