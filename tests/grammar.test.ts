import { Parse } from "grammar-well";
import Grammar from "../gramer/grammar";

describe("Grammar", () => {
    it("should parse a simple query", () => {
        const query = "CREATE TEMP FUNCTION ParseHttpCode(json INT64, a STRING) RETURNS INT64 AS ();";

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
