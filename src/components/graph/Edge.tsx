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
            ? "var(--edge-type-warning-foreground)" : "var(--edge-foreground)"); //generateColorFromString(fromId + "0000")); 
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
                animation: "draw-line 0.5s ease forwards",
            }} />
    );
}

const generateColorFromString = (str: string) => {
    var hash = 0;
    if (str.length === 0) return hash;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    var rgb = [0, 0, 0];
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 255;
        rgb[i] = value;
    }
    return `hsl(${80 + ((rgb[0]*rgb[1]*rgb[2]) % 260)} 70% 30%)`;
}