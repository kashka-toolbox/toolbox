"use client";

import { NodeState } from "@/lib/graph/NodeState";
import { Position } from "@/lib/graph/Position.type";
import { PreviewEdge } from "@/lib/graph/PreviewEdge.type";
import { create, StoreApi, useStore } from "zustand";
import { NodeIOIdentifier } from "./NodeIO";
import { createContext, useContext } from "react";
import { subscribeWithSelector } from 'zustand/middleware';

type Edge = {
    fromIO: NodeIOIdentifier;
    toIO?: NodeIOIdentifier;
};



export type GraphState = {
    nodes: NodeState<any, any>[];
    edges: Edge[];
    previewEdge: PreviewEdge | null;

    // actions
    setNodes: (nodes: NodeState<any, any>[]) => void;
    addEdge: (fromIO: NodeIOIdentifier, toIO: NodeIOIdentifier) => void;
    setPreviewEdge: (edge: PreviewEdge | null) => void;
    setNodePosition: (id: string, position: Position) => void;
    updateNodeState: (nodeId: string, newState: Partial<NodeState<any, any>>) => void;
    initialize: (initialNodeStates: NodeState<any, any>[], initialEdges: Edge[]) => void;
};

// Create a factory function that returns a NEW store instance each time it's called
export const createGraphStore = (): StoreApi<GraphState> => 
    create<GraphState>()(subscribeWithSelector((set, get) => ({
        nodes: [],
        edges: [],
        previewEdge: null,
        currentlyDraggingNode: null,

        setNodes: (nodes) => set({ nodes }),
        addEdge: (fromIO, toIO) =>
            set((s) => ({ edges: [...s.edges, { fromIO, toIO }] })),
        setPreviewEdge: (edge) => set({ previewEdge: edge }),
        setNodePosition: (id, position) =>
            set((s) => ({
                nodes: s.nodes.map((n) => (n.id === id ? { ...n, position } : n)),
            })),
        updateNodeState: (nodeId, newState) =>
            set((s) => ({
                nodes: s.nodes.map((n) => (n.id === nodeId ? { ...n, ...newState } : n)),
            })),
        initialize: (initialNodeStates, initialEdges) => set({ nodes: initialNodeStates, edges: initialEdges }),
    })));

// GraphStoreContext
export const GraphStoreContext = createContext<StoreApi<GraphState> | null>(null);

type UseGraphSelect<Selector> = Selector extends (state: GraphState) => infer R ? R : never;

export const useGraphStore = <Selector extends (state: GraphState) => any>(selector: Selector): UseGraphSelect<Selector> => {
  const store = useContext(GraphStoreContext);
  if (!store) {
    throw new Error('Missing GraphStoreContext');
  }
  return useStore(store, selector);
};

export const useCurrentGraphStore = (): StoreApi<GraphState> => {
    const store = useContext(GraphStoreContext);
    if (!store) {
      throw new Error('Missing GraphStoreContext');
    }
    return store;
}


export const useNodeState = <R = NodeState<any, any> | undefined>(
  nodeId: string,
  selector: (node: NodeState<any, any> | undefined) => R = (node) => node as unknown as R
): R => {
  return useGraphStore((state) => {
    const node = state.nodes.find((n) => n.id === nodeId) as NodeState<any, any> | undefined;
    return selector(node);
  });
};