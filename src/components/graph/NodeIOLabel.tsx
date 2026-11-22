import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import React from "react";
import { NodeIOIdentifier } from "./NodeIO";
import { TYPE_DEFINITION_KEY, TYPE_DEFINITIONS } from "@/lib/graph/TypeDefinitions";
import { getTypeDisplayName } from "@/lib/graph/getTypeDisplayName";


type NodeIOLabelProps = {
    type: "input" | "output";
    data_type: string;
    nodeIOIdentifier: NodeIOIdentifier;
    ioTranslationKey?: string;
    children?: React.ReactNode;
};


export const NodeIOLabel: React.FC<NodeIOLabelProps> = ({ children, type, data_type, nodeIOIdentifier, ioTranslationKey }) => {
    const t = useTranslations("graph");

    const getLabel = () => {
        if (ioTranslationKey) {
            return t(ioTranslationKey);
        }
        
        if (data_type in TYPE_DEFINITIONS) {
            return t(TYPE_DEFINITIONS[data_type as TYPE_DEFINITION_KEY].translationKey);
        }
        
        return getTypeDisplayName(data_type, t);
    };

    return (
        <div
            className={cn("node-io-label", type)}
        >
            <span className="node-io-label-text">{getLabel()}</span> {children}
        </div>
    );
};