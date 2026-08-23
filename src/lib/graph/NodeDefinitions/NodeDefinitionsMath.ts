import { NodeDefinition } from "@/lib/graph/NodeDefinition";
import { NodeExecutionError } from "@/lib/graph/NodeExecutionError";
import { createNodeDefinition } from "../CreateNodeDefinition.factory";

export const NODE_INPUT_IO_NAME = "fromUi";
export const NODE_OUTPUT_IO_NAME = "toUi";

export type NODE_TYPE_MATH =
    | "addition"
    | "substraction"
    | "multiplication"
    | "division";

export const NODE_DEFINITIONS_MATH: {
    [key in NODE_TYPE_MATH]: NodeDefinition<any, any, any>;
} = {
    addition: createNodeDefinition<
        [
            "numberA",
            "numberB",
        ],
        ["result"],
        []
    >({
        type: "operation",
        name: "operation.math.addition",
        inputs: [{
            name: "numberA",
            translationKey: "nodes.operation.math.addition.inputs.numberA",
            type: "numeric.any",
        }, {
            name: "numberB",
            translationKey: "nodes.operation.math.addition.inputs.numberB",
            type: "numeric.any",
        }],
        outputs: [{
            name: "result",
            translationKey: "nodes.operation.math.addition.outputs.result",
            type: "numeric.any",
        }],
        execute: async (
            parameters: {
                "numberA": number;
                "numberB": number;
            },
        ) => {
            const inputA =
                parameters["numberA"];
            const inputB =
                parameters["numberB"];
            return {
                "result":
                    inputA + inputB,
            };
        },
        nodeCategory: "math",
        settings: {}
    }),
    substraction: createNodeDefinition<
        [
            "numberA",
            "numberB",
        ],
        ["result"],
        []
    >({
        type: "operation",
        name: "operation.math.substraction",
        inputs: [{
            name: "numberA",
            translationKey: "nodes.operation.math.substraction.inputs.numberA",
            type: "numeric.any",
        }, {
            name: "numberB",
            translationKey: "nodes.operation.math.substraction.inputs.numberB",
            type: "numeric.any",
        }],
        outputs: [{
            name: "result",
            translationKey: "nodes.operation.math.substraction.outputs.result",
            type: "numeric.any",
        }],
        execute: async (
            parameters: {
                "numberA": number;
                "numberB": number;
            },
        ) => {
            const inputA =
                parameters["numberA"];
            const inputB =
                parameters["numberB"];
            return {
                "result":
                    inputA - inputB,
            };
        },
        nodeCategory: "math",
        settings: {}
    }),
    multiplication: createNodeDefinition<
        [
            "numberA",
            "numberB",
        ],
        ["result"],
        []
    >({
        type: "operation",
        name: "operation.math.multiplication",
        inputs: [{
            name: "numberA",
            translationKey: "nodes.operation.math.multiplication.inputs.numberA",
            type: "numeric.any",
        }, {
            name: "numberB",
            translationKey: "nodes.operation.math.multiplication.inputs.numberB",
            type: "numeric.any",
        }],
        outputs: [{
            name: "result",
            translationKey: "nodes.operation.math.multiplication.outputs.result",
            type: "numeric.any",
        }],
        execute: async (
            parameters: {
                "numberA": number;
                "numberB": number;
            },
        ) => {
            const inputA =
                parameters["numberA"];
            const inputB =
                parameters["numberB"];
            return {
                "result":
                    inputA * inputB,
            };
        },
        nodeCategory: "math",
        settings: {}
    }),
    division: createNodeDefinition<
        [
            "numberA",
            "numberB",
        ],
        ["result"],
        []
    >({
        type: "operation",
        name: "operation.math.division",
        inputs: [{
            name: "numberA",
            translationKey: "nodes.operation.math.division.inputs.numberA",
            type: "numeric.any",
        }, {
            name: "numberB",
            translationKey: "nodes.operation.math.division.inputs.numberB",
            type: "numeric.any",
        }],
        outputs: [{
            name: "result",
            translationKey: "nodes.operation.math.division.outputs.result",
            type: "numeric.any",
        }],
        execute: async (
            parameters: {
                "numberA": number;
                "numberB": number;
            },
        ) => {
            const inputA =
                parameters["numberA"];
            const inputB =
                parameters["numberB"];

            if (inputB === 0) {
                throw new NodeExecutionError(NodeExecutionError.translationKeys.DIVIDE_BY_ZERO);
            }

            return {
                "result":
                    inputA / inputB,
            };
        },
        nodeCategory: "math",
        settings: {}
    }),

};  
