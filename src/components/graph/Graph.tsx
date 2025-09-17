import { NodeState } from "@/lib/graph/NodeState";

import { Node } from "@/components/graph/Node";
import { Position } from "@/lib/graph/Position.type";
import { cn } from "@/lib/utils";
import { createContext, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { NodeIOIdentifier } from "./NodeIO";
import { cva } from "class-variance-authority";
import { useEdgeRenderer } from "@/lib/graph/useEdgeRenderer";
import { executeGraph } from "../../lib/graph/executeGraph";

export const GraphContext = createContext<{
    nodes: NodeState<any, any>[];
    /**
     * Sets the preview edge for the graph, that the user can see while dragging an edge.
     */
    setPreviewEdge?: (edge: { fromIO: NodeIOIdentifier; toIO?: NodeIOIdentifier } | null) => void;
    addEdge?: (fromIO: NodeIOIdentifier, toIO: NodeIOIdentifier) => void;
    currentlyDraggingNode?: { nodeId: string; startPosition: Position, offset: Position } | null;
}>({
    nodes: [],
    currentlyDraggingNode: null,
});

export function Graph({
    initialNodeStates,
}: {
    initialNodeStates: NodeState<any, any>[];
}) {
    const [nodes, setNodes] = useState<NodeState<any, any>[]>(
        initialNodeStates,
    );

    const [edges, setEdges] = useState<{
        fromIO: NodeIOIdentifier;
        toIO?: NodeIOIdentifier;
    }[]>([]);

    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
    const [scrollStart, setScrollStart] = useState<{ x: number; y: number } | null>(null);

    const startDragging = (e: React.MouseEvent<HTMLDivElement>) => {
        setDragStart({ x: e.clientX, y: e.clientY });
        setScrollStart({
            x: graphRef.current?.scrollLeft || 0,
            y: graphRef.current?.scrollTop || 0
        });
    };

    const doDragging = (e: React.MouseEvent<HTMLDivElement>) => {
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

    const stopDragging = () => {
        setDragStart(null);
        setScrollStart(null);
    };

    const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === graphRef.current) {
            e.preventDefault();
            e.stopPropagation();
            startDragging(e);
        }
    };


    /**
     * Adds an edge between two node IOs.
     * 
     * Edges are always directed from the source node IO to the target node IO.
     * 
     * @param fromIO The source node IO.
     * @param toIO The target node IO.
     */
    const addEdge = (fromIO: NodeIOIdentifier, toIO: NodeIOIdentifier) => {
        setEdges((prevEdges) => [...prevEdges, { fromIO, toIO }]);
    };

    const [currentlyDraggingNode, setCurrentlyDraggingNode] = useState<
        { nodeId: string; startPosition: Position, offset: Position } | null
    >(null);

    const [previewEdge, setPreviewEdge] = useState<{
        fromIO: NodeIOIdentifier;
        toIO?: NodeIOIdentifier;
    } | null>(null);

    const graphRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{ current: HTMLDivElement | null }>({ current: null });

    const setNodePosition = (
        id: string,
        position: { x: number; y: number },
    ) => {
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.id === id ? { ...node, position } : node
            )
        );
    };

    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        doDragging(e);

        if (currentlyDraggingNode) {
            const newPosition = {
                x: e.clientX - (graphRef.current?.offsetLeft || 0) + currentlyDraggingNode.offset.x,
                y: e.clientY - (graphRef.current?.offsetTop || 0) + currentlyDraggingNode.offset.y,
            };
            setNodePosition(currentlyDraggingNode.nodeId, newPosition);
        }

        if (previewEdge) {
            const currentPosition = {
                x: e.clientX - (graphRef.current?.offsetLeft || 0),
                y: e.clientY - (graphRef.current?.offsetTop || 0),
            };
            setPreviewEdge({
                ...previewEdge,
                toIO: {
                    nodeId: previewEdge.fromIO.nodeId,
                    nodeIOName: previewEdge.fromIO.nodeIOName,
                },
            });
        }
    };
    const onMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        stopDragging();

        if (currentlyDraggingNode) {
            setCurrentlyDraggingNode(null);
        }
    };

    const renderedEdges = useEdgeRenderer(nodes, graphRef, edges);

    const updatenodeState = (nodeId: string, newState: Partial<NodeState<any, any>>) => {
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.id === nodeId ? { ...node, ...newState } : node
            )
        );
    };


    const sizeRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const resizeScrollArea = () => {
            if (!sizeRef.current)
                return;

            const parentScrollLeft = (sizeRef.current.parentElement?.clientWidth ?? 0) + (sizeRef.current.parentElement?.scrollLeft ?? 0);
            const parentScrollHeight = (sizeRef.current.parentElement?.clientHeight ?? 0) + (sizeRef.current.parentElement?.scrollTop ?? 0);
            sizeRef.current.style.minHeight = (parentScrollHeight + (sizeRef.current.parentElement?.clientHeight ?? 0)) + "px";
            sizeRef.current.style.minWidth = (parentScrollLeft + (sizeRef.current.parentElement?.clientWidth ?? 0)) + "px";
        }

        resizeScrollArea();
        const resizeObserver = new ResizeObserver(resizeScrollArea);
        if (sizeRef.current?.parentElement)
            resizeObserver.observe(sizeRef.current.parentElement);

        sizeRef.current?.parentElement?.addEventListener("scroll", resizeScrollArea);

        return () => {
            resizeObserver.disconnect();
            sizeRef.current?.parentElement?.removeEventListener("scroll", resizeScrollArea);
        };
    }, [sizeRef.current?.parentElement?.scrollLeft, sizeRef.current?.parentElement?.clientWidth, sizeRef.current?.parentElement?.scrollTop, sizeRef.current?.parentElement?.clientHeight, sizeRef.current?.parentElement]);

    return (
        <GraphContext.Provider value={{ nodes, setPreviewEdge, addEdge, currentlyDraggingNode }}>
            <Button onClick={() => {
                executeGraph(nodes, edges, updatenodeState);
            }}>Execute</Button>
            <div
                ref={graphRef}
                className={cn("relative rounded bg-background text-foreground p-0 shadow-md overflow-scroll w-full aspect-video",
                    currentlyDraggingNode ? "cursor-grabbing" : undefined,
                    dragStart != null ? "cursor-grab" : undefined)}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseDown={onMouseDown}
                onMouseLeave={stopDragging}
            >
                <div className="w-full h-full pointer-events-none" ref={sizeRef} />
                <svg
                    className="sticky inset-0 w-full h-full pointer-events-none z-20"
                >
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
                                    x: e.clientX - (graphRef.current?.offsetLeft || 0),
                                    y: e.clientY - (graphRef.current?.offsetTop || 0),
                                },
                                offset: {
                                    x: nodeState.position.x - (e.clientX - (graphRef.current?.offsetLeft || 0)),
                                    y: nodeState.position.y - (e.clientY - (graphRef.current?.offsetTop || 0)),
                                },
                            });
                            dragRef.current.current = e.currentTarget;
                        }}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                    />
                ))}
            </div>
        </GraphContext.Provider>
    );
}


