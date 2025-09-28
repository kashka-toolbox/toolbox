import { NodeDefinition } from "@/lib/graph/NodeDefinition";
import { createNodeDefinition } from "./CreateNodeDefinition.factory";

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
            name: "fromUi",
            translationKey: "types.any",
            type: "any",
        }],
        execute: async () => {
            return { "fromUi": "TODO: INPUT THIS VALUE USING UI" };
        },
    }),
    inputNumeric: createNodeDefinition<[], ["input.numeric.input"]>({
        type: "input",
        name: "input.numeric",
        inputs: [],
        outputs: [{
            name: "input.numeric.input",
            translationKey: "types.numeric",
            type: "numeric",
        }],
        execute: async () => {
            return { "input.numeric.input": 12.3456789 };
        },
    }),
    output: createNodeDefinition<["toUi"], []>({
        type: "output",
        name: "output.any",
        inputs: [{
            name: "toUi",
            translationKey: "types.any",
            type: "any",
        }],
        outputs: [],
        execute: async (stateOfInputs) => {
            console.warn("TODO: output to ui", stateOfInputs);
            return {};
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

            if (!parameters[inputkey]) {
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
            "operation.text.concatenateStrings.inputs.stringA",
            "operation.text.concatenateStrings.inputs.stringB",
        ],
        ["operation.text.concatenateStrings.outputs.concatenated"]
    >({
        type: "operation",
        name: "operation.text.concatenateStrings",
        inputs: [{
            name: "operation.text.concatenateStrings.inputs.stringA",
            translationKey: "types.text.any",
            type: "text.any",
        }, {
            name: "operation.text.concatenateStrings.inputs.stringB",
            translationKey: "types.text.any",
            type: "text.any",
        }],
        outputs: [{
            name: "operation.text.concatenateStrings.outputs.concatenated",
            translationKey: "types.text.any",
            type: "text.any",
        }],
        execute: async (
            parameters: {
                "operation.text.concatenateStrings.inputs.stringA": string;
                "operation.text.concatenateStrings.inputs.stringB": string;
            },
        ) => {
            const inputA =
                parameters["operation.text.concatenateStrings.inputs.stringA"];
            const inputB =
                parameters["operation.text.concatenateStrings.inputs.stringB"];
            return {
                "operation.text.concatenateStrings.outputs.concatenated":
                    inputA + inputB,
            };
        },
    }),
    waitAndForward: createNodeDefinition<
        ["operation.waitAndForward.inputs.input"],
        ["operation.waitAndForward.outputs.output"]
    >({
        type: "operation",
        name: "operation.waitAndForward",
        inputs: [{
            name: "operation.waitAndForward.inputs.input",
            translationKey: "types.any",
            type: "any",
        }],
        outputs: [{
            name: "operation.waitAndForward.outputs.output",
            translationKey: "types.any",
            type: "any",
        }],
        execute: async ({ "operation.waitAndForward.inputs.input": input }) => {
            console.info("Waiting for 2 seconds before forwarding:", input);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            return { "operation.waitAndForward.outputs.output": input };
        },
    }),
};
