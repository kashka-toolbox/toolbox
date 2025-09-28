import { Position } from "@/lib/graph/Position.type";

export function Edge({
    fromId,
    toId,
    startPosition,
    currentPosition,
    variant,
}: {
    fromId: string;
    toId?: string;
    startPosition: Position;
    currentPosition: Position;
    variant?: "default" | "typewarning" | "typeerror";
}) {
    const geomDistance = Math.sqrt(
        Math.pow(currentPosition.x - startPosition.x, 2) +
        Math.pow(currentPosition.y - startPosition.y, 2)
    );

    const stroke = variant === "typeerror"
        ? "var(--edge-type-error-foreground)" : (variant === "typewarning"
            ? "var(--edge-type-warning-foreground)" : "var(--edge-foreground)");
    return (
        <path
            d={`
                M ${startPosition.x} ${startPosition.y}
                C ${startPosition.x + Math.min(100, geomDistance)} ${startPosition.y},
                  ${currentPosition.x - Math.min(100, geomDistance)} ${currentPosition.y},
                  ${currentPosition.x} ${currentPosition.y}
            `}
            stroke={stroke}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            shapeRendering="geometricPrecision" // TODO: add option to disable geometricPrecision
            style={{
                strokeDasharray: "10000",
                strokeDashoffset: "10000",
                animation: "draw-line 0.5s ease forwards"
            }} />
    );
}

