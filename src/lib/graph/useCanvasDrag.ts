"use client";

import { useGraphStore } from "@/components/graph/GraphContextProvider";
import { Position } from "./Position.type";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";

export const useCanvasDrag = (
    _graphRef: RefObject<HTMLDivElement>,
    transformContainerRef: RefObject<HTMLDivElement>,
) => {
    const dragStartRef = useRef<Position | null>(null);
    const panStartRef = useRef<Position | null>(null);
    const [isCurrentlyDragging, setCurrentlyDragging] = useState<boolean>(false);

    const panOffset = useGraphStore((state) => state.panOffset);
    const scale = useGraphStore((state) => state.scale);
    const setPanOffset = useGraphStore((state) => state.setPanOffset);

    const onStartDragCanvas = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            dragStartRef.current = {
                x: e.clientX,
                y: e.clientY,
            };
            panStartRef.current = { ...panOffset };
            setCurrentlyDragging(true);
        },
        [panOffset],
    );

    useEffect(() => {
        if (!isCurrentlyDragging) return;

        let currentPanX = panStartRef.current?.x ?? 0;
        let currentPanY = panStartRef.current?.y ?? 0;

        const handleMouseMove = (e: MouseEvent) => {
            if (
                dragStartRef.current != null &&
                panStartRef.current != null &&
                transformContainerRef.current
            ) {
                const deltaX = e.clientX - dragStartRef.current.x;
                const deltaY = e.clientY - dragStartRef.current.y;
                currentPanX = panStartRef.current.x + deltaX;
                currentPanY = panStartRef.current.y + deltaY;

                transformContainerRef.current.style.transform =
                    `translate3d(${currentPanX}px, ${currentPanY}px, 0) scale(${scale})`;
            }
        };

        const endDrag = () => {
            setPanOffset({ x: currentPanX, y: currentPanY });
            dragStartRef.current = null;
            panStartRef.current = null;
            setCurrentlyDragging(false);
        };

        const handleMouseUp = () => {
            endDrag();
        };

        const handleMouseLeave = () => {
            if (dragStartRef.current != null) {
                endDrag();
            }
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [isCurrentlyDragging, scale, setPanOffset, transformContainerRef]);

    return {
        onStartDragCanvas,
        isCurrentlyDragging,
    };
};
