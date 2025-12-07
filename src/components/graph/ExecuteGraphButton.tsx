"use client";

import { executeGraph } from "@/lib/graph/executeGraph";
import { useState } from "react";
import { Button } from "../ui/button";
import { useGraphStore } from "./GraphContextProvider";

export function ExecuteGraphButton({ }: {}) {
    const nodes = useGraphStore((state) => state.nodes);
    const edges = useGraphStore((state) => state.edges);
    const updateNodeState = useGraphStore((state) => state.updateNodeState);

    const [isExecuting, setIsExecuting] = useState(false);

    const handleClick = () => {
        setIsExecuting(true);
        executeGraph(nodes, edges, updateNodeState).finally(() => {
            setIsExecuting(false);
        });
    };

    return (
        <Button onClick={handleClick} disabled={isExecuting}>
            {isExecuting ? "Executing..." : "Execute"}
        </Button>
    );
}