import { createNode } from "@/lib/graph/CreateNode.factory";
import { areTypesCompatible, CompatibilityVariant } from "./areTypesCompatible";
import { TYPE_DEFINITION_KEY, TYPE_DEFINITIONS } from "./TypeDefinitions";
import { TypeDefinition } from "./TypeDefinition";

describe("areTypesCompatible", () => {
    it("GIVEN the same type twice WHEN type checked THEN returns compatible", async () => {
        // GIVEN
        const typeA: TYPE_DEFINITION_KEY = "text.uuid";

        // WHEN
        const result: CompatibilityVariant = areTypesCompatible(typeA, typeA);

        // THEN
        expect(result).toBe("compatible");
    });

    it("GIVEN 2 different types WHEN type checked THEN returns incompatible", async () => {
        // GIVEN
        const typeA: TYPE_DEFINITION_KEY = "text.uuid";
        const typeB: TYPE_DEFINITION_KEY = "numeric.any";

        // WHEN
        const result: CompatibilityVariant = areTypesCompatible(typeA, typeB);

        // THEN
        expect(result).toBe("incompatible");
    });

    it("GIVEN the same array type twice WHEN type checked THEN returns compatible", async () => {
        // GIVEN
        const typeA: string = "array.text.uuid";

        // WHEN
        const result: CompatibilityVariant = areTypesCompatible(typeA, typeA);

        // THEN
        expect(result).toBe("compatible");
    });

    it("GIVEN the same nested array type twice WHEN type checked THEN returns compatible", async () => {
        // GIVEN
        const typeA: string = "array.array.array.array.text.uuid";

        // WHEN
        const result: CompatibilityVariant = areTypesCompatible(typeA, typeA);

        // THEN
        expect(result).toBe("compatible");
    });

    it("GIVEN two different subtypes WHEN type checked THEN returns incompatible", async () => {
        // GIVEN
        const typeA: TYPE_DEFINITION_KEY = "text.uuid";
        const typeB: TYPE_DEFINITION_KEY = "text.base64";

        // WHEN
        const result: CompatibilityVariant = areTypesCompatible(typeA, typeB);

        // THEN
        expect(result).toBe("incompatible");
    });

    /**
     * Explaination: It's a unknown if any text is a UUID. 
     */
    it("GIVEN a explicit subtype and an any subtype WHEN type checking any into explicit THEN returns warning", async () => {
        // GIVEN
        const typeA: TYPE_DEFINITION_KEY = "text.any";
        const typeB: TYPE_DEFINITION_KEY = "text.uuid";

        // WHEN
        const result: CompatibilityVariant = areTypesCompatible(typeA, typeB);

        // THEN
        expect(result).toBe("warning");
    });

    /**
     * Explaination: A UUID represented as Text is Text.
     */
    it("GIVEN a explicit subtype and an any subtype WHEN type checking explicit into any THEN returns compatible", async () => {
        // GIVEN
        const typeA: TYPE_DEFINITION_KEY = "text.uuid";
        const typeB: TYPE_DEFINITION_KEY = "text.any";

        // WHEN
        const result: CompatibilityVariant = areTypesCompatible(typeA, typeB);

        // THEN
        expect(result).toBe("compatible");
    });

});
