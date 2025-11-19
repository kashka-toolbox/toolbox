import { useEffect, useRef } from "react";

export function GraphInfiniteCanvasScroll() {
    const sizeRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const resizeScrollArea = () => {
            if (!sizeRef.current) {
                return;
            }

            const parentScrollLeft =
                (sizeRef.current.parentElement?.clientWidth ?? 0) +
                (sizeRef.current.parentElement?.scrollLeft ?? 0);
            const parentScrollHeight =
                (sizeRef.current.parentElement?.clientHeight ?? 0) +
                (sizeRef.current.parentElement?.scrollTop ?? 0);
            sizeRef.current.style.minHeight = (parentScrollHeight +
                (sizeRef.current.parentElement?.clientHeight ?? 0)) + "px";
            sizeRef.current.style.minWidth = (parentScrollLeft +
                (sizeRef.current.parentElement?.clientWidth ?? 0)) + "px";
        };

        resizeScrollArea();
        const resizeObserver = new ResizeObserver(resizeScrollArea);
        if (sizeRef.current?.parentElement) {
            resizeObserver.observe(sizeRef.current.parentElement);
        }

        sizeRef.current?.parentElement?.addEventListener(
            "scroll",
            resizeScrollArea,
        );

        return () => {
            resizeObserver.disconnect();
            sizeRef.current?.parentElement?.removeEventListener(
                "scroll",
                resizeScrollArea,
            );
        };
    }, [
        sizeRef.current?.parentElement?.scrollLeft,
        sizeRef.current?.parentElement?.clientWidth,
        sizeRef.current?.parentElement?.scrollTop,
        sizeRef.current?.parentElement?.clientHeight,
        sizeRef.current?.parentElement,
    ]);

    return (
        <div
            className="w-full h-full pointer-events-none"
            style={{
                backgroundImage: "radial-gradient(hsl(var(--border)) 1px, transparent 0)",
                backgroundSize: "40px 40px"
            }}  
            ref={sizeRef}
        />
    );
}
