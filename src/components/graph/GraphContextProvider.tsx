"use client";

import { NodeState } from "@/lib/graph/NodeState";
import { Position } from "@/lib/graph/Position.type";
import { PreviewEdge } from "@/lib/graph/PreviewEdge.type";
import { sortGraph as sortGraphAlgorithm, Edge } from "@/lib/graph/sortGraph";
import { create, StoreApi, useStore } from "zustand";
import { NodeIOIdentifier } from "./NodeIO";
import { createContext, useContext } from "react";
import { subscribeWithSelector } from "zustand/middleware";
import { deepEqual } from "@/lib/graph/deepEqual";
import { createNode } from "@/lib/graph/CreateNode.factory";
import { NODE_TYPE } from "@/lib/graph/NodeDefinitions";
import { NodeSetting } from "@/lib/graph/NodeSettings";

export type GraphState = {
  nodes: Map<string, NodeState<any, any>>;
  nodeIds: string[];
  inputNodeIds: string[];
  outputNodeIds: string[];
  edges: Edge[];
  previewEdge: PreviewEdge | null;
  scale: number;
  panOffset: Position;

  // actions
  // setNodes: (nodes: NodeState<any, any>[]) => void;
  removeNodeAndConnectedEdges: (nodeId: string) => void;
  addEdge: (fromIO: NodeIOIdentifier, toIO: NodeIOIdentifier) => void;
  addNode: (node: NodeState<any, any>) => void;
  addNodeFromDefinition: (nodeDefinitionKey: NODE_TYPE, position: Position) => void;
  setPreviewEdge: (edge: PreviewEdge | null) => void;
  updatePreviewEdge: (edge: Partial<PreviewEdge>) => void;
  setNodePosition: (id: string, position: Position) => void;
  updateNodeSetting: (
    nodeId: string,
    settingKey: string,
    setting: Partial<NodeSetting>,
  ) => void;
  updateNodeState: (
    nodeId: string,
    newState: Partial<NodeState<any, any>>,
  ) => void;
  initialize: (
    initialNodeStates: NodeState<any, any>[],
    initialEdges: Edge[],
  ) => void;
  generateUniqueNodeId: () => string;
  sortGraph: (nodeSpacingX?: number, nodeSpacingY?: number, nodeOffsetX?: number, nodeOffsetY?: number) => void;
  setScale: (scale: number) => void;
  setPanOffset: (offset: Position) => void;
  zoomTo: (delta: number, point: Position) => void;
  resetZoom: () => void;
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
    scale: 1,
    panOffset: { x: 0, y: 0 },

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
    addNode: (node) =>
      set((s) => ({
        nodes: new Map(s.nodes).set(node.id, node),
        nodeIds: [...s.nodeIds, node.id].toSorted(),
        inputNodeIds:
          node.type === "input"
            ? [...s.inputNodeIds, node.id].toSorted()
            : s.inputNodeIds,
        outputNodeIds:
          node.type === "output"
            ? [...s.outputNodeIds, node.id].toSorted()
            : s.outputNodeIds,
      })),
    addNodeFromDefinition: (nodeDefinitionKey, position) => {
      const newNode: NodeState<any, any> = createNode(nodeDefinitionKey, get().generateUniqueNodeId(), position);
      get().addNode(newNode);
    },
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
    updateNodeSetting: (
      nodeId: string,
      settingKey: string,
      setting: Partial<NodeSetting>,
    ) => {
      const node = get().nodes.get(nodeId);
      if (!node) {
        throw new ReferenceError(
          `Node with id ${nodeId} not found in setNodePosition`,
        );
      }
      set((s) => ({
        nodes: new Map(s.nodes).set(nodeId, { ...node, settings: { ...node.settings, [settingKey]: setting } }),
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
    generateUniqueNodeId: () => {
      if (self.crypto === undefined || self.crypto.randomUUID === undefined) {
        console.warn("crypto.randomUUID is not available, using fallback for unique node IDs.");
        return get().nodeIds.length.toString() + "_" + Math.random().toString(36).substring(2, 15);
      }

      return get().nodeIds.length.toString() + "_" + self.crypto.randomUUID();
    },
    sortGraph: (nodeSpacingX = 250, nodeSpacingY = 180, nodeOffsetX = 50, nodeOffsetY = 50) => {
      const state = get();
      const positions = sortGraphAlgorithm(
        state.nodes,
        state.edges,
        state.inputNodeIds,
        state.outputNodeIds,
        nodeSpacingX,
        nodeSpacingY,
        nodeOffsetX,
        nodeOffsetY
      );

      set(s => {
        const newNodes = new Map(s.nodes);
        positions.forEach((pos, nodeId) => {
          const node = newNodes.get(nodeId);
          if (node) {
            newNodes.set(nodeId, { ...node, position: pos });
          }
        });
        return { nodes: newNodes };
      });
    },
    setScale: (scale) => set({ scale: Math.max(0.1, Math.min(4, scale)) }),
    setPanOffset: (offset) => set({ panOffset: offset }),
    zoomTo: (delta, point) => {
      const { scale, panOffset } = get();
      const newScale = Math.max(0.1, Math.min(4, scale * (1 + delta)));
      const scaleFactor = newScale / scale;
      const newPanOffset = {
        x: point.x - (point.x - panOffset.x) * scaleFactor,
        y: point.y - (point.y - panOffset.y) * scaleFactor,
      };
      set({ scale: newScale, panOffset: newPanOffset });
    },
    resetZoom: () => set({ scale: 1, panOffset: { x: 0, y: 0 } })
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
