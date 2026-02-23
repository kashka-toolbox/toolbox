import { Node } from "@/components/graph/Node";
import {
    NODE_INPUT_IO_NAME,
    NODE_OUTPUT_IO_NAME,
} from "@/lib/graph/NodeDefinitions";
import { useCanvasDrag } from "@/lib/graph/useCanvasDrag";
import { useZoom } from "@/lib/graph/useZoom";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";
import { Input } from "../ui/input";
import { AddNodeDialog } from "./addNodeDialog";
import {
    useCurrentGraphStore,
    useGraphStore,
    useInputNodeIds,
    useNodeIds,
    useNodeState,
    useOutputNodeIds,
} from "./GraphContextProvider";
import { GraphEdges } from "./GraphEdges";
import { GraphInfiniteCanvasScroll } from "./GraphInfiniteCanvasScroll";
import { CopyToClipboard } from "../ui/copyToClipboard";
import { ZoomControls } from "./ZoomControls";

export function Graph({ }: {}) {
    const graphRef = useRef<HTMLDivElement>(null);

    const nodeIDs = useNodeIds();
    const scale = useGraphStore((state) => state.scale);
    const panOffset = useGraphStore((state) => state.panOffset);

    const {
        onStartDragCanvas,
        onMouseMoveDragCanvas,
        onEndDraggingCanvas,
        isCurrentlyDragging,
    } = useCanvasDrag(graphRef);

    useZoom(graphRef);

    const graphRefOffsets = useRef({ left: 0, top: 0 });
    useEffect(() => {
        graphRefOffsets.current.left = graphRef.current?.offsetLeft ?? 0;
    }, [graphRef.current?.offsetLeft]);
    useEffect(() => {
        graphRefOffsets.current.top = graphRef.current?.offsetTop ?? 0;
    }, [graphRef.current?.offsetTop]);

    const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        const target = e.target as HTMLElement;
        const isInteractive = target.closest('[data-node-dragable-handle], .node, button, input, [data-io-identifier]');
        if (!isInteractive) {
            e.preventDefault();
            e.stopPropagation();
            onStartDragCanvas(e);
        }
    }, [onStartDragCanvas]);

    const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        onMouseMoveDragCanvas(e);
    }, [onMouseMoveDragCanvas]);

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
                "relative rounded-md bg-background text-foreground p-0 shadow-md overflow-hidden w-full aspect-video border border-border",
                isCurrentlyDragging ? "cursor-grabbing" : "cursor-grab",
            )}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseDown={onMouseDown}
            onMouseLeave={onEndDraggingCanvas}
        >
            <div
                className="absolute inset-0"
                style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
                    transformOrigin: "0 0",
                }}
            >
                <AddNodeDialog graphRef={graphRef} />
                <GraphInfiniteCanvasScroll scale={scale} panOffset={panOffset} />
                <GraphEdges graphRef={graphRef} />
                {nodeIDs.map((nodeId) => (
                    <Node
                        key={nodeId}
                        nodeId={nodeId}
                        graphRefOffsets={graphRefOffsets}
                    />
                ))}
            </div>
            <ZoomControls className="absolute bottom-2 right-2 z-30" />
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
    const outputNodeIDs = useOutputNodeIds();

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

    return (
        <span className="flex flex-row items-center gap-2 w-full">
            <Input
                key={nodeId}
                value={nodeOutputState ?? ""}
                type="text"
                readOnly={true}
                placeholder={`No output produced yet.`}
            />
            <CopyToClipboard clipboardContent={nodeOutputState} className="mt-[1px]" />
        </span>
    );
}
