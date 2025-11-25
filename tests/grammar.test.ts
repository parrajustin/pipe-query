import { Parse } from "grammar-well";
import Grammar from "../gramer/grammar";
import * as fs from "fs";

describe("Grammar", () => {
    it("should parse a simple query", () => {
        const query = `CREATE TEMP FUNCTION Arithmetic(x INT64, y INT64, z INT64)
RETURNS INT64
AS (
  x + y * z
);`;

        const grammar = new Grammar();

        try {
            const result = Parse(grammar, query);
            expect(result).toBeDefined();
        } catch (e) {
            console.error("Parse failed:", e);
            throw e;
        }
    });

    it("should parse prev examples", () => {
        const query = `/*
 * Test File: operator_precedence.sql
 * Purpose: Validate correct parsing order of operators based on precedence rules.
 * Coverage:
 * - Arithmetic (* / vs + -).
 * - Logical (NOT > AND > OR).
 * - Comparison vs Logical.
 * - Bitwise operations.
 * - Parentheses overriding precedence.
 */

-- 1. Arithmetic Precedence
-- Should be parsed as: x + (y * z)
CREATE TEMP FUNCTION Arithmetic(x INT64, y INT64, z INT64)
RETURNS INT64
AS (
  x + y * z
);

-- 2. Logical Precedence
-- Should be parsed as: x OR (y AND (NOT z))
CREATE TEMP FUNCTION Logic(x BOOL, y BOOL, z BOOL)
RETURNS BOOL
AS (
  x OR y AND NOT z
);

-- 3. Comparison and Logical
-- Should be parsed as: (x > 5) AND (y < 10)
CREATE TEMP FUNCTION CompareLogic(x INT64, y INT64)
RETURNS BOOL
AS (
  x > 5 AND y < 10
);`;

        const grammar = new Grammar();

        try {
            const result = Parse(grammar, query);
            expect(result).toBeDefined();
        } catch (e) {
            console.error("Parse failed:", e);
            throw e;
        }
    });

    it("should parse example 4", () => {
        const query = `-- 4. Bitwise Precedence
-- Should be parsed as: (x & y) | (z ^ w)
CREATE TEMP FUNCTION Bitwise(x INT64, y INT64, z INT64, w INT64)
RETURNS INT64
AS (
  x & y | z ^ w
);`;

        const grammar = new Grammar();

        try {
            const result = Parse(grammar, query);
            expect(result).toBeDefined();
        } catch (e) {
            console.error("Parse failed:", e);
            throw e;
        }
    });

    it("should parse example 5", () => {
        const query = `
        
  -- 5. Complex Mixed Expression
-- Should be parsed as: ((a + b) * c) > (d / e)
CREATE TEMP FUNCTION Complex(a INT64, b INT64, c INT64, d INT64, e INT64)
RETURNS BOOL
AS (
  (a + b) * c > d / e
);`;

        const grammar = new Grammar();

        try {
            const result = Parse(grammar, query);
            expect(result).toBeDefined();
        } catch (e) {
            console.error("Parse failed:", e);
            throw e;
        }
    });

    it("should parse operator_precedence.sql", () => {
        const query = fs.readFileSync("tests/testdata/operator_precedence.sql", "utf-8");
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
