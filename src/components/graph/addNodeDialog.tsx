import { Position } from "@/lib/graph/Position.type";
import { Dialog, DialogTitle } from "@radix-ui/react-dialog";
import { CubeIcon } from "@radix-ui/react-icons";
import { Command } from "cmdk";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "../ui/command";
import { DialogContent } from "../ui/dialog";
import { useGraphStore } from "./GraphContextProvider";
import { NODE_DEFINITIONS, NODE_TYPE } from "@/lib/graph/NodeDefinitions";
import { NodeDefinition } from "@/lib/graph/NodeDefinition";
import { createNode } from "@/lib/graph/CreateNode.factory";
import { set } from "react-hook-form";

export function AddNodeDialog({ graphRef }: { graphRef: React.RefObject<HTMLDivElement> }) {
    const t = useTranslations("graph.addNodeDialog");
    const t_node = useTranslations("graph.nodes");

    const [addMenuVisible, setAddMenuVisible] = useState(false);
    const nodePosition = useRef<Position | null>(null);
    const addNodeFromDefinition = useGraphStore((store) => store.addNodeFromDefinition);

    const onContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target !== graphRef.current) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        const rect = graphRef.current?.getBoundingClientRect();
        const relativeToGraphX = e.clientX - (rect?.left ?? 0);
        const relativeToGraphY = e.clientY - (rect?.top ?? 0);
        const relativeToGraphScrollX =
            (graphRef.current?.scrollLeft ?? 0) + relativeToGraphX;
        const relativeToGraphScrollY =
            (graphRef.current?.scrollTop ?? 0) + relativeToGraphY;
        setAddMenuVisible(true);
        nodePosition.current = {
            x: relativeToGraphScrollX,
            y: relativeToGraphScrollY,
        };
    }, [graphRef, setAddMenuVisible]);

    useEffect(() => {
        const currentGraphRef = graphRef.current;
        if (!currentGraphRef) return;

        currentGraphRef.addEventListener("contextmenu", onContextMenu as any);

        return () => {
            currentGraphRef.removeEventListener(
                "contextmenu",
                onContextMenu as any,
            );
        };
    }, [graphRef, onContextMenu]);

    console.info("Render Add Node Dialog", Date.now());

    return (
        <Dialog open={addMenuVisible} onOpenChange={setAddMenuVisible}>
            <DialogContent>
                <DialogTitle>{t("title")} {nodePosition.current?.x} {nodePosition.current?.y}</DialogTitle>
                <Command>
                    <CommandInput
                        placeholder={t("searchbar.placeholder")}
                    />

                    <CommandList className="min-w-[300px] max-h-80 overflow-y-auto">
                        <CommandEmpty>{t("searchbar.noResultsFound")}</CommandEmpty>
                                            {
                        Object.entries(NODE_DEFINITIONS).map(([key, def]) => (
                            <CommandItem key={key} onSelect={() => {
                                addNodeFromDefinition(key as NODE_TYPE, nodePosition.current!);
                                setAddMenuVisible(false);
                            }}>
                                <CubeIcon className="mr-2 h-4 w-4 min-w-4 place-self-center" />
                                <span className="text-nowrap inline-block">{t_node(`${def.name}.name`)}</span>
                                <span className="text-muted-foreground pl-2 text-xs text-ellipsis overflow-hidden min-w-0">{t_node(`todo.description`)}</span>
                                <CommandShortcut className="w-fit pl-2">NOT YET IMPLEMENTED</CommandShortcut>
                            </CommandItem>
                        ))
                    }
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
