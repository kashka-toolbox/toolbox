import { NodeIOIdentifier } from "@/components/graph/NodeIO";
import { Position } from "@/lib/graph/Position.type";

export type PreviewEdge = {
    fromIO?: NodeIOIdentifier;
    toIO?: NodeIOIdentifier;
    dragStartPosition: Position;
    currentDragPosition: Position;
};
