import { Node } from "@/components/graph/Node";
import { Position } from "@/lib/graph/Position.type";
import { useCanvasDrag } from "@/lib/graph/useCanvasDrag";
import { useEdgeRenderer } from "@/lib/graph/useEdgeRenderer";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExecuteGraphButton } from "./ExecuteGraphButton";
import { useCurrentGraphStore, useGraphStore } from "./GraphContextProvider";
import { GraphInfiniteCanvasScroll } from "./GraphInfiniteCanvasScroll";

export function Graph({ }: {}) {
    const graphRef = useRef<HTMLDivElement>(null);

    const [nodeIDs, setNodeIDs] = useState<string[]>(useCurrentGraphStore().getState().nodes.map((n) => n.id));

    const unsubscribeIDs = useCurrentGraphStore().subscribe(
        (store) => setNodeIDs(store.nodes.map((n) => n.id))
    );

    useEffect(() => {
        return () => {
            unsubscribeIDs();
        };
    }, [unsubscribeIDs]);

    const previewEdge = useGraphStore((store) => store.previewEdge);
    const setPreviewEdge = useGraphStore((store) => store.setPreviewEdge);
    const setNodePosition = useGraphStore((store) => store.setNodePosition);

    const {
        onStartDragCanvas,
        onMouseMoveDragCanvas,
        onEndDraggingCanvas,
        isCurrentlyDragging,
    } = useCanvasDrag(graphRef);

    const graphRefOffsets = useRef({ left: 0, top: 0 });
    useEffect(() => {
        graphRefOffsets.current.left = (graphRef.current?.offsetLeft ?? 0);
    }, [graphRef.current?.offsetLeft]);
    useEffect(() => {
        graphRefOffsets.current.top = (graphRef.current?.offsetTop ?? 0);
    }, [graphRef.current?.offsetTop]);

    const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === graphRef.current) {
            e.preventDefault();
            e.stopPropagation();
            onStartDragCanvas(e);
        }
    }, [graphRef]);

    const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        onMouseMoveDragCanvas(e);

        if (previewEdge) {
            const currentPosition: Position = {
                x: e.clientX - graphRefOffsets.current.left,
                y: e.clientY - graphRefOffsets.current.top,
            };
            setPreviewEdge({
                ...previewEdge,
                currentDragPosition: currentPosition,
            });
        }
    }, [graphRefOffsets, onMouseMoveDragCanvas, setNodePosition, setPreviewEdge]);
    const onMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        onEndDraggingCanvas(e);
    }, [onEndDraggingCanvas]);



    const renderedEdges = useEdgeRenderer(graphRef);

    return (
        <>
            <ExecuteGraphButton />
            <div
                ref={graphRef}
                className={cn(
                    "relative rounded bg-background text-foreground p-0 shadow-md overflow-scroll w-full aspect-video",
                    isCurrentlyDragging ? "cursor-grab" : undefined,
                )}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseDown={onMouseDown}
                onMouseLeave={onEndDraggingCanvas}
            >
                <GraphInfiniteCanvasScroll />
                <svg className="sticky inset-0 w-full h-full pointer-events-none z-20">
                    {renderedEdges}
                </svg>
                {nodeIDs.map((nodeId) => (
                    <Node
                        key={nodeId}
                        nodeId={nodeId}
                        graphRefOffsets={graphRefOffsets}
                    />
                ))}
            </div>
        </>
    );
}
