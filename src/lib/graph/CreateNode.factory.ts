import { NodeState } from "./NodeState";
import { NODE_DEFINITIONS } from "./NodeDefinitions";
import { NodeSettings } from "./NodeSettings";

type NodeTypes = typeof NODE_DEFINITIONS;
type NodeTypeKeys = keyof NodeTypes extends infer K ? K : never;

export const createNode: (
    nodeType: keyof typeof NODE_DEFINITIONS,
    id: string,
    position: { x: number; y: number },
    settings?: Partial<NodeSettings>
) => NodeState<any, any> = (
    nodeType,
    id,
    position,
    settings,
) => {
    const nodeDefinition = NODE_DEFINITIONS[nodeType];
    if (!nodeDefinition) {
        throw new Error(`Node type ${nodeType} does not exist`);
    }

    return {
        ...nodeDefinition,
        id,
        position,
        isProcessing: false,
        getAllIO: () => [
            ...nodeDefinition.inputs,
            ...nodeDefinition.outputs,
        ],
        settings: {
            ...nodeDefinition.settings,
            // Keep the definition as fallback values:
            ...Object.fromEntries(Object.entries(settings ?? {}).map(([key, setting]) => [key, {...nodeDefinition.settings[key], ...setting}])),
        }
    };
};
