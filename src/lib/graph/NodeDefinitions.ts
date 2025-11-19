import { NodeDefinition } from "@/lib/graph/NodeDefinition";
import { createNodeDefinition } from "./CreateNodeDefinition.factory";

export const NODE_INPUT_IO_NAME = "fromUi";
export const NODE_OUTPUT_IO_NAME = "toUi";

export type NODE_TYPE =
    | "input"
    | "inputNumeric"
    | "output"
    | "textToBase64"
    | "concatenateStrings"
    | "waitAndForward";

export const NODE_DEFINITIONS: {
    [key in NODE_TYPE]: NodeDefinition<any, any>;
} = {
    input: createNodeDefinition<[], ["fromUi"]>({
        type: "input",
        name: "input.any",
        inputs: [],
        outputs: [{
            name: NODE_INPUT_IO_NAME,
            translationKey: "types.any",
            type: "any",
        }],
        execute: async (_, self) => {
            return { "fromUi": self.state[NODE_INPUT_IO_NAME] ?? "" };
        },
    }),
    inputNumeric: createNodeDefinition<[], ["fromUi"]>({
        type: "input",
        name: "input.numeric",
        inputs: [],
        outputs: [{
            name: NODE_INPUT_IO_NAME,
            translationKey: "types.numeric",
            type: "numeric",
        }],
        execute: async (_, self) => {
            return { "fromUi": self.state[NODE_INPUT_IO_NAME] ?? 0};
        },
    }),
    output: createNodeDefinition<["toUi"], []>({
        type: "output",
        name: "output.any",
        inputs: [{
            name: NODE_OUTPUT_IO_NAME,
            translationKey: "types.any",
            type: "any",
        }],
        outputs: [],
        execute: async (stateOfInputs) => {
            console.warn("TODO: output to ui", stateOfInputs);
            return stateOfInputs;
        },
    }),
    textToBase64: createNodeDefinition<
        ["operation.text.textToBase64.inputs.text"],
        ["operation.text.textToBase64.outputs.base64"]
    >({
        type: "operation",
        name: "operation.text.textToBase64",
        inputs: [{
            name: "operation.text.textToBase64.inputs.text",
            translationKey: "types.text.any",
            type: "text.any",
        }],
        outputs: [{
            name: "operation.text.textToBase64.outputs.base64",
            translationKey: "types.text.base64",
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
    }),
    concatenateStrings: createNodeDefinition<
        [
            "stringA",
            "stringB",
        ],
        ["concatenated"]
    >({
        type: "operation",
        name: "operation.text.concatenateStrings",
        inputs: [{
            name: "stringA",
            translationKey: "types.text.any",
            type: "text.any",
        }, {
            name: "stringB",
            translationKey: "types.text.any",
            type: "text.any",
        }],
        outputs: [{
            name: "concatenated",
            translationKey: "types.text.any",
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
    }),
    waitAndForward: createNodeDefinition<
        ["input"],
        ["output"]
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
    }),
};
