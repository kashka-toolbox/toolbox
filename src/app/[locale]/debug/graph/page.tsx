"use client";

import { ExecuteGraphButton } from "@/components/graph/ExecuteGraphButton";
import { Graph, GraphInputs, GraphOutputs } from "@/components/graph/Graph";
import {
    createGraphStore,
    GraphStoreContext,
} from "@/components/graph/GraphContextProvider";
import { Section } from "@/components/ui/Section";
import { Separator } from "@/components/ui/separator";
import { SortGraphButton } from "@/components/graph/SortGraphButton";
import { createNode } from "@/lib/graph/CreateNode.factory";
import { NODE_INPUT_IO_NAME, NODE_OUTPUT_IO_NAME } from "@/lib/graph/NodeDefinitions";
import { NODE_SETTING_UI_LABEL_TEXT } from "@/lib/graph/NodeSettings";

const graphStore = createGraphStore();

graphStore.getState().initialize([
    createNode("input", "1", { x: 50, y: 50 }),
    createNode("textToBase64", "2", { x: 250, y: 50 }),
    createNode("concatenateStrings", "3", { x: 470, y: 85 }),
    createNode("waitAndForward", "4", { x: 690, y: 0 }),
    createNode("output", "5", { x: 880, y: 85 }, {[NODE_SETTING_UI_LABEL_TEXT]: {value: "Result"}}),
    createNode("input", "6", { x: 50, y: 150 }),
    // Math:
    createNode("inputNumeric", "10", { x: 50, y: 300 }, {[NODE_SETTING_UI_LABEL_TEXT]: {value: "Number A"}}),
    createNode("inputNumeric", "11", { x: 50, y: 400 }, {[NODE_SETTING_UI_LABEL_TEXT]: {value: "Number B"}}),
    createNode("addition", "15", { x: 400, y: 300 }),
    createNode("output", "25", { x: 680, y: 300 }, {[NODE_SETTING_UI_LABEL_TEXT]: {value: "Result Addition"}}),
    createNode("substraction", "16", { x: 400, y: 450 }),
    createNode("output", "26", { x: 680, y: 400 }, {[NODE_SETTING_UI_LABEL_TEXT]: {value: "Result Substraction"}}),
    createNode("multiplication", "17", { x: 400, y: 600 }),
    createNode("output", "27", { x: 680, y: 500 }, {[NODE_SETTING_UI_LABEL_TEXT]: {value: "Result Multiplication"}}),
    createNode("division", "18", { x: 400, y: 750 }),
    createNode("output", "28", { x: 680, y: 600 }, {[NODE_SETTING_UI_LABEL_TEXT]: {value: "Result Division"}}),
    // Math: Absolute Value
    createNode("abs", "19", { x: 400, y: 900 }),
    createNode("output", "19o", { x: 680, y: 700 }, {[NODE_SETTING_UI_LABEL_TEXT]: {value: "Result Abs"}}),
    // Math: Ceil
    createNode("ceil", "20", { x: 400, y: 1050 }),
    createNode("output", "20o", { x: 680, y: 800 }, {[NODE_SETTING_UI_LABEL_TEXT]: {value: "Result Ceil"}}),
    // Math: Floor
    createNode("floor", "21", { x: 400, y: 1200 }),
    createNode("output", "21o", { x: 680, y: 900 }, {[NODE_SETTING_UI_LABEL_TEXT]: {value: "Result Floor"}}),
    // Math: Round
    createNode("round", "22", { x: 400, y: 1350 }),
    createNode("output", "22o", { x: 680, y: 1000 }, {[NODE_SETTING_UI_LABEL_TEXT]: {value: "Result Round"}}),
    // Math: Sign
    createNode("sign", "23", { x: 400, y: 1500 }),
    createNode("output", "23o", { x: 680, y: 1100 }, {[NODE_SETTING_UI_LABEL_TEXT]: {value: "Result Sign"}}),
    
], [{
    fromIO: { nodeId: "1", nodeIOName: NODE_INPUT_IO_NAME },
    toIO: {
        nodeId: "2",
        nodeIOName: "operation.text.textToBase64.inputs.text",
    },
}, {
    fromIO: {
        nodeId: "2",
        nodeIOName: "operation.text.textToBase64.outputs.base64",
    },
    toIO: { nodeId: "3", nodeIOName: "stringA" },
}, {
    fromIO: { nodeId: "6", nodeIOName: NODE_INPUT_IO_NAME },
    toIO: { nodeId: "3", nodeIOName: "stringB" },
},/* {
    fromIO: { nodeId: "3", nodeIOName: "concatenated" },
    toIO: { nodeId: "4", nodeIOName: "input" },
},*/ {
    fromIO: { nodeId: "3", nodeIOName: "concatenated" },
    toIO: { nodeId: "5", nodeIOName: NODE_OUTPUT_IO_NAME },
}, { //  --- Math: Addition ---
    fromIO: { nodeId: "10", nodeIOName: NODE_INPUT_IO_NAME },
    toIO: { nodeId: "15", nodeIOName: "numberA" },
}, {
    fromIO: { nodeId: "11", nodeIOName: NODE_INPUT_IO_NAME },
    toIO: { nodeId: "15", nodeIOName: "numberB" },
}, {
    fromIO: { nodeId: "15", nodeIOName: "result" },
    toIO: { nodeId: "25", nodeIOName: NODE_OUTPUT_IO_NAME },
}, { //  --- Math: Substraction ---
    fromIO: { nodeId: "10", nodeIOName: NODE_INPUT_IO_NAME },
    toIO: { nodeId: "16", nodeIOName: "numberA" },
}, {
    fromIO: { nodeId: "11", nodeIOName: NODE_INPUT_IO_NAME },
    toIO: { nodeId: "16", nodeIOName: "numberB" },
}, {
    fromIO: { nodeId: "16", nodeIOName: "result" },
    toIO: { nodeId: "26", nodeIOName: NODE_OUTPUT_IO_NAME },
}, { //  --- Math: Multiplication ---
    fromIO: { nodeId: "10", nodeIOName: NODE_INPUT_IO_NAME },
    toIO: { nodeId: "17", nodeIOName: "numberA" },
}, {
    fromIO: { nodeId: "11", nodeIOName: NODE_INPUT_IO_NAME },
    toIO: { nodeId: "17", nodeIOName: "numberB" },
}, {
    fromIO: { nodeId: "17", nodeIOName: "result" },
    toIO: { nodeId: "27", nodeIOName: NODE_OUTPUT_IO_NAME },
}, { //  --- Math: Division ---
    fromIO: { nodeId: "10", nodeIOName: NODE_INPUT_IO_NAME },
    toIO: { nodeId: "18", nodeIOName: "numberA" },
}, {
    fromIO: { nodeId: "11", nodeIOName: NODE_INPUT_IO_NAME },
    toIO: { nodeId: "18", nodeIOName: "numberB" },
}, {
    fromIO: { nodeId: "18", nodeIOName: "result" },
    toIO: { nodeId: "28", nodeIOName: NODE_OUTPUT_IO_NAME },
}, { //  --- Math: Abs ---
    fromIO: { nodeId: "10", nodeIOName: NODE_INPUT_IO_NAME },
    toIO: { nodeId: "19", nodeIOName: "number" },
}, {
    fromIO: { nodeId: "19", nodeIOName: "result" },
    toIO: { nodeId: "19o", nodeIOName: NODE_OUTPUT_IO_NAME },
}, { //  --- Math: Ceil ---
    fromIO: { nodeId: "10", nodeIOName: NODE_INPUT_IO_NAME },
    toIO: { nodeId: "20", nodeIOName: "number" },
}, {
    fromIO: { nodeId: "20", nodeIOName: "result" },
    toIO: { nodeId: "20o", nodeIOName: NODE_OUTPUT_IO_NAME },
}, { //  --- Math: Floor ---
    fromIO: { nodeId: "10", nodeIOName: NODE_INPUT_IO_NAME },
    toIO: { nodeId: "21", nodeIOName: "number" },
}, {
    fromIO: { nodeId: "21", nodeIOName: "result" },
    toIO: { nodeId: "21o", nodeIOName: NODE_OUTPUT_IO_NAME },
}, { //  --- Math: Round ---
    fromIO: { nodeId: "10", nodeIOName: NODE_INPUT_IO_NAME },
    toIO: { nodeId: "22", nodeIOName: "number" },
}, {
    fromIO: { nodeId: "22", nodeIOName: "result" },
    toIO: { nodeId: "22o", nodeIOName: NODE_OUTPUT_IO_NAME },
}, { //  --- Math: Sign ---
    fromIO: { nodeId: "10", nodeIOName: NODE_INPUT_IO_NAME },
    toIO: { nodeId: "23", nodeIOName: "number" },
}, {
    fromIO: { nodeId: "23", nodeIOName: "result" },
    toIO: { nodeId: "23o", nodeIOName: NODE_OUTPUT_IO_NAME },
}


]);

const graphStoreStressTest = createGraphStore();
const numberOfNodes = 100;

graphStoreStressTest.getState().initialize([
    createNode("input", "1", { x: 50, y: 50 }),
    ...(Array.from({ length: numberOfNodes }).map((_, i) => {
        return createNode("textToBase64", (i + 10).toString(), {
            x: 200 + 180 * (i % 50),
            y: 300 + Math.floor(i / 50) * 160,
        });
    })),
    createNode("output", "2", { x: 350, y: 200 }),
], [
    {
        fromIO: { nodeId: "1", nodeIOName: "fromUi" },
        toIO: {
            nodeId: "10",
            nodeIOName: "operation.text.textToBase64.inputs.text",
        },
    },
    ...Array.from({ length: numberOfNodes - 1 }).map((_, i) => ({
        fromIO: {
            nodeId: (i + 10).toString(),
            nodeIOName: "operation.text.textToBase64.outputs.base64",
        },
        toIO: {
            nodeId: (i + 11).toString(),
            nodeIOName: "operation.text.textToBase64.inputs.text",
        },
    })),
    {
        fromIO: {
            nodeId: (numberOfNodes + 9).toString(),
            nodeIOName: "operation.text.textToBase64.outputs.base64",
        },
        toIO: { nodeId: "2", nodeIOName: "toUi" },
    },
]);

export default function Home() {
    return (
        <>
            <Section className="flex flex-col gap-4">
                <h1 className="header-section-1">Graph based tools Debug</h1>

                <GraphStoreContext.Provider
                    value={graphStore}
                >
                    <Section variant={"ghost"} className="flex flex-col gap-4 md:gap-8">
                        <div className="flex flex-row gap-4">
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="header-section-3">Inputs</h2>
                                <GraphInputs />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                                <h2 className="header-section-3">Outputs</h2>
                                <GraphOutputs />
                            </div>
                        </div>
                        <div className="flex flex-row gap-2">
                            <SortGraphButton />
                            <ExecuteGraphButton />
                        </div>
                    </Section>
                    <Graph />
                </GraphStoreContext.Provider>
            </Section>
            <Section className="flex flex-col gap-4">
                <h1 className="header-section-1">STRESS</h1>

                <GraphStoreContext.Provider
                    value={graphStoreStressTest}
                >
                    <Graph />
                </GraphStoreContext.Provider>
            </Section>
        </>
    );
}
