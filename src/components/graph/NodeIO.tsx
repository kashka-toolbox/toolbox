import { isEdgeDropValid } from "@/lib/graph/isEdgeDropValid";
import { cn } from "@/lib/utils";
import React from "react";
import { useGraphStore } from "./GraphContextProvider";

export type NodeIOIdentifier = {
    nodeId: string;
    nodeIOName: string;
};

type NodeIOProps = {
    type: "input" | "output";
    data_type: string;
    onConnectNodes: (fromIo: NodeIOIdentifier, toIo: NodeIOIdentifier) => void;
    nodeId: string;
    ioName: string;
};

const NodeIO: React.FC<NodeIOProps> = (
    { type, onConnectNodes, nodeId, ioName, data_type },
) => {
    const nodes = useGraphStore((store) => store.nodes);

    const node_IO_identifier: NodeIOIdentifier = {
        nodeId,
        nodeIOName: ioName,
    };

    const handleDragStart = (e: React.DragEvent) => {
        console.log(`Dragging ${type} with nodeId: ${nodeId}`);

        /*setPreviewEdge?.({ // TODO: add previews
            fromIO: node_IO_identifier,
            toIO: undefined,
        });*/

        e.dataTransfer.setData("fromIO", JSON.stringify(node_IO_identifier));
    };

    const handleDragOver = (e: React.DragEvent) => {
        // TODO: add checks to ensure the drop is valid
        e.preventDefault();

        e.dataTransfer.dropEffect = "move";

        const fromIoJSON = e.dataTransfer.getData("fromIO");
        if (fromIoJSON == undefined || fromIoJSON.length == 0) {
            return;
        }

        const fromIO = JSON.parse(fromIoJSON) as NodeIOIdentifier;
        console.log({ fromIO, node_IO_identifier });

        /*setPreviewEdge?.({
            fromIO,
            toIO: node_IO_identifier,
        });*/
    };

    const handleDrop = (e: React.DragEvent) => {
        if (e.dataTransfer && e.dataTransfer.getData("fromIO")) {
            e.preventDefault();
            e.stopPropagation();
            const fromIO = JSON.parse(
                e.dataTransfer.getData("fromIO"),
            ) as NodeIOIdentifier;

            if (!fromIO) {
                return;
            }

            const isValid = isEdgeDropValid(
                fromIO,
                node_IO_identifier,
                nodes,
            );

            if (!isValid.valid) {
                console.info("Drop not valid:", isValid.reason);
                return;
            }

            if (isValid.direction === "input-to-output") { // enforce direction
                onConnectNodes(node_IO_identifier, fromIO);
            } else if (isValid.direction === "output-to-input") {
                onConnectNodes(fromIO, node_IO_identifier);
            }
        }
    };

    if (type === "input") {
        return (
            <NodeIODot
                type="input"
                data_type={data_type}
                draggable={true}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                data-io-identifier={JSON.stringify(node_IO_identifier)}
            />
        );
    }

    return (
        <NodeIODot
            type="output"
            data_type={data_type}
            draggable={true}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            data-io-identifier={JSON.stringify(node_IO_identifier)}
        />
    );
};
NodeIO.displayName = "GraphNodeIO";

const NodeIODot = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        type: "input" | "output";
        data_type: string;
    }
>((props, ref) => {
    const { color, style, type, data_type, ...rest } = props;
    return (
        <div
            ref={ref}
            className={cn(
                "node-io",
                type,
                data_type.replaceAll(".", "-"),
                props.className,
            )}
            {...rest}
        />
    );
});
NodeIODot.displayName = "GraphNodeIODot";

export { NodeIO };
