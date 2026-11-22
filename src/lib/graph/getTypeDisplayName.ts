import { isArrayType, getArrayInnerType, TYPE_DEFINITIONS, TYPE_DEFINITION_KEY } from "./TypeDefinitions";

type TranslateFunction = (key: string, values?: Record<string, string>) => string;

export function getTypeDisplayName(type: string, t: TranslateFunction): string {
    if (isArrayType(type)) {
        const innerType = getArrayInnerType(type);
        const innerDisplayName = getTypeDisplayName(innerType, t);
        return t("types.arrayOf", { type: innerDisplayName });
    }

    if (type in TYPE_DEFINITIONS) {
        return t(TYPE_DEFINITIONS[type as TYPE_DEFINITION_KEY].translationKey);
    }

    const parts = type.split(".");
    let currentKey = "types";
    let result = "";

    for (const part of parts) {
        currentKey = currentKey + "." + part;
        const translated = t(currentKey);
        if (translated !== currentKey) {
            result = translated;
        } else {
            result = result ? result + " " + part : part;
        }
    }

    return result || type;
}
