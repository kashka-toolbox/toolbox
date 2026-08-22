"use client";

import { Position } from "@/lib/graph/Position.type";
import { cn } from "@/lib/utils";
import "@/styles/node.css";
import { Separator } from "@radix-ui/react-separator";
import { useTranslations } from "next-intl";
import { MutableRefObject, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useGraphStore, useNodeState } from "./GraphContextProvider";
import { NodeIO } from "./NodeIO";
import { NodeIOLabel } from "./NodeIOLabel";
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuSeparator } from "../ui/context-menu";
import { ContextMenuTrigger } from "@radix-ui/react-context-menu";
import { EditNodeSettingsDialog } from "./editNodeSettingsDialog";
import { NodeState } from "@/lib/graph/NodeState";
import { NODE_SETTING_UI_LABEL_TEXT } from "@/lib/graph/NodeSettings";

export function Node({
    nodeId,
    graphRefOffsets,
}: {
    nodeId: string;
    graphRefOffsets: MutableRefObject<{
        left: number;
        top: number;
    }>;
}) {
    const t = useTranslations("graph");

    const addEdge = useGraphStore((store) => store.addEdge);
    const setNodePosition = useGraphStore((store) => store.setNodePosition);
    const removeNode = useGraphStore((store) => store.removeNodeAndConnectedEdges);
    const scale = useGraphStore((store) => store.scale);
    const panOffset = useGraphStore((store) => store.panOffset);

    const [isBeingDragged, setBeingDragged] = useState<boolean>(false);

    const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

    const nodeState = useNodeState(nodeId)!;
    const nodeDisplayName = nodeState.settings[NODE_SETTING_UI_LABEL_TEXT]?.value ?? undefined;

    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
    const [isNodeSettingsInContextMenu, setNodeSettingsInContextMenu] = useState(true);

    const inputs = nodeState.inputs.map((input: any, index: number) => (
        <NodeIOLabel
            key={input.name}
            type="input"
            data_type={input.type}
            ioTranslationKey={input.translationKey}
            nodeIOIdentifier={{ nodeId: nodeState.id, nodeIOName: input.name }}
        >
            <NodeIO
                key={input.name}
                type="input"
                data_type={input.type}
                onConnectNodes={(fromIo, toIo) => {
                    console.log("Connecting", fromIo, "to", toIo);
                    if (addEdge) {
                        addEdge(fromIo, toIo);
                    }
                }}
                nodeId={nodeState.id}
                ioName={input.name}
            />
        </NodeIOLabel>
    ));

    const outputs = nodeState.outputs.map((output: any, index: number) => (
        <NodeIOLabel
            key={output.name}
            type="output"
            data_type={output.type}
            ioTranslationKey={output.translationKey}
            nodeIOIdentifier={{ nodeId: nodeState.id, nodeIOName: output.name }}
        >
            <NodeIO
                key={output.name}
                type="output"
                data_type={output.type}
                onConnectNodes={(fromIo, toIo) => {
                    console.log("Connecting", fromIo, "to", toIo);
                    if (addEdge) {
                        addEdge(fromIo, toIo);
                    }
                }}
                nodeId={nodeState.id}
                ioName={output.name}
            />
        </NodeIOLabel>
    ));

    useEffect(() => {
        const handleMouseUp = () => {
            if (isBeingDragged) {
                setBeingDragged(false);
            }
        };

        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isBeingDragged]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isBeingDragged) {
                const newPosition = {
                    x: (e.clientX - graphRefOffsets.current.left - panOffset.x) / scale +
                        dragOffset.x,
                    y: (e.clientY - graphRefOffsets.current.top - panOffset.y) / scale +
                        dragOffset.y,
                };
                setNodePosition(nodeState.id, newPosition);
            }
        };
        document.addEventListener("mousemove", handleMouseMove);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
        };
    }, [
        isBeingDragged,
        dragOffset,
        graphRefOffsets,
        setNodePosition,
        nodeState.id,
        scale,
        panOffset,
    ]);

    useEffect(() => {
        setNodeSettingsInContextMenu(Object.values(nodeState?.settings).length > 0);
    }, [nodeState, setNodeSettingsInContextMenu]);

    return <>
        <EditNodeSettingsDialog
            nodeId={nodeState.id}
            open={isSettingsDialogOpen}
            onOpenChange={setIsSettingsDialogOpen}
        />
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <div
                    className={cn(
                        "node",
                        nodeState.type,
                        isBeingDragged ? "node-dragging" : undefined,
                        nodeState.isProcessing ? "is-processing" : undefined,
                        isBeingDragged ? "cursor-grabbing" : "cursor-grab",
                        "text-nowrap",
                    )}
                    style={{
                        left: nodeState.position.x,
                        top: nodeState.position.y,
                        transition: "transform 0.1s ease-out",
                    }}
                    onMouseDown={(e) => {
                        if (e.button !== 0) return;

                        const target = e.target as HTMLElement;

                        if (
                            target.getAttribute("data-node-dragable-handle") ===
                            "true"
                        ) {
                            e.preventDefault();
                            e.stopPropagation();
                            setBeingDragged(true);
                            const mouseX = (e.clientX - graphRefOffsets.current.left - panOffset.x) / scale;
                            const mouseY = (e.clientY - graphRefOffsets.current.top - panOffset.y) / scale;
                            setDragOffset({
                                x: nodeState.position.x - mouseX,
                                y: nodeState.position.y - mouseY,
                            });
                        }
                    }}
                    data-node-dragable-handle="true"
                >
                    <div
                        data-node-dragable-handle="true"
                        className="p-1 bg-primary-foreground text-primary rounded"
                    >
                        {t("nodes." + nodeState.name + ".name") + (nodeDisplayName ? ": " + nodeDisplayName : "")}
                    </div>
                    {nodeState.error && (
                        <Alert variant={"destructive"} className="mt-2">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                                {nodeState.error}
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="flex flex-col gap-1 mt-2">
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-col gap-1">
                                {inputs}
                            </div>
                        </div>

                        <Separator
                            className="my-px h-px bg-primary-foreground"
                            orientation="horizontal"
                        />

                        <div className="flex flex-col gap-1">
                            <div className="flex flex-col gap-1">
                                {outputs}
                            </div>
                        </div>
                    </div>
                </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-52">
                <ContextMenuGroup>
                    {
                        isNodeSettingsInContextMenu &&
                        <ContextMenuItem variant={"default"} onClick={() => {
                            setIsSettingsDialogOpen(true);
                        }}>Node Properties</ContextMenuItem>
                    }
                    <ContextMenuItem variant={"destructive"} onClick={() => {
                        removeNode(nodeState.id);
                    }}>Delete</ContextMenuItem>
                </ContextMenuGroup>
            </ContextMenuContent>
        </ContextMenu>
    </>;
}
