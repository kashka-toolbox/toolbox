"use client";

import { Edge } from "@/components/graph/Edge";
import { useGraphStore } from "@/components/graph/GraphContextProvider";
import { useEffect, useLayoutEffect, useState } from "react";
import { areTypesCompatible } from "./areTypesCompatible";
import { Position } from "./Position.type";


export const useEdgeRenderer = (
    graphRef: React.RefObject<HTMLDivElement>,
) => {
    const [renderedEdges, setRenderedEdges] = useState<JSX.Element[]>([]);
    const nodes = useGraphStore((store) => store.nodes);
    const edges = useGraphStore((store) => store.edges);

    const recalculateEdges = () => {
        if (graphRef.current === null) {
            console.warn("Graph ref is null, cannot recalculate edges.");
            setRenderedEdges([]);
            return;
        }

        const graphBounds = graphRef.current.getBoundingClientRect();

        const elements = edges.map((edge, index) => {
            if (graphRef.current === null) return null;
            if (!edge.toIO) return null;

            const startIOBounds = graphRef.current.querySelector(`[data-io-identifier='${JSON.stringify(edge.fromIO)}']`)?.getBoundingClientRect();
            if (!startIOBounds) return null;
            const endIOBounds = graphRef.current.querySelector(`[data-io-identifier='${JSON.stringify(edge.toIO)}']`)?.getBoundingClientRect();
            if (!endIOBounds) return null;
            // TODO: take scrolling into account
            const startPosition: Position = {
                x: startIOBounds.left + startIOBounds.width / 2 - graphBounds.left,
                y: startIOBounds.top + startIOBounds.height / 2 - graphBounds.top,
            };

            const currentPosition: Position = {
                x: endIOBounds.left + endIOBounds.width / 2 - graphBounds.left || startPosition.x,
                y: endIOBounds.top + endIOBounds.height / 2 - graphBounds.top || startPosition.y,
            };

            const compatibility = areTypesCompatible(
                nodes.find(n => n.id === edge.fromIO.nodeId)?.getAllIO().find(io => io.name === edge.fromIO.nodeIOName)?.type || "any",
                nodes.find(n => n.id === edge.toIO?.nodeId)?.getAllIO().find(io => io.name === edge.toIO?.nodeIOName)?.type || "any"
            );

            const edgeVariant = compatibility === "compatible" ? "default" : (compatibility === "warning" ? "typewarning" : "typeerror");

            return (
                <Edge
                    key={index}
                    fromId={edge.fromIO.nodeId}
                    toId={edge.toIO?.nodeId}
                    startPosition={startPosition}
                    currentPosition={currentPosition}
                    variant={edgeVariant} />
            );
        });

        setRenderedEdges(elements.filter((el): el is JSX.Element => el !== null));
    };

    useEffect(() => {
        const graphCurrent = graphRef.current;
        graphCurrent?.addEventListener("transitionend", recalculateEdges);
        graphCurrent?.addEventListener("scroll", recalculateEdges);

        if (graphCurrent !== null)
            recalculateEdges();

        return () => {
            graphCurrent?.removeEventListener("transitionend", recalculateEdges);
            graphCurrent?.removeEventListener("scroll", recalculateEdges);
        };
    }, [graphRef, graphRef.current, edges, nodes, setRenderedEdges]);

    useLayoutEffect(() => {
        recalculateEdges();
    }, [edges, nodes]);

    return renderedEdges;
};
