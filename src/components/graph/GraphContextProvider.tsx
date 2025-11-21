"use client";

import { NodeState } from "@/lib/graph/NodeState";
import { Position } from "@/lib/graph/Position.type";
import { PreviewEdge } from "@/lib/graph/PreviewEdge.type";
import { create, StoreApi, useStore } from "zustand";
import { NodeIOIdentifier } from "./NodeIO";
import { createContext, useContext } from "react";
import { subscribeWithSelector } from "zustand/middleware";
import { deepEqual } from "@/lib/graph/deepEqual";

type Edge = {
  fromIO: NodeIOIdentifier;
  toIO?: NodeIOIdentifier;
};

export type GraphState = {
  nodes: Map<string, NodeState<any, any>>;
  nodeIds: string[];
  inputNodeIds: string[];
  outputNodeIds: string[];
  edges: Edge[];
  previewEdge: PreviewEdge | null;

  // actions
  // setNodes: (nodes: NodeState<any, any>[]) => void;
  removeNodeAndConnectedEdges: (nodeId: string) => void;
  addEdge: (fromIO: NodeIOIdentifier, toIO: NodeIOIdentifier) => void;
  setPreviewEdge: (edge: PreviewEdge | null) => void;
  updatePreviewEdge: (edge: Partial<PreviewEdge>) => void;
  setNodePosition: (id: string, position: Position) => void;
  updateNodeState: (
    nodeId: string,
    newState: Partial<NodeState<any, any>>,
  ) => void;
  initialize: (
    initialNodeStates: NodeState<any, any>[],
    initialEdges: Edge[],
  ) => void;
};

// Create a factory function that returns a NEW store instance each time it's called
export const createGraphStore = (): StoreApi<GraphState> =>
  create<GraphState>()(subscribeWithSelector((set, get) => ({
    nodes: new Map<string, NodeState<any, any>>(),
    nodeIds: [],
    inputNodeIds: [],
    outputNodeIds: [],
    edges: [],
    previewEdge: null,
    currentlyDraggingNode: null,

    removeNodeAndConnectedEdges: (nodeId) =>
      set((s) => ({
        nodes: (() => {
          const newNodes = new Map(s.nodes);
          newNodes.delete(nodeId);
          return newNodes;
        })(),
        edges: s.edges.filter(
          (edge) =>
            edge.fromIO.nodeId !== nodeId && edge.toIO?.nodeId !== nodeId,
        ),
        nodeIds: s.nodeIds.filter((id) => id !== nodeId),
        inputNodeIds: s.inputNodeIds.filter((id) => id !== nodeId),
        outputNodeIds: s.outputNodeIds.filter((id) => id !== nodeId),
      })),
    addEdge: (fromIO, toIO) =>
      set((s) => ({ edges: [...s.edges, { fromIO, toIO }] })),
    setPreviewEdge: (edge) => set({ previewEdge: edge }),
    updatePreviewEdge: (edge) => {
      if (edge === null) return;

      set((s) => {
        const newPreviewEdge = { ...s.previewEdge, ...edge } as PreviewEdge;

        if (!deepEqual(s.previewEdge, newPreviewEdge)) { // reduce rerenders
          return { previewEdge: newPreviewEdge };
        }

        return {};
      });
    },
    setNodePosition: (id, position) => {
      const node = get().nodes.get(id);
      if (!node) {
        throw new ReferenceError(
          `Node with id ${id} not found in setNodePosition`,
        );
      }
      set((s) => ({
        nodes: new Map(s.nodes).set(id, { ...node, position }),
      }));
    },
    updateNodeState: (nodeId, newState) =>
      set((s) => {
        const node = s.nodes.get(nodeId);
        if (!node) {
          throw new ReferenceError(
            `Node with id ${nodeId} not found in updateNodeState`,
          );
        }
        const updatedNode = { ...node, ...newState };
        return {
          nodes: new Map(s.nodes).set(nodeId, updatedNode),
        };
      }),
    initialize: (initialNodeStates, initialEdges) =>
      set({
        nodes: new Map(initialNodeStates.map((node) => [node.id, node])),
        nodeIds: initialNodeStates.map((node) => node.id).toSorted(),
        inputNodeIds: initialNodeStates
          .filter((node) => node.type === "input")
          .map((node) => node.id)
          .toSorted(),
        outputNodeIds: initialNodeStates
          .filter((node) => node.type === "output")
          .map((node) => node.id)
          .toSorted(),
        edges: initialEdges,
      }),
  })));

// GraphStoreContext
export const GraphStoreContext = createContext<StoreApi<GraphState> | null>(
  null,
);

type UseGraphSelect<Selector> = Selector extends (state: GraphState) => infer R
  ? R
  : never;

export const useGraphStore = <Selector extends (state: GraphState) => any>(
  selector: Selector,
): UseGraphSelect<Selector> => {
  const store = useContext(GraphStoreContext);
  if (!store) {
    throw new Error("Missing GraphStoreContext");
  }
  return useStore(store, selector);
};

export const useCurrentGraphStore = (): StoreApi<GraphState> => {
  const store = useContext(GraphStoreContext);
  if (!store) {
    throw new Error("Missing GraphStoreContext");
  }
  return store;
};

export const useNodeState = <R = NodeState<any, any> | undefined>(
  nodeId: string,
  selector: (node: NodeState<any, any> | undefined) => R = (node) =>
    node as unknown as R,
): R => {
  return useGraphStore((state) => {
    const node = state.nodes.get(nodeId);
    return selector(node);
  });
};

export const useNodeIds: () => string[] = () => {
  return useGraphStore((state) => state.nodeIds);
};

export const useInputNodeIds: () => string[] = () => {
  return useGraphStore((state) => state.inputNodeIds);
};

export const useOutputNodeIds: () => string[] = () => {
  return useGraphStore((state) => state.outputNodeIds);
};
