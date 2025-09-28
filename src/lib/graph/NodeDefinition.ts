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

export type NodeDefinition<I extends { [key: string]: any }, O extends { [key: string]: any }> = {
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
    execute: (parameters: I) => Promise<{ [outputKey in keyof O]: O[outputKey] }>;
    state: O;
};