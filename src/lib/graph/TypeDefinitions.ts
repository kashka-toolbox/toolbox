import { TypeDefinition } from "./TypeDefinition";

export type TYPE_DEFINITION_KEY =
    | "any"
    | "numeric.any"
    | "numeric.int"
    | "text.any"
    | "text.base64"
    | "text.uuid";

export const PRIMITIVE_TYPES = ["any", "numeric", "text.any", "text.base64", "text.uuid"] as const;

export const TYPE_DEFINITIONS: {
    [key in TYPE_DEFINITION_KEY]: TypeDefinition;
} = {
    "any": {
        name: "any",
        translationKey: "types.any",
    },
    "numeric.any": {
        name: "numeric.any",
        translationKey: "types.numeric.any",
    },
    "numeric.int": {
        name: "numeric.any",
        translationKey: "types.numeric.int",
    },
    "text.any": {
        name: "text.any",
        translationKey: "types.text.any",
    },
    "text.base64": {
        name: "text.base64",
        translationKey: "types.text.base64",
    },
    "text.uuid": {
        name: "text.uuid",
        translationKey: "types.text.uuid",
    },
};

export const ARRAY_TYPE_PREFIX = "array.";

export function isArrayType(type: string): boolean {
    return type.startsWith(ARRAY_TYPE_PREFIX);
}

export function getArrayInnerType(type: string): string {
    if (!isArrayType(type)) {
        throw new Error(`Type "${type}" is not an array type`);
    }
    return type.slice(ARRAY_TYPE_PREFIX.length);
}

export function createArrayType(innerType: string): string {
    return ARRAY_TYPE_PREFIX + innerType;
}