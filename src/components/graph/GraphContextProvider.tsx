"use client";

import { NodeState } from "@/lib/graph/NodeState";
import { Position } from "@/lib/graph/Position.type";
import { PreviewEdge } from "@/lib/graph/PreviewEdge.type";
import { create, StoreApi, useStore } from "zustand";
import { NodeIOIdentifier } from "./NodeIO";
import { createContext, useContext } from "react";
import { subscribeWithSelector } from "zustand/middleware";
import { deepEqual } from "@/lib/graph/deepEqual";
import { createNode } from "@/lib/graph/CreateNode.factory";
import { NODE_TYPE } from "@/lib/graph/NodeDefinitions";

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
  addNode: (node: NodeState<any, any>) => void;
  addNodeFromDefinition: (nodeDefinitionKey: NODE_TYPE, position: Position) => void;
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
  generateUniqueNodeId: () => string;
  sortGraph: (nodeSpacingX?: number, nodeSpacingY?: number, nodeOffsetX?: number, nodeOffsetY?: number) => void;
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
      if(self.crypto === undefined || self.crypto.randomUUID === undefined) {
        console.warn("crypto.randomUUID is not available, using fallback for unique node IDs.");
        return get().nodeIds.length.toString() + "_" + Math.random().toString(36).substring(2, 15);
      }

      return get().nodeIds.length.toString() + "_" + self.crypto.randomUUID();
    },
    sortGraph: (nodeSpacingX = 250, nodeSpacingY = 180, nodeOffsetX = 50, nodeOffsetY = 50) => {
      const state = get();
      const { nodes, edges, inputNodeIds, outputNodeIds } = state;

      const positions = new Map<string, Position>();
      const NODE_HEIGHT = 100;

      const buildAdjacencyList = () => {
        const adj = new Map<string, Set<string>>();
        const incoming = new Map<string, Set<string>>();

        nodes.forEach((node, id) => {
          adj.set(id, new Set());
          incoming.set(id, new Set());
        });

        edges.forEach(edge => {
          if (edge.toIO) {
            adj.get(edge.fromIO.nodeId)?.add(edge.toIO.nodeId);
            incoming.get(edge.toIO.nodeId)?.add(edge.fromIO.nodeId);
          }
        });

        return { adj, incoming };
      };

      const { adj, incoming } = buildAdjacencyList();
      const levels = new Map<string, number>();

      const visited = new Set<string>();
      const queue: { nodeId: string; level: number }[] = [];

      inputNodeIds.forEach(nodeId => {
        levels.set(nodeId, 0);
        queue.push({ nodeId, level: 0 });
      });

      while (queue.length > 0) {
        const { nodeId, level } = queue.shift()!;

        if (visited.has(nodeId)) continue;
        visited.add(nodeId);

        const currentLevel = levels.get(nodeId) ?? level;
        levels.set(nodeId, currentLevel);

        adj.get(nodeId)?.forEach(neighborId => {
          const neighborLevel = levels.get(neighborId) ?? 0;
          if (currentLevel + 1 > neighborLevel) {
            levels.set(neighborId, currentLevel + 1);
          }
          queue.push({ nodeId: neighborId, level: currentLevel + 1 });
        });
      }

      const nodesByLevel = new Map<number, string[]>();
      levels.forEach((level, nodeId) => {
        if (!nodesByLevel.has(level)) {
          nodesByLevel.set(level, []);
        }
        nodesByLevel.get(level)!.push(nodeId);
      });

      const maxLevel = Math.max(...levels.values());

      for (let level = 0; level <= maxLevel; level++) {
        const nodeIdsAtLevel = nodesByLevel.get(level) || [];

        if (level === 0) {
          nodeIdsAtLevel.forEach((nodeId, index) => {
            const node = nodes.get(nodeId);
            if (!node) return;

            positions.set(nodeId, {
              x: nodeOffsetX,
              y: nodeOffsetY + index * nodeSpacingY,
            });
          });
        } else {
          const idealPositions = new Map<string, number>();

          nodeIdsAtLevel.forEach(nodeId => {
            const parents = incoming.get(nodeId);
            
            if (parents && parents.size > 0) {
              let parentSum = 0;
              let parentCount = 0;

              parents.forEach(parentId => {
                const parentPos = positions.get(parentId);
                if (parentPos) {
                  parentSum += parentPos.y;
                  parentCount++;
                }
              });

              const idealY = parentCount > 0 ? parentSum / parentCount : nodeOffsetY;
              idealPositions.set(nodeId, idealY);
            } else {
              idealPositions.set(nodeId, nodeOffsetY);
            }
          });

          const sortedNodeIds = nodeIdsAtLevel.toSorted((a, b) => {
            const idealA = idealPositions.get(a) ?? 0;
            const idealB = idealPositions.get(b) ?? 0;
            return idealA - idealB;
          });

          const levelPositions = new Map<string, number>();
          let currentY = nodeOffsetY;

          sortedNodeIds.forEach(nodeId => {
            const idealY = idealPositions.get(nodeId) ?? nodeOffsetY;
            currentY = Math.max(currentY, idealY);
            levelPositions.set(nodeId, currentY);
            currentY += nodeSpacingY;
          });

          const nodeRects = new Map<string, { y: number; height: number }>();
          levelPositions.forEach((y, nodeId) => {
            nodeRects.set(nodeId, { y, height: NODE_HEIGHT });
          });

          const sortedByY = sortedNodeIds.toSorted((a, b) => {
            const posA = levelPositions.get(a) ?? 0;
            const posB = levelPositions.get(b) ?? 0;
            return posA - posB;
          });

          for (let i = 0; i < sortedByY.length; i++) {
            const nodeId = sortedByY[i];
            const currentRect = nodeRects.get(nodeId);
            if (!currentRect) continue;

            for (let j = i + 1; j < sortedByY.length; j++) {
              const nextNodeId = sortedByY[j];
              const nextRect = nodeRects.get(nextNodeId);
              if (!nextRect) continue;

              if (currentRect.y + currentRect.height > nextRect.y) {
                const overlap = currentRect.y + currentRect.height - nextRect.y;
                const shift = overlap + 10;

                nextRect.y += shift;

                nodeRects.set(nextNodeId, nextRect);
              }
            }
          }

          levelPositions.forEach((y, nodeId) => {
            const node = nodes.get(nodeId);
            if (!node) return;

            let x: number;
            if (node.type === "output") {
              x = nodeOffsetX + (levels.get(nodeId) ?? 0) * nodeSpacingX + 100;
            } else {
              x = nodeOffsetX + (levels.get(nodeId) ?? 0) * nodeSpacingX;
            }

            const finalY = nodeRects.get(nodeId)?.y ?? y;
            positions.set(nodeId, { x, y: finalY });
          });
        }
      }

      const looseNodes: string[] = [];
      nodes.forEach((node, nodeId) => {
        if (!levels.has(nodeId)) {
          looseNodes.push(nodeId);
        }
      });

      if (looseNodes.length > 0) {
        let maxY = 0;
        positions.forEach(pos => {
          maxY = Math.max(maxY, pos.y);
        });

        const looseY = maxY + nodeSpacingY + 50;
        const looseStartX = nodeOffsetX;

        looseNodes.forEach((nodeId, index) => {
          const node = nodes.get(nodeId);
          if (!node) return;

          positions.set(nodeId, {
            x: looseStartX + index * nodeSpacingX,
            y: looseY,
          });
        });
      }

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
    }
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
