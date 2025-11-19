"use client";

import { ExecuteGraphButton } from "@/components/graph/ExecuteGraphButton";
import { Graph, GraphInputs, GraphOutputs } from "@/components/graph/Graph";
import {
    createGraphStore,
    GraphStoreContext,
} from "@/components/graph/GraphContextProvider";
import { Section } from "@/components/ui/Section";
import { createNode } from "@/lib/graph/CreateNode.factory";
import { NODE_OUTPUT_IO_NAME } from "@/lib/graph/NodeDefinitions";

const graphStore = createGraphStore();

graphStore.getState().initialize([
    createNode("input", "1", { x: 50, y: 50 }),
    createNode("textToBase64", "2", { x: 250, y: 50 }),
    createNode("concatenateStrings", "3", { x: 470, y: 85 }),
    createNode("waitAndForward", "4", { x: 690, y: 85 }),
    createNode("output", "5", { x: 880, y: 85 }),
    createNode("inputNumeric", "6", { x: 50, y: 200 }),
], [{
    fromIO: { nodeId: "1", nodeIOName: "fromUi" },
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
    fromIO: { nodeId: "6", nodeIOName: "fromUi" },
    toIO: { nodeId: "3", nodeIOName: "stringB" },
}, {
    fromIO: { nodeId: "3", nodeIOName: "concatenated" },
    toIO: { nodeId: "4", nodeIOName: "input" },
}, {
    fromIO: { nodeId: "4", nodeIOName: "output" },
    toIO: { nodeId: "5", nodeIOName: NODE_OUTPUT_IO_NAME },
}]);

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
                    <Section variant={"ghost"}>
                        <GraphInputs />
                        <GraphOutputs />
                        <ExecuteGraphButton />
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
