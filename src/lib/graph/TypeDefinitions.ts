import { TypeDefinition } from "./TypeDefinition";

export type TYPE_DEFINITION_KEY =
    | "any"
    | "numeric"
    | "text.any"
    | "text.base64"
    | "text.uuid";

export const TYPE_DEFINITIONS: {
    [key in TYPE_DEFINITION_KEY]: TypeDefinition;
} = {
    "any": {
        name: "any",
        translationKey: "types.any",
    },
    "numeric": {
        name: "numeric",
        translationKey: "types.numeric",
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