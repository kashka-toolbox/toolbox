import { NodeDefinition } from "@/lib/graph/NodeDefinition";
import { createNodeDefinition } from "./CreateNodeDefinition.factory";
import { NODE_SETTING_UI_LABEL_NAME, NODE_SETTING_UI_LABEL_NAME_DEFAULT_SETTINGS } from "./NodeSettings"

export const NODE_INPUT_IO_NAME = "fromUi";
export const NODE_OUTPUT_IO_NAME = "toUi";

export type NODE_TYPE =
    | "input"
    | "inputNumeric"
    | "output"
    | "textToBase64"
    | "concatenateStrings"
    | "waitAndForward"
    | "randomUUID";

export const NODE_DEFINITIONS: {
    [key in NODE_TYPE]: NodeDefinition<any, any, any>;
} = {
    input: createNodeDefinition<[], ["fromUi"], [typeof NODE_SETTING_UI_LABEL_NAME]>({
        type: "input",
        name: "input.any",
        inputs: [],
        outputs: [{
            name: NODE_INPUT_IO_NAME,
            type: "any",
        }],
        execute: async (_, self) => {
            return { "fromUi": self.state[NODE_INPUT_IO_NAME] ?? "" };
        },
        nodeCategory: "input",
        settings: {
            ...NODE_SETTING_UI_LABEL_NAME_DEFAULT_SETTINGS
        }
    }),
    inputNumeric: createNodeDefinition<[], ["fromUi"], [typeof NODE_SETTING_UI_LABEL_NAME]>({
        type: "input",
        name: "input.numeric",
        inputs: [],
        outputs: [{
            name: NODE_INPUT_IO_NAME,
            type: "numeric",
        }],
        execute: async (_, self) => {
            return { "fromUi": self.state[NODE_INPUT_IO_NAME] ?? 0 };
        },
        nodeCategory: "input",
        settings: {
            ...NODE_SETTING_UI_LABEL_NAME_DEFAULT_SETTINGS
        }
    }),
    output: createNodeDefinition<["toUi"], [], [typeof NODE_SETTING_UI_LABEL_NAME]>({
        type: "output",
        name: "output.any",
        inputs: [{
            name: NODE_OUTPUT_IO_NAME,
            type: "any",
        }],
        outputs: [],
        execute: async (stateOfInputs) => {
            return stateOfInputs;
        },
        nodeCategory: "output",
        settings: {
            ...NODE_SETTING_UI_LABEL_NAME_DEFAULT_SETTINGS
        }
    }),
    textToBase64: createNodeDefinition<
        ["operation.text.textToBase64.inputs.text"],
        ["operation.text.textToBase64.outputs.base64"],
        []
    >({
        type: "operation",
        name: "operation.text.textToBase64",
        inputs: [{
            name: "operation.text.textToBase64.inputs.text",
            type: "text.any",
        }],
        outputs: [{
            name: "operation.text.textToBase64.outputs.base64",
            type: "text.base64",
        }],
        execute: async (
            parameters: { "operation.text.textToBase64.inputs.text": string },
        ) => {
            const inputkey = "operation.text.textToBase64.inputs.text";

            console.info(parameters[inputkey]);

            if (parameters[inputkey] === undefined) {
                throw new Error(`Input ${inputkey} is required`);
            }

            return {
                "operation.text.textToBase64.outputs.base64": btoa(
                    unescape(encodeURIComponent(parameters[inputkey])),
                ),
            };
        },
        nodeCategory: "strings",
        settings: {}
    }),
    concatenateStrings: createNodeDefinition<
        [
            "stringA",
            "stringB",
        ],
        ["concatenated"],
        []
    >({
        type: "operation",
        name: "operation.text.concatenateStrings",
        inputs: [{
            name: "stringA",
            translationKey: "nodes.operation.text.concatenateStrings.inputs.stringA",
            type: "text.any",
        }, {
            name: "stringB",
            translationKey: "nodes.operation.text.concatenateStrings.inputs.stringB",
            type: "text.any",
        }],
        outputs: [{
            name: "concatenated",
            type: "text.any",
        }],
        execute: async (
            parameters: {
                "stringA": string;
                "stringB": string;
            },
        ) => {
            const inputA =
                parameters["stringA"];
            const inputB =
                parameters["stringB"];
            return {
                "concatenated":
                    inputA + inputB,
            };
        },
        nodeCategory: "strings",
        settings: {}
    }),
    waitAndForward: createNodeDefinition<
        ["input"],
        ["output"],
        []
    >({
        type: "operation",
        name: "operation.waitAndForward",
        inputs: [{
            name: "input",
            translationKey: "types.any",
            type: "any",
        }],
        outputs: [{
            name: "output",
            translationKey: "types.any",
            type: "any",
        }],
        execute: async ({ "input": input }) => {
            console.info("Waiting for 2 seconds before forwarding:", input);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return { "output": input };
        },
        nodeCategory: "extra",
        settings: {}
    }),
    randomUUID: createNodeDefinition<[], ["uuid"], []>({
        type: "operation",
        name: "operation.cryptography.randomUUID",
        inputs: [],
        outputs: [{
            name: "uuid",
            translationKey: "types.text.uuid",
            type: "text.uuid",
        }],
        execute: async () => {
            return { "uuid": crypto.randomUUID() };
        },
        nodeCategory: "cryptography",
        settings: {}
    }),
};  
