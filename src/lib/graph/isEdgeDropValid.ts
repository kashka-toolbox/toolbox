import { NodeIOIdentifier } from "@/components/graph/NodeIO";
import { NodeState } from "./NodeState";

/**
 * Determines whether dropping an edge between two node IOs is valid within the graph.
 */
export const isEdgeDropValid: (fromIO: NodeIOIdentifier, toIO: NodeIOIdentifier, nodes: Map<string, NodeState<any, any>>) => {
    valid: boolean;
    reason: string;
    direction?: "input-to-output" | "output-to-input";
} = (fromIO, toIO, nodes) => {
    if (fromIO.nodeId === toIO.nodeId) {
        return {
            valid: false,
            reason: "graph.nodeIO.connect.selfDropError",
        };
    }
    const fromNode = nodes.get(fromIO.nodeId);
    const toNode = nodes.get(toIO.nodeId);

    if (!fromNode || !toNode) {
        return {
            valid: false,
            reason: "graph.nodeIO.connect.nodeNotFound",
        };
    }

    const fromNodeIO = fromNode?.getAllIO().find(io => io.name === fromIO.nodeIOName);
    const toNodeIO = toNode?.getAllIO().find(io => io.name === toIO.nodeIOName);

    if (!fromNodeIO || !toNodeIO) {
        return {
            valid: false,
            reason: "graph.nodeIO.connect.ioNotFound",
        };
    }

    const isFromIoOutput = fromNode.outputs.some(output => output.name === fromIO.nodeIOName);
    const isToIoInput = toNode.inputs.some(input => input.name === toIO.nodeIOName);

    if(isFromIoOutput !== isToIoInput) { // only input to output or output to input is valid
        return {
            valid: false,
            reason: "graph.nodeIO.connect.invalidDirection",
        };
    }

    return {
        valid: true,
        reason: "",
        direction: isFromIoOutput ? "output-to-input" : "input-to-output",
    };
}