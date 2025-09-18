
import { Node } from "@/components/graph/Node";
import { Position } from "@/lib/graph/Position.type";
import { useCanvasDrag } from "@/lib/graph/useCanvasDrag";
import { useEdgeRenderer } from "@/lib/graph/useEdgeRenderer";
import { cn } from "@/lib/utils";
import { useContext, useRef } from "react";
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

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === graphRef.current) {
            e.preventDefault();
            e.stopPropagation();
            onStartDragCanvas(e);
        }
    };

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        onMouseMoveDragCanvas(e);

        if (currentlyDraggingNode) {
            const newPosition = {
                x: e.clientX - (graphRef.current?.offsetLeft || 0) +
                    currentlyDraggingNode.offset.x,
                y: e.clientY - (graphRef.current?.offsetTop || 0) +
                    currentlyDraggingNode.offset.y,
            };
            setNodePosition(currentlyDraggingNode.nodeId, newPosition);
        }

        if (previewEdge) {
            const currentPosition: Position = {
                x: e.clientX - (graphRef.current?.offsetLeft || 0),
                y: e.clientY - (graphRef.current?.offsetTop || 0),
            };
            setPreviewEdge({
                ...previewEdge,
                currentDragPosition: currentPosition,
            });
        }
    };
    const onMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        onEndDraggingCanvas(e);

        if (currentlyDraggingNode) {
            setCurrentlyDraggingNode(null);
        }
    };

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
                onMouseLeave={onStartDragCanvas}
            >
                <GraphInfiniteCanvasScroll />
                <svg className="sticky inset-0 w-full h-full pointer-events-none z-20">
                    {renderedEdges}
                </svg>
                {nodes.map((nodeState) => (
                    <Node
                        key={nodeState.id}
                        nodeState={nodeState}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentlyDraggingNode({
                                nodeId: nodeState.id,
                                startPosition: {
                                    x: e.clientX -
                                        (graphRef.current?.offsetLeft || 0),
                                    y: e.clientY -
                                        (graphRef.current?.offsetTop || 0),
                                },
                                offset: {
                                    x: nodeState.position.x -
                                        (e.clientX -
                                            (graphRef.current?.offsetLeft ||
                                                0)),
                                    y: nodeState.position.y -
                                        (e.clientY -
                                            (graphRef.current?.offsetTop || 0)),
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
