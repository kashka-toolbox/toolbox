import { Edge } from "@/components/graph/Edge";
import { NodeIOIdentifier } from "@/components/graph/NodeIO";
import { useState, useEffect, useLayoutEffect } from "react";
import { areTypesCompatible } from "./areTypesCompatible";
import { NodeState } from "./NodeState";
import { Position } from "./Position.type";


export const useEdgeRenderer = (
    nodes: NodeState<any, any>[],
    graphRef: React.RefObject<HTMLDivElement>,
    edges: {
        fromIO: NodeIOIdentifier;
        toIO?: NodeIOIdentifier;
    }[]
) => {
    const [renderedEdges, setRenderedEdges] = useState<JSX.Element[]>([]);

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
        graphRef.current?.addEventListener("transitionend", recalculateEdges);
        graphRef.current?.addEventListener("scroll", recalculateEdges);
        return () => {
            graphRef.current?.removeEventListener("transitionend", recalculateEdges);
            graphRef.current?.removeEventListener("scroll", recalculateEdges);
        };
    }, [graphRef, graphRef.current, edges, nodes, setRenderedEdges]);

    useLayoutEffect(() => {
        recalculateEdges();
    }, [edges, nodes]);

    return renderedEdges;
};
