import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import React from "react";
import { NodeIOIdentifier } from "./NodeIO";
import { TYPE_DEFINITION_KEY, TYPE_DEFINITIONS } from "@/lib/graph/TypeDefinitions";


type NodeIOLabelProps = {
    type: "input" | "output";
    data_type: TYPE_DEFINITION_KEY;
    nodeIOIdentifier: NodeIOIdentifier;
    ioTranslationKey?: string;
    children?: React.ReactNode;
};


export const NodeIOLabel: React.FC<NodeIOLabelProps> = ({ children, type, data_type, nodeIOIdentifier, ioTranslationKey }) => {
    const t = useTranslations("graph");

    return (
        <div
            className={cn("node-io-label", type)}
        >
            <span className="node-io-label-text">{ioTranslationKey ? t(ioTranslationKey) : t(TYPE_DEFINITIONS[data_type].translationKey)}</span> {children}
        </div>
    );
};