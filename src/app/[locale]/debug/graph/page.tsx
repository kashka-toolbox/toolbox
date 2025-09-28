"use client";

import { Graph } from "@/components/graph/Graph";
import { GraphContextProvider } from "@/components/graph/GraphContextProvider";
import { Section } from "@/components/ui/Section";
import { createNode } from "@/lib/graph/CreateNode.factory";

export default function Home() {
    return (
        <>
        <Section className="flex flex-col gap-4">
            <h1 className="header-section-1">Graph based tools Debug</h1>

            <GraphContextProvider
                initialNodeStates={[
                    createNode("input", "1", { x: 50, y: 50 }),
                    createNode("textToBase64", "2", { x: 250, y: 50 }),
                    createNode("concatenateStrings", "3", { x: 350, y: 50 }),
                    createNode("waitAndForward", "4", { x: 450, y: 50 }),
                    createNode("output", "5", { x: 550, y: 50 }),
                    createNode("inputNumeric", "6", { x: 50, y: 200 }),
                    createNode("concatenateStrings", "7", { x: 350, y: 200 }),
                ]}
            >
                <Graph />
            </GraphContextProvider>
        </Section>
        <Section className="flex flex-col gap-4">
            <h1 className="header-section-1">STRESS</h1>

            <GraphContextProvider
                initialNodeStates={[
                    createNode("input", "1", { x: 50, y: 50 }),
                    ...(Array.from({length: 100}).map((_, i) => {
                        return createNode("textToBase64", (i + 10).toString(), { x: 50 * (i % 100), y: 50 * Math.floor(i / 100) })
                    })),
                    createNode("concatenateStrings", "1011", { x: 350, y: 200 }),
                ]}
            >
                <Graph />
            </GraphContextProvider>
        </Section>
        </>
    );
}
