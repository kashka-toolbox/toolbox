import { useTranslations } from "next-intl";

/**
 * Made for NODE_SETTING_UI_LABEL_NAME values. 
 * Tries to translate values if possible, else displays them directly.
 */
export const useSpeculativeUiLabelI18N = (): ((value: string) => string) => {
const t = useTranslations("graph.speculativelabel");
    
    return (value: string): string => {
        if (t.has(value.toLowerCase())) {
            return t(value.toLowerCase());
        }
        return value;
    };
};