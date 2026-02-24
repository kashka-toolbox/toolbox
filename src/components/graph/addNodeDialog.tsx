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
import { NODE_CATEGORIES, NodeDefinition } from "@/lib/graph/NodeDefinition";

export function AddNodeDialog({ graphRef }: { graphRef: React.RefObject<HTMLDivElement> }) {
    const t_graph = useTranslations("graph");
    const t_dialog = useTranslations("graph.addNodeDialog");
    const t_node = useTranslations("graph.nodes");

    const [addMenuVisible, setAddMenuVisible] = useState(false);
    const nodePosition = useRef<Position | null>(null);
    const addNodeFromDefinition = useGraphStore((store) => store.addNodeFromDefinition);
    const scale = useGraphStore((store) => store.scale);
    const panOffset = useGraphStore((store) => store.panOffset);

    const onContextMenu = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const isInteractive = target.closest('.node, button, input, [data-io-identifier]');
        if (isInteractive) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const rect = graphRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;
        
        const graphX = (relativeX - panOffset.x) / scale;
        const graphY = (relativeY - panOffset.y) / scale;
        
        setAddMenuVisible(true);
        nodePosition.current = {
            x: graphX,
            y: graphY,
        };
    }, [graphRef, scale, panOffset]);

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

    return (
        <Dialog open={addMenuVisible} onOpenChange={setAddMenuVisible}>
            <DialogContent>
                <DialogTitle className="font-bold">{t_dialog("title")}</DialogTitle>
                <Command>
                    <CommandInput
                        placeholder={t_dialog("searchbar.placeholder")}
                    />

                    <CommandList className="min-w-[300px] max-h-80 overflow-y-auto rounded border-border border">
                        <CommandEmpty>{t_dialog("searchbar.noResultsFound")}</CommandEmpty>
                        {
                            Object.entries(NODE_CATEGORIES).map(([key, category]) => {
                                const nodesInCategory = Object.entries(NODE_DEFINITIONS).filter(([node_key, node_def]) => node_def.nodeCategory === key);
                                if (nodesInCategory.length === 0) {
                                    return null;
                                }

                                return (
                                    <CommandGroup key={key} heading={t_graph(category.translationKey)}>
                                        {nodesInCategory.map(([node_key, def]: [string, NodeDefinition<any, any>]) => (
                                            <CommandItem key={node_key} onSelect={() => {
                                                addNodeFromDefinition(node_key as NODE_TYPE, nodePosition.current!);
                                                setAddMenuVisible(false);
                                            }}>
                                                <category.icon className="mr-2 h-4 w-4 min-w-4 place-self-center" />
                                                <span className="text-nowrap inline-block">{t_node(`${def.name}.name`)}</span>
                                                <span className="text-muted-foreground pl-2 text-xs text-ellipsis overflow-hidden min-w-0">{t_node(`todo.description`)}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                );
                            })
                        }
                    </CommandList>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
