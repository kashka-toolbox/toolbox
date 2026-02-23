import { NodeState } from "./NodeState";
import { Position } from "./Position.type";
import { NodeIOIdentifier } from "@/components/graph/NodeIO";

export type Edge = {
  fromIO: NodeIOIdentifier;
  toIO?: NodeIOIdentifier;
};

const NODE_HEIGHT = 100;

function buildAdjacencyList(
  nodes: Map<string, NodeState<any, any>>,
  edges: Edge[]
) {
  const adj = new Map<string, Set<string>>();
  const incoming = new Map<string, Set<string>>();

  nodes.forEach((_, id) => {
    adj.set(id, new Set());
    incoming.set(id, new Set());
  });

  edges.forEach((edge) => {
    if (edge.toIO) {
      adj.get(edge.fromIO.nodeId)?.add(edge.toIO.nodeId);
      incoming.get(edge.toIO.nodeId)?.add(edge.fromIO.nodeId);
    }
  });

  return { adj, incoming };
}

function assignLevels(
  inputNodeIds: string[],
  adj: Map<string, Set<string>>
): Map<string, number> {
  const levels = new Map<string, number>();
  const visited = new Set<string>();
  const queue: { nodeId: string; level: number }[] = [];

  inputNodeIds.forEach((nodeId) => {
    levels.set(nodeId, 0);
    queue.push({ nodeId, level: 0 });
  });

  while (queue.length > 0) {
    const { nodeId, level } = queue.shift()!;

    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const currentLevel = levels.get(nodeId) ?? level;
    levels.set(nodeId, currentLevel);

    adj.get(nodeId)?.forEach((neighborId) => {
      const neighborLevel = levels.get(neighborId) ?? 0;
      if (currentLevel + 1 > neighborLevel) {
        levels.set(neighborId, currentLevel + 1);
      }
      queue.push({ nodeId: neighborId, level: currentLevel + 1 });
    });
  }

  return levels;
}

function groupNodesByLevel(levels: Map<string, number>): Map<number, string[]> {
  const nodesByLevel = new Map<number, string[]>();
  levels.forEach((level, nodeId) => {
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)!.push(nodeId);
  });
  return nodesByLevel;
}

function resolveCollisions(
  sortedByY: string[],
  levelPositions: Map<string, number>,
  nodeRects: Map<string, { y: number; height: number }>
): void {
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
}

function calculateIdealYPositions(
  nodeIdsAtLevel: string[],
  incoming: Map<string, Set<string>>,
  positions: Map<string, Position>,
  nodeOffsetY: number
): Map<string, number> {
  const idealPositions = new Map<string, number>();

  nodeIdsAtLevel.forEach((nodeId) => {
    const parents = incoming.get(nodeId);

    if (parents && parents.size > 0) {
      let parentSum = 0;
      let parentCount = 0;

      parents.forEach((parentId) => {
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

  return idealPositions;
}

function layoutLevel(
  nodeIdsAtLevel: string[],
  incoming: Map<string, Set<string>>,
  positions: Map<string, Position>,
  nodes: Map<string, NodeState<any, any>>,
  level: number,
  nodeSpacingX: number,
  nodeSpacingY: number,
  nodeOffsetX: number,
  nodeOffsetY: number
): void {
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
    const idealPositions = calculateIdealYPositions(
      nodeIdsAtLevel,
      incoming,
      positions,
      nodeOffsetY
    );

    const sortedNodeIds = nodeIdsAtLevel.toSorted((a, b) => {
      const idealA = idealPositions.get(a) ?? 0;
      const idealB = idealPositions.get(b) ?? 0;
      return idealA - idealB;
    });

    const levelPositions = new Map<string, number>();
    let currentY = nodeOffsetY;

    sortedNodeIds.forEach((nodeId) => {
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

    resolveCollisions(sortedByY, levelPositions, nodeRects);

    levelPositions.forEach((y, nodeId) => {
      const node = nodes.get(nodeId);
      if (!node) return;

      let x: number;
      if (node.type === "output") {
        x = nodeOffsetX + (level) * nodeSpacingX + 100;
      } else {
        x = nodeOffsetX + (level) * nodeSpacingX;
      }

      const finalY = nodeRects.get(nodeId)?.y ?? y;
      positions.set(nodeId, { x, y: finalY });
    });
  }
}

function layoutLooseNodes(
  nodes: Map<string, NodeState<any, any>>,
  levels: Map<string, number>,
  positions: Map<string, Position>,
  nodeSpacingX: number,
  nodeSpacingY: number,
  nodeOffsetX: number,
  nodeOffsetY: number
): void {
  const looseNodes: string[] = [];
  nodes.forEach((_, nodeId) => {
    if (!levels.has(nodeId)) {
      looseNodes.push(nodeId);
    }
  });

  if (looseNodes.length > 0) {
    let maxY = 0;
    positions.forEach((pos) => {
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
}

export function sortGraph(
  nodes: Map<string, NodeState<any, any>>,
  edges: Edge[],
  inputNodeIds: string[],
  outputNodeIds: string[],
  nodeSpacingX: number = 250,
  nodeSpacingY: number = 180,
  nodeOffsetX: number = 50,
  nodeOffsetY: number = 50
): Map<string, Position> {
  const positions = new Map<string, Position>();

  const { adj, incoming } = buildAdjacencyList(nodes, edges);
  const levels = assignLevels(inputNodeIds, adj);
  const nodesByLevel = groupNodesByLevel(levels);

  const maxLevel = Math.max(...levels.values());

  for (let level = 0; level <= maxLevel; level++) {
    const nodeIdsAtLevel = nodesByLevel.get(level) || [];
    layoutLevel(
      nodeIdsAtLevel,
      incoming,
      positions,
      nodes,
      level,
      nodeSpacingX,
      nodeSpacingY,
      nodeOffsetX,
      nodeOffsetY
    );
  }

  layoutLooseNodes(
    nodes,
    levels,
    positions,
    nodeSpacingX,
    nodeSpacingY,
    nodeOffsetX,
    nodeOffsetY
  );

  return positions;
}
