import { Node } from "@/components/graph/Node";
import { Position } from "@/lib/graph/Position.type";
import { useCanvasDrag } from "@/lib/graph/useCanvasDrag";
import { useEdgeRenderer } from "@/lib/graph/useEdgeRenderer";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExecuteGraphButton } from "./ExecuteGraphButton";
import { useCurrentGraphStore, useGraphStore, useNodeIds } from "./GraphContextProvider";
import { GraphInfiniteCanvasScroll } from "./GraphInfiniteCanvasScroll";
import { GraphEdges } from "./GraphEdges";

export function Graph({ }: {}) {
    const graphRef = useRef<HTMLDivElement>(null);

    const nodeIDs = useNodeIds();

    //const previewEdge = useGraphStore((store) => store.previewEdge);
    //const setPreviewEdge = useGraphStore((store) => store.setPreviewEdge);
    //const setNodePosition = useGraphStore((store) => store.setNodePosition);

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

        /*if (previewEdge) {
            const currentPosition: Position = {
                x: e.clientX - graphRefOffsets.current.left,
                y: e.clientY - graphRefOffsets.current.top,
            };
            setPreviewEdge({
                ...previewEdge,
                currentDragPosition: currentPosition,
            });
        }*/
    }, [graphRefOffsets, onMouseMoveDragCanvas]);

    const onMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        onEndDraggingCanvas(e);
    }, [onEndDraggingCanvas]);

    console.log("Render Graph", Date.now());
    
    //const renderedEdges = useEdgeRenderer(graphRef);

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
                <GraphEdges graphRef={graphRef} />
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
