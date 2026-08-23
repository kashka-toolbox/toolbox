export class NodeExecutionError extends Error {
    public static translationKeys = {
        DIVIDE_BY_ZERO: "divideByZero"
    }

    constructor(messageTranslationKey: string) {
        super(messageTranslationKey);
        Object.setPrototypeOf(this, NodeExecutionError.prototype);
    }
}