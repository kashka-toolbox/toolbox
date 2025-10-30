"use client";

import { executeGraph } from "@/lib/graph/executeGraph";
import { useGraphStore } from "./GraphContextProvider";
import { Button } from "../ui/button";

export function ExecuteGraphButton({ }: {}) {
    const nodes = useGraphStore((state) => state.nodes);
    const edges = useGraphStore((state) => state.edges);
    const updateNodeState = useGraphStore((state) => state.updateNodeState);

    const handleClick = () => {
        executeGraph(nodes, edges, updateNodeState);
    };

    return (
        <Button onClick={handleClick}>
            Execute
        </Button>
    );
}