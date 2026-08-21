import { TYPE_DEFINITION_KEY } from "./TypeDefinitions";

export type NodeSetting = {
    /**
     * Used to determine the input UI & validation.
     */
    type: TYPE_DEFINITION_KEY;
    translationKey: string;
    defaultValue: any;
    value: any;
};
export type NodeSettings = {
    [key: string]: Partial<NodeSetting>;
};

// Node Setting constants: 
export const NODE_SETTING_UI_LABEL_NAME = "UI_LABEL_NAME";