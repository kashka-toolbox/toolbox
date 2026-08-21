import { Dialog, DialogTitle } from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DialogContent } from "../ui/dialog";
import { useGraphStore, useNodeState } from "./GraphContextProvider";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { NodeSettings } from "@/lib/graph/NodeSettings";

interface EditNodeSettingsDialogProps {
    nodeId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditNodeSettingsDialog({
    nodeId,
    open,
    onOpenChange,
}: EditNodeSettingsDialogProps) {
    const nodeState = useNodeState(nodeId);
    if (!nodeState) return null;

    const t_settings = useTranslations("graph.nodes.settings");
    const t_dialog = useTranslations("graph.editNodeSettingsDialog");
    const updateNodeSetting = useGraphStore((store) => store.updateNodeSetting);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogTitle className="font-bold">{t_dialog("title")}</DialogTitle>
                {
                    nodeState.settings && Object.entries(nodeState.settings as NodeSettings).map(([key, setting]) => {
                        return <span>
                            <Label htmlFor={setting.translationKey}>
                                {t_settings(setting.translationKey + ".name")}
                            </Label>
                            <Input key={setting.translationKey} value={setting.value} onChange={(e) =>
                                updateNodeSetting(nodeId, key, { ...setting, value: e.currentTarget.value })} />
                        </span>
                    })
                }
            </DialogContent>
        </Dialog>
    );
}
