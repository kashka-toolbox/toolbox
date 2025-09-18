import { NodeState } from "@/lib/graph/NodeState";
import { Position } from "@/lib/graph/Position.type";
import { PreviewEdge } from "@/lib/graph/PreviewEdge.type";
import { createContext, Dispatch, SetStateAction, useState } from "react";
import { NodeIOIdentifier } from "./NodeIO";

const notYetImplemented = () => {
    throw new Error("Not yet implemented");
};

export const GraphContext = createContext<{
    nodes: NodeState<any, any>[];
    edges: {
        fromIO: NodeIOIdentifier;
        toIO?: NodeIOIdentifier;
    }[];
    setNodes: Dispatch<SetStateAction<NodeState<any, any>[]>>;
    setCurrentlyDraggingNode: Dispatch<
        SetStateAction<
            {
                nodeId: string;
                startPosition: Position;
                offset: Position;
            } | null
        >
    >;
    /**
     * Sets the preview edge for the graph, that the user can see while dragging an edge.
     */
    setPreviewEdge: (edge: PreviewEdge | null) => void;
    addEdge: (fromIO: NodeIOIdentifier, toIO: NodeIOIdentifier) => void;
    setNodePosition: (id: string, position: {
        x: number;
        y: number;
    }) => void;
    updateNodeState: (nodeId: string, newState: Partial<NodeState<any, any>>) => void
    currentlyDraggingNode?: {
        nodeId: string;
        startPosition: Position;
        offset: Position;
    } | null;
    previewEdge: PreviewEdge | null;
}>({
    nodes: [],
    edges: [],
    previewEdge: null,
    currentlyDraggingNode: null,
    setNodes: notYetImplemented,
    setNodePosition: notYetImplemented,
    addEdge: notYetImplemented,
    setPreviewEdge: notYetImplemented,
    setCurrentlyDraggingNode: notYetImplemented,
    updateNodeState: notYetImplemented
});

export function GraphContextProvider(
    { children, initialNodeStates }: {
        children: React.ReactNode;
        initialNodeStates: NodeState<any, any>[];
    },
) {
    const [nodes, setNodes] = useState<NodeState<any, any>[]>(
        initialNodeStates,
    );

    const [edges, setEdges] = useState<{
        fromIO: NodeIOIdentifier;
        toIO?: NodeIOIdentifier;
    }[]>([]);

    const [currentlyDraggingNode, setCurrentlyDraggingNode] = useState<
        { nodeId: string; startPosition: Position; offset: Position } | null
    >(null);

    const [previewEdge, setPreviewEdge] = useState<PreviewEdge | null>(null);

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

    const updateNodeState = (
        nodeId: string,
        newState: Partial<NodeState<any, any>>,
    ) => {
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.id === nodeId ? { ...node, ...newState } : node
            )
        );
    };

    return (
        <GraphContext.Provider
            value={{
                nodes,
                edges,
                setNodes,
                setPreviewEdge,
                addEdge,
                setCurrentlyDraggingNode,
                currentlyDraggingNode,
                setNodePosition,
                previewEdge,
                updateNodeState,
            }}
        >
            {children}
        </GraphContext.Provider>
    );
}
