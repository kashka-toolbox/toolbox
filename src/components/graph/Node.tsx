import { NodeState } from "@/lib/graph/NodeState";
import { MouseEventHandler, useContext, useTransition } from "react";
import { NodeIO } from "./NodeIO";
import "@/styles/node.css";
import { cn } from "@/lib/utils";
import { NodeIOLabel } from "./NodeIOLabel";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useTranslations } from "next-intl";
import { Separator } from "@radix-ui/react-separator";
import { GraphContext } from "./GraphContextProvider";

export function Node({
    nodeState,
    onMouseDown,
    onMouseMove,
    onMouseUp,
}: {
    nodeState: NodeState<any, any>;
    onMouseDown: MouseEventHandler<HTMLDivElement>;
    onMouseMove: MouseEventHandler<HTMLDivElement>;
    onMouseUp: MouseEventHandler<HTMLDivElement>;
}) {
    const {
        addEdge,
        currentlyDraggingNode,
    } = useContext(GraphContext);

    const t = useTranslations("graph");

    const inputs = nodeState.inputs.map((input, index) => (
        <NodeIOLabel
            key={input.name}
            type="input"
            data_type={input.type}
            ioTranslationKey={input.translationKey}
            nodeIOIdentifier={{ nodeId: nodeState.id, nodeIOName: input.name }}>
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

    const outputs = nodeState.outputs.map((output, index) => (
        <NodeIOLabel
            key={output.name}
            type="output"
            data_type={output.type}
            ioTranslationKey={output.translationKey}
            nodeIOIdentifier={{ nodeId: nodeState.id, nodeIOName: output.name }}>
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

    return (
        <div
            className={
                cn("node",
                    nodeState.type,
                    currentlyDraggingNode?.nodeId === nodeState.id ? "node-dragging" : undefined,
                    nodeState.isProcessing ? "is-processing" : undefined
                )
            }
            style={{
                left: nodeState.position.x,
                top: nodeState.position.y,
                transition: "transform 0.1s ease-out",
            }}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseDown={e => {
                // Only call onMouseDown if data-node-dragable-handle is true
                const target = e.target as HTMLElement;

                if (target.getAttribute("data-node-dragable-handle") === "true") {
                    onMouseDown(e);
                }
            }}
            data-node-dragable-handle="true"
        >
            <div data-node-dragable-handle="true" className="p-1 bg-primary-foreground text-primary rounded">{t("nodes." + nodeState.name + ".name")}</div>
            {
                nodeState.error && <Alert variant={"destructive"} className="mt-2">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {nodeState.error}
                    </AlertDescription>
                </Alert>
            }
            <div className="flex flex-col gap-1 mt-2">
                <div className="flex flex-col gap-1">
                    <div className="flex flex-col gap-1">
                        {inputs}
                    </div>
                </div>

                <Separator className="my-px h-px bg-primary-foreground" orientation="horizontal" />

                <div className="flex flex-col gap-1">
                    <div className="flex flex-col gap-1">
                        {outputs}
                    </div>
                </div>
            </div>
        </div>
    );
}
