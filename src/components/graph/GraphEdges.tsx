import { useEdgeRenderer } from "@/lib/graph/useEdgeRenderer";

/**
 * Just the rendered edges of the graph.
 */
export function GraphEdges({graphRef}: {graphRef: React.RefObject<HTMLDivElement>}) {
    const renderedEdges = useEdgeRenderer(graphRef);

    return (
        <svg className="sticky inset-0 w-full h-full pointer-events-none z-20">
            {renderedEdges}
        </svg>
    );
}
