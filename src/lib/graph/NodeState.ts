import { NodeDefinition, NodeIO } from "./NodeDefinition";

export type NodeState<I extends { [key: string]: any }, O extends { [key: string]: any }> = NodeDefinition<I, O> & {
    id: string;
    position: {
        x: number;
        y: number;
    },
    isProcessing: boolean;
    error?: string;
    getAllIO: () => NodeIO[];
}