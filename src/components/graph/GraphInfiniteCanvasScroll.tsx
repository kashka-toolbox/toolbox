import { Position } from "@/lib/graph/Position.type";

export function GraphInfiniteCanvasScroll({ 
}: { 
    scale: number; 
    panOffset: Position;
}) {
    const gridSize = 40;
    const dotSize = 1;
    
    return (
        <div
            className="absolute pointer-events-none"
            style={{
                width: "50000px",
                height: "50000px",
                left: "-25000px",
                top: "-25000px",
                backgroundImage: `radial-gradient(circle, hsl(var(--border)) ${dotSize}px, transparent ${dotSize}px)`,
                backgroundSize: `${gridSize}px ${gridSize}px`,
            }}
        />
    );
}
