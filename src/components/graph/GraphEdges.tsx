import { useEdgeRenderer } from "@/lib/graph/useEdgeRenderer";

export function GraphEdges({graphRef}: {graphRef: React.RefObject<HTMLDivElement>}) {
    const renderedEdges = useEdgeRenderer(graphRef);

    return (
        <svg className="absolute pointer-events-none z-20" style={{ width: "50000px", height: "50000px", left: "-25000px", top: "-25000px" }}>
            {renderedEdges}
        </svg>
    );
}
