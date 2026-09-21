import { createNode } from "@/lib/graph/CreateNode.factory";
import { NodeExecutionError } from "@/lib/graph/NodeExecutionError";

describe("addition node", () => {
    it("GIVEN an addition node WHEN executed with numberA=3 and numberB=4 THEN returns result=7", async () => {
        // GIVEN
        const node = createNode("addition", "n1", { x: 0, y: 0 });

        // WHEN
        const result = await node.execute({ numberA: 3, numberB: 4 });

        // THEN
        expect(result.result).toBe(7);
    });

    it("GIVEN positive and negative inputs WHEN executed THEN returns their sum", async () => {
        // GIVEN
        const node = createNode("addition", "n1", { x: 0, y: 0 });

        // WHEN
        const result = await node.execute({ numberA: 5, numberB: -3 });

        // THEN
        expect(result.result).toBe(2);
    });

    it("GIVEN two negative inputs WHEN executed THEN returns their sum", async () => {
        // GIVEN
        const node = createNode("addition", "n1", { x: 0, y: 0 });

        // WHEN
        const result = await node.execute({ numberA: -2, numberB: -3 });

        // THEN
        expect(result.result).toBe(-5);
    });

    it("GIVEN zero and a number WHEN executed THEN returns the number", async () => {
        // GIVEN
        const node = createNode("addition", "n1", { x: 0, y: 0 });

        // WHEN
        const result = await node.execute({ numberA: 0, numberB: 5 });

        // THEN
        expect(result.result).toBe(5);
    });

    it("GIVEN a number and zero WHEN executed THEN returns the number", async () => {
        // GIVEN
        const node = createNode("addition", "n1", { x: 0, y: 0 });

        // WHEN
        const result = await node.execute({ numberA: 5, numberB: 0 });

        // THEN
        expect(result.result).toBe(5);
    });

    it("GIVEN both inputs are zero WHEN executed THEN returns 0", async () => {
        // GIVEN
        const node = createNode("addition", "n1", { x: 0, y: 0 });

        // WHEN
        const result = await node.execute({ numberA: 0, numberB: 0 });

        // THEN
        expect(result.result).toBe(0);
    });

    it("GIVEN decimal inputs WHEN executed THEN returns approximate sum (floating point)", async () => {
        // GIVEN
        const node = createNode("addition", "n1", { x: 0, y: 0 });

        // WHEN
        const result = await node.execute({ numberA: 0.1, numberB: 0.2 });

        // THEN
        expect(result.result).toBeCloseTo(0.3, 10);
    });

    it("GIVEN large numbers WHEN executed THEN returns their sum", async () => {
        // GIVEN
        const node = createNode("addition", "n1", { x: 0, y: 0 });

        // WHEN
        const result = await node.execute({ numberA: 1e10, numberB: 1e10 });

        // THEN
        expect(result.result).toBe(2e10);
    });

    it("GIVEN Infinity input WHEN executed THEN returns Infinity", async () => {
        // GIVEN
        const node = createNode("addition", "n1", { x: 0, y: 0 });

        // WHEN
        const result = await node.execute({ numberA: Infinity, numberB: 1 });

        // THEN
        expect(result.result).toBe(Infinity);
    });

    it("GIVEN NaN input WHEN executed THEN returns NaN", async () => {
        // GIVEN
        const node = createNode("addition", "n1", { x: 0, y: 0 });

        // WHEN
        const result = await node.execute({ numberA: NaN, numberB: 1 });

        // THEN
        expect(result.result).toBeNaN();
    });

    it("GIVEN -Infinity input WHEN executed THEN returns -Infinity", async () => {
        // GIVEN
        const node = createNode("addition", "n1", { x: 0, y: 0 });

        // WHEN
        const result = await node.execute({ numberA: -Infinity, numberB: -1 });

        // THEN
        expect(result.result).toBe(-Infinity);
    });

    it("GIVEN string inputs that parse to numbers WHEN executed THEN returns their sum", async () => {
        // GIVEN
        const node = createNode("addition", "n1", { x: 0, y: 0 });

        // WHEN
        const result = await node.execute({ numberA: "3", numberB: "4" } as any);

        // THEN
        expect(result.result).toBe(7);
    });

    it("GIVEN boolean input WHEN executed THEN throws INVALID_INPUT_TYPE error", async () => {
        // GIVEN
        const node = createNode("addition", "n1", { x: 0, y: 0 });

        // WHEN
        const promise = node.execute({ numberA: true, numberB: 1 } as any);

        // THEN
        await expect(promise).rejects.toThrow(NodeExecutionError.translationKeys.INVALID_INPUT_TYPE);
    });

    it("GIVEN a non-numeric string WHEN executed THEN throws INVALID_INPUT_TYPE error", async () => {
        // GIVEN
        const node = createNode("addition", "n1", { x: 0, y: 0 });

        // WHEN
        const promise = node.execute({ numberA: "hello", numberB: 1 } as any);

        // THEN
        await expect(promise).rejects.toThrow(NodeExecutionError.translationKeys.INVALID_INPUT_TYPE);
    });
});
