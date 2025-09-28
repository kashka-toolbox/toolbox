import { Node } from "@/components/graph/Node";
import { Position } from "@/lib/graph/Position.type";
import { useCanvasDrag } from "@/lib/graph/useCanvasDrag";
import { useEdgeRenderer } from "@/lib/graph/useEdgeRenderer";
import { cn } from "@/lib/utils";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { executeGraph } from "../../lib/graph/executeGraph";
import { Button } from "../ui/button";
import { GraphContext } from "./GraphContextProvider";
import { GraphInfiniteCanvasScroll } from "./GraphInfiniteCanvasScroll";

export function Graph({}: {}) {
    const graphRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{ current: HTMLDivElement | null }>({
        current: null,
    });

    const {
        nodes,
        edges,
        previewEdge,
        currentlyDraggingNode,
        addEdge,
        setNodePosition,
        setPreviewEdge,
        setCurrentlyDraggingNode,
        updateNodeState,
    } = useContext(GraphContext);

    const {
        onStartDragCanvas,
        onMouseMoveDragCanvas,
        onEndDraggingCanvas,
        isCurrentlyDragging,
    } = useCanvasDrag(graphRef);

    const graphRefOffsets = useRef({left: 0, top: 0});
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

        if (currentlyDraggingNode) {
            const newPosition = {
                x: e.clientX - graphRefOffsets.current.left +
                    currentlyDraggingNode.offset.x,
                y: e.clientY - graphRefOffsets.current.top +
                    currentlyDraggingNode.offset.y,
            };
            setNodePosition(currentlyDraggingNode.nodeId, newPosition);
        }

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

        if (currentlyDraggingNode) {
            setCurrentlyDraggingNode(null);
        }
    }, [onEndDraggingCanvas, setCurrentlyDraggingNode, currentlyDraggingNode]);

  

    const renderedEdges = useEdgeRenderer(nodes, graphRef, edges);

    return (
        <>
            <Button
                onClick={() => {
                    executeGraph(nodes, edges, updateNodeState);
                }}
            >
                Execute
            </Button>
            <div
                ref={graphRef}
                className={cn(
                    "relative rounded bg-background text-foreground p-0 shadow-md overflow-scroll w-full aspect-video",
                    currentlyDraggingNode ? "cursor-grabbing" : undefined,
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
                {nodes.map((nodeState) => (
                    <Node
                        key={nodeState.id}
                        nodeState={nodeState}
                        isBeingDragged={nodeState.id == currentlyDraggingNode?.nodeId}
                        addEdge={addEdge}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentlyDraggingNode({
                                nodeId: nodeState.id,
                                startPosition: {
                                    x: e.clientX -
                                        graphRefOffsets.current.left,
                                    y: e.clientY -
                                        graphRefOffsets.current.top,
                                },
                                offset: {
                                    x: nodeState.position.x -
                                        (e.clientX -
                                            graphRefOffsets.current.left),
                                    y: nodeState.position.y -
                                        (e.clientY -
                                            graphRefOffsets.current.top),
                                },
                            });
                            dragRef.current.current = e.currentTarget;
                        }}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                    />
                ))}
            </div>
        </>
    );
}
