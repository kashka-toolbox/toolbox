import { NodeCategory, NodeDefinition } from "./NodeDefinition";
import { NodeState } from "./NodeState";
import { TYPE_DEFINITION_KEY } from "./TypeDefinitions";

/**
 * Utility function to create a strongly-typed NodeDefinition.
 * 
 * @template InputKeys - List of input key strings.
 * @template OutputKeys - List of output key strings.
 * @param config - Configuration object for the node definition.
 * @returns A NodeDefinition with typed inputs and outputs.
 */
export function createNodeDefinition<
    InputKeys extends readonly string[],
    OutputKeys extends readonly string[]
>(
    config: {
        type: string;
        name: string;
        inputs: { name: InputKeys[number]; translationKey?: string; type: string }[];
        outputs: { name: OutputKeys[number]; translationKey?: string; type: TYPE_DEFINITION_KEY }[];
        execute: (parameters: { [K in InputKeys[number]]: any }, self: NodeState<InputKeys, OutputKeys>) => Promise<{ [K in OutputKeys[number]]: any }>;
        nodeCategory: NodeCategory;
    }
): NodeDefinition<{ [K in InputKeys[number]]: any }, { [K in OutputKeys[number]]: any }> {
    return { ...config, state: {} } as NodeDefinition<{ [K in InputKeys[number]]: any }, { [K in OutputKeys[number]]: any }>;
}

