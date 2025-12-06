import { NodeState } from "./NodeState";

export type NodeIO = {
    /**
     * Technical name of the IO
     *
     * This identifies the IO and must be unique within the node.
     */
    name: string;
    /**
     * Translation key for the IO name
     */
    translationKey: string;
    /**
     * Data type of the IO, e.g. "types.text", "types.number", "types.image.png", etc.
     */
    type: string;
};

export const NODE_CATEGORIES = {
    input: {
        icon: "input",
        translationKey: "categories.input",
    },
    output: {
        icon: "output",
        translationKey: "categories.output",
    },
    strings: {
        icon: "strings",
        translationKey: "categories.strings",
    },
    math: {
        icon: "math",
        translationKey: "categories.math",
    },
    extra: {
        icon: "extra",
        translationKey: "categories.extra",
    },
} as const;
export type NodeCategory = keyof typeof NODE_CATEGORIES;

export type NodeDefinition<
    I extends { [key: string]: any },
    O extends { [key: string]: any },
> = {
    type: "input" | "output" | "operation";
    name: string;
    /**
     * Each name must be unique within the node definition.
     */
    inputs: NodeIO[];
    /**
     * Each name must be unique within the node definition.
     */
    outputs: NodeIO[];
    /**
     * @param parameters
     * @returns
     */
    /**
     * Returns an object with the output names as keys and their values.
     */
    execute: (
        parameters: I,
        self: NodeState<I, O>,
    ) => Promise<{ [outputKey in keyof O]: O[outputKey] }>;
    /**
     * The keys in the nodeState depend on the type of node.
     *
     * - For input nodes, the state contains values for the output keys.
     *
     * - For output nodes, the state contains values for the input keys.
     *
     * - For operation nodes, the state may contain both input and output keys
     * and any additional data needed for execution.
     */
    state: { [key: string]: any };
    nodeCategory?: NodeCategory;
};
