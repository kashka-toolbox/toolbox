"use client";

import { Button } from "../ui/button";
import { useGraphStore } from "./GraphContextProvider";

export function SortGraphButton({ }: {}) {
    const sortGraph = useGraphStore((state) => state.sortGraph);

    const handleClick = () => {
        sortGraph();
    };

    return (
        <Button onClick={handleClick} variant="secondary">
            Sort Graph
        </Button>
    );
}
