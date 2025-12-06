import { Node } from "@/components/graph/Node";
import {
    NODE_INPUT_IO_NAME,
    NODE_OUTPUT_IO_NAME,
} from "@/lib/graph/NodeDefinitions";
import { useCanvasDrag } from "@/lib/graph/useCanvasDrag";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import {
    useCurrentGraphStore,
    useInputNodeIds,
    useNodeIds,
    useNodeState,
} from "./GraphContextProvider";
import { GraphEdges } from "./GraphEdges";
import { GraphInfiniteCanvasScroll } from "./GraphInfiniteCanvasScroll";
import { Dialog, DialogTitle } from "@radix-ui/react-dialog";
import { DialogContent } from "../ui/dialog";
import { CommandAndNavigationCommand } from "../ui/CommandAndNavigationCommand";
import { Command } from "cmdk";
import { CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "../ui/command";
import { CubeIcon } from "@radix-ui/react-icons";
import { AddNodeDialog } from "./addNodeDialog";

export function Graph({ }: {}) {
    const graphRef = useRef<HTMLDivElement>(null);

    const nodeIDs = useNodeIds();

    const {
        onStartDragCanvas,
        onMouseMoveDragCanvas,
        onEndDraggingCanvas,
        isCurrentlyDragging,
    } = useCanvasDrag(graphRef);

    const graphRefOffsets = useRef({ left: 0, top: 0 });
    useEffect(() => {
        graphRefOffsets.current.left = graphRef.current?.offsetLeft ?? 0;
    }, [graphRef.current?.offsetLeft]);
    useEffect(() => {
        graphRefOffsets.current.top = graphRef.current?.offsetTop ?? 0;
    }, [graphRef.current?.offsetTop]);

    const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button === 0 && e.target === graphRef.current) {
            e.preventDefault();
            e.stopPropagation();
            onStartDragCanvas(e);
        }
    }, [graphRef]);

    const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        onMouseMoveDragCanvas(e);
    }, [graphRefOffsets, onMouseMoveDragCanvas]);

    const onMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        onEndDraggingCanvas(e);
    }, [onEndDraggingCanvas]);

    console.info("Render Graph", Date.now());

    return (
        <div
            ref={graphRef}
            className={cn(
                "relative rounded-md bg-background text-foreground p-0 shadow-md overflow-scroll w-full aspect-video border border-border",
                isCurrentlyDragging ? "cursor-grab" : undefined,
            )}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseDown={onMouseDown}
            onMouseLeave={onEndDraggingCanvas}
        >
            <AddNodeDialog graphRef={graphRef} />
            <GraphInfiniteCanvasScroll />
            <GraphEdges graphRef={graphRef} />
            {nodeIDs.map((nodeId) => (
                <Node
                    key={nodeId}
                    nodeId={nodeId}
                    graphRefOffsets={graphRefOffsets}
                />
            ))}
        </div>
    );
}

export function GraphInputs({ }: {}) {
    const inputNodeIDs = useInputNodeIds();

    return (
        <>
            {inputNodeIDs.map((nodeId) => (
                <GraphUiInput
                    key={nodeId}
                    nodeId={nodeId}
                />
            ))}
        </>
    );
}

export function GraphUiInput({ nodeId }: { nodeId: string }) {
    const node = useNodeState(nodeId);
    const updateNodeState = useCurrentGraphStore().getState().updateNodeState;

    if (!node) {
        console.error("Node not found:", nodeId);
        return (
            <div>
                This is a bug. Node not found:{" "}
                {nodeId}. Please report it on GitHub.
            </div>
        );
    }

    const nodeOutputState = node?.state[NODE_INPUT_IO_NAME];

    if (node.name == "input.numeric") {
        return (
            <Input
                key={nodeId}
                value={nodeOutputState ?? 0}
                type="number"
                onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value === "" ? "" : Number(value);
                    updateNodeState(nodeId, {
                        state: {
                            ...node.state,
                            [NODE_INPUT_IO_NAME]: numericValue,
                        },
                    });
                }}
                placeholder={`Numeric input for node ${nodeId}`}
            />
        );
    }

    return (
        <Input
            key={nodeId}
            value={nodeOutputState ?? ""}
            type="text"
            onChange={(e) => {
                updateNodeState(nodeId, {
                    state: {
                        ...node.state,
                        [NODE_INPUT_IO_NAME]: e.target.value,
                    },
                });
            }}
            placeholder={`Input for node ${nodeId}`}
        />
    );
}

export function GraphOutputs({ }: {}) {
    const outputNodeIDs = useCurrentGraphStore().getState().outputNodeIds;

    return (
        <>
            {outputNodeIDs.map((nodeId) => (
                <GraphUiOutput
                    key={nodeId}
                    nodeId={nodeId}
                />
            ))}
        </>
    );
}

export function GraphUiOutput({ nodeId }: { nodeId: string }) {
    const node = useNodeState(nodeId);

    if (!node) {
        console.error("Node not found:", nodeId);
        return (
            <div>
                This is a bug. Node not found: {nodeId}. Please report it on GitHub.
            </div>
        );
    }

    const nodeOutputState = node?.state[NODE_OUTPUT_IO_NAME];

    if (node.name == "input.numeric") {
        return (
            <Input
                key={nodeId}
                value={nodeOutputState ?? 0}
                type="number"
                readOnly={true}
                placeholder={`Numeric input for node ${nodeId}`}
            />
        );
    }

    return (
        <Input
            key={nodeId}
            value={nodeOutputState ?? ""}
            type="text"
            readOnly={true}
            placeholder={`No output produced yet.`}
        />
    );
}
