"use client";

import { Edge } from "@/components/graph/Edge";
import { useGraphStore, useCurrentGraphStore } from "@/components/graph/GraphContextProvider";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { areTypesCompatible } from "./areTypesCompatible";
import { Position } from "./Position.type";
import { PreviewEdge } from "./PreviewEdge.type";

const SVG_OFFSET = 25000;

export const useEdgeRenderer = (
    graphRef: React.RefObject<HTMLDivElement>,
) => {
    const [renderedEdges, setRenderedEdges] = useState<JSX.Element[]>([]);
    const [renderedPreviewEdge, setRenderedPreviewEdge] = useState<
        JSX.Element | null
    >(null);
    const nodes = useGraphStore((store) => store.nodes);
    const edges = useGraphStore((store) => store.edges);
    const previewEdge = useGraphStore((store) => store.previewEdge);
    const updatePreviewEdge = useGraphStore((store) => store.updatePreviewEdge);
    const store = useCurrentGraphStore();

    const previewEdgeRef = useRef<PreviewEdge | null>(null);
    const scaleRef = useRef(1);
    const panOffsetRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const unsubscribe = store.subscribe((state) => {
            scaleRef.current = state.scale;
            panOffsetRef.current = state.panOffset;
        });
        return unsubscribe;
    }, [store]);

    useEffect(() => {
        previewEdgeRef.current = previewEdge;
    }, [previewEdge]);

    const recalculateEdges = () => {
        if (graphRef.current === null) {
            console.warn("Graph ref is null, cannot recalculate edges.");
            setRenderedEdges([]);
            return;
        }

        const graphBounds = graphRef.current.getBoundingClientRect();
        const scale = scaleRef.current;
        const panOffset = panOffsetRef.current;

        const elements = edges.map((edge, index) => {
            if (graphRef.current === null) return null;
            if (!edge.toIO) return null;

            const startIOBounds = graphRef.current.querySelector(
                `[data-io-identifier='${JSON.stringify(edge.fromIO)}']`,
            )?.getBoundingClientRect();
            if (!startIOBounds) return null;
            const endIOBounds = graphRef.current.querySelector(
                `[data-io-identifier='${JSON.stringify(edge.toIO)}']`,
            )?.getBoundingClientRect();
            if (!endIOBounds) return null;
            
            const startPosition: Position = {
                x: (startIOBounds.left + startIOBounds.width / 2 -
                    graphBounds.left - panOffset.x) / scale + SVG_OFFSET,
                y: (startIOBounds.top + startIOBounds.height / 2 -
                    graphBounds.top - panOffset.y) / scale + SVG_OFFSET,
            };

            const currentPosition: Position = {
                x: (endIOBounds.left + endIOBounds.width / 2 -
                        graphBounds.left - panOffset.x) / scale + SVG_OFFSET || startPosition.x,
                y: (endIOBounds.top + endIOBounds.height / 2 - graphBounds.top - panOffset.y) / scale + SVG_OFFSET ||
                    startPosition.y,
            };

            const compatibility = areTypesCompatible(
                nodes.get(edge.fromIO.nodeId)?.getAllIO().find((io) =>
                    io.name === edge.fromIO.nodeIOName
                )?.type || "any",
                nodes.get(edge.toIO?.nodeId)?.getAllIO().find((io) =>
                    io.name === edge.toIO?.nodeIOName
                )?.type || "any",
            );

            const edgeVariant = compatibility === "compatible"
                ? "default"
                : (compatibility === "warning" ? "typewarning" : "typeerror");

            return (
                <Edge
                    key={index}
                    fromId={edge.fromIO.nodeId}
                    toId={edge.toIO?.nodeId}
                    startPosition={startPosition}
                    currentPosition={currentPosition}
                    variant={edgeVariant}
                />
            );
        });

        setRenderedEdges(
            elements.filter((el): el is JSX.Element => el !== null),
        );
    };

    useEffect(() => {
        const graphCurrent = graphRef.current;
        graphCurrent?.addEventListener("transitionend", recalculateEdges);

        if (graphCurrent !== null) {
            recalculateEdges();
        }

        return () => {
            graphCurrent?.removeEventListener(
                "transitionend",
                recalculateEdges,
            );
        };
    }, [graphRef, graphRef.current, edges, nodes]);

    useEffect(() => {
        if (previewEdge === null && renderedPreviewEdge !== null) {
            setRenderedPreviewEdge(null);
        }
        if (previewEdge === null) return;
        if (graphRef.current === null) {
            console.warn("Graph ref is null, cannot recalculate preview edge.");
            setRenderedPreviewEdge(null);
            return;
        }

        const graphBounds = graphRef.current.getBoundingClientRect();
        const scale = scaleRef.current;
        const panOffset = panOffsetRef.current;

        const startIOBounds = graphRef.current.querySelector(
            `[data-io-identifier='${JSON.stringify(previewEdge.fromIO)}']`,
        )?.getBoundingClientRect();
        if (!startIOBounds) {
            setRenderedPreviewEdge(null);
            return;
        }

        const startPosition: Position = {
            x: (startIOBounds.left + startIOBounds.width / 2 - graphBounds.left - panOffset.x) / scale + SVG_OFFSET,
            y: (startIOBounds.top + startIOBounds.height / 2 - graphBounds.top - panOffset.y) / scale + SVG_OFFSET,
        };

        let currentPosition: Position = previewEdge.currentDragPosition ?? {
            x: startPosition.x,
            y: startPosition.y,
        };

        if (previewEdge.toIO) {
            const endIOBounds = graphRef.current.querySelector(
                `[data-io-identifier='${JSON.stringify(previewEdge.toIO)}']`,
            )?.getBoundingClientRect();
            if (endIOBounds) {
                currentPosition = {
                    x: (endIOBounds.left + endIOBounds.width / 2 -
                        graphBounds.left - panOffset.x) / scale + SVG_OFFSET,
                    y: (endIOBounds.top + endIOBounds.height / 2 -
                        graphBounds.top - panOffset.y) / scale + SVG_OFFSET,
                };
            }
        }

        if (previewEdge.fromIO === undefined) {
            setRenderedPreviewEdge(null);
            return;
        }

        const compatibility = areTypesCompatible(
            nodes.get(previewEdge.fromIO.nodeId)?.getAllIO().find((io) =>
                io.name === previewEdge.fromIO!.nodeIOName
            )?.type || "any",
            previewEdge.toIO
                ? nodes.get(previewEdge.toIO.nodeId)?.getAllIO().find((io) =>
                    io.name === previewEdge.toIO!.nodeIOName
                )?.type || "any"
                : "any",
        );

        const edgeVariant = compatibility === "compatible"
            ? "default"
            : (compatibility === "warning" ? "typewarning" : "typeerror");

        setRenderedPreviewEdge(
            <Edge
                key={"preview-edge"}
                fromId={previewEdge.fromIO.nodeId}
                toId={previewEdge.toIO?.nodeId}
                startPosition={startPosition}
                currentPosition={currentPosition}
                variant={edgeVariant}
            />,
        );
    }, [previewEdge, graphRef, nodes]);

    useEffect(() => {
        const updatePreviewEdgeOnMouseMove = (e: MouseEvent) => {
            if (previewEdgeRef.current === null) {
                return;
            }

            const graphBounds = graphRef.current?.getBoundingClientRect();
            if (!graphBounds) return;

            const scale = scaleRef.current;
            const panOffset = panOffsetRef.current;

            const currentPosition: Position = {
                x: (e.clientX - graphBounds.left - panOffset.x) / scale + SVG_OFFSET,
                y: (e.clientY - graphBounds.top - panOffset.y) / scale + SVG_OFFSET,
            };

            updatePreviewEdge({
                currentDragPosition: currentPosition,
            });
        };

        graphRef.current?.addEventListener(
            "dragover",
            updatePreviewEdgeOnMouseMove,
        );

        return () => {
            graphRef.current?.removeEventListener(
                "dragover",
                updatePreviewEdgeOnMouseMove,
            );
        };
    }, [graphRef.current, previewEdgeRef, updatePreviewEdge]);

    useLayoutEffect(() => {
        recalculateEdges();
    }, [edges, nodes]);

    return [
        ...renderedEdges,
        ...(renderedPreviewEdge ? [renderedPreviewEdge] : []),
    ];
};
