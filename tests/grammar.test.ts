import { Parse } from "grammar-well";
import Grammar from "../gramer/grammar";

describe("Grammar", () => {
    it("should parse a simple query", () => {
        const query = `CREATE TEMP FUNCTION Arithmetic(x INT64, y INT64, z INT64)
RETURNS INT64
AS (
  x + y * z
);`

        const grammar = new Grammar();

        try {
            const result = Parse(grammar, query);
            expect(result).toBeDefined();
        } catch (e) {
            console.error("Parse failed:", e);
            throw e;
        }
    });
});
