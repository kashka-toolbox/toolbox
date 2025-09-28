
const areTypesCompatibleCache: Record<string, CompatibilityVariant> = {};

export type CompatibilityVariant = "compatible" | "incompatible" | "warning";

/**
 * Checks if two types are compatible.
 *
 * text.base64:text.base64 is compatible
 * text.any:text.base64 is warning
 * text.base64:text.any is compatible
 * text.base64:text.text is incompatible
 * any:any is compatible
 *
 * those keys can have any depth smth.smth: smth.any is compatible, smth.any:smth.smth is warning
 *
 * @param sourceType The source type.
 * @param targetType The target type.
 * @returns True if the types are compatible, false otherwise.
 */
export function areTypesCompatible(sourceType: string, targetType: string): CompatibilityVariant {
    const cacheKey = `${sourceType}:${targetType}`;
    if (areTypesCompatibleCache[cacheKey] !== undefined) {
        return areTypesCompatibleCache[cacheKey];
    }


    const sourceParts = sourceType.split(".");
    const targetParts = targetType.split(".");

    const maxLength = Math.max(sourceParts.length, targetParts.length);

    let variant: CompatibilityVariant = "compatible";

    const sourceEndsWithAny = sourceParts[sourceParts.length - 1] === "any";
    const targetEndsWithAny = targetParts[targetParts.length - 1] === "any";

    if(sourceEndsWithAny) {
        // number.any:text.any is incompatible
        // text.any:text.base64 is warning
        // text.any:text.any is compatible
        // text.base64:text.any is compatible

        // check if the rest of the parts are the same
        for(let i = 0; i < maxLength - 1; i++) {
            if(sourceParts[i] !== targetParts[i] && (targetParts[i] !== "any" && sourceParts[i] !== "any")) {
                variant = "incompatible";
                break;
            } else if(sourceParts[i] !== targetParts[i] && (sourceParts[i] === "any")) {
                variant = "warning";
                break;
            }
        }
    } else { // text.base64:text.any is compatible
        // check if the rest of the parts are the same
        for(let i = 0; i < maxLength; i++) {
            if(sourceParts[i] !== targetParts[i] && targetParts[i] !== "any") {
                variant = "incompatible";
                break;
            } else if(sourceParts[i] !== targetParts[i] && sourceParts[i] === "any") {
                variant = "warning";
                break;
            }
        }
    }

    areTypesCompatibleCache[cacheKey] = variant;
    return variant;
}