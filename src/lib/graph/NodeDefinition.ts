import { ArrowRightIcon, InputIcon, LockOpen1Icon, MagicWandIcon, PlusIcon, TextIcon } from "@radix-ui/react-icons";
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
        icon: InputIcon,
        translationKey: "categories.input",
    },
    output: {
        icon: ArrowRightIcon,
        translationKey: "categories.output",
    },
    strings: {
        icon: TextIcon,
        translationKey: "categories.strings",
    },
    math: {
        icon: PlusIcon,
        translationKey: "categories.math",
    },
    cryptography: {
        icon: LockOpen1Icon,
        translationKey: "categories.cryptography",
    },
    extra: {
        icon: MagicWandIcon,
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
