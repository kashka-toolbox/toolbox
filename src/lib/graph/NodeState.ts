import { NodeDefinition, NodeIO } from "./NodeDefinition";
import { NodeSettings } from "./NodeSettings";

export type NodeState<I extends { [key: string]: any }, O extends { [key: string]: any }> = NodeDefinition<I, O, NodeSettings> & {
    id: string;
    position: {
        x: number;
        y: number;
    },
    isProcessing: boolean;
    error?: string;
    /**
     * Dynamic inputs added at runtime for nodes with hasDynamicInputs: true.
     */
    dynamicInputs?: NodeIO[];
    getAllIO: () => NodeIO[];
}