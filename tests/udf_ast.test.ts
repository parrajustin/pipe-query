import { Parse } from "grammar-well";
import Grammar from "../gramer/grammar";
import {
    BetweenExpr,
    Binary,
    BinaryOperator,
    CaseExpr,
    CreateFunctionStmt,
    InExpr,
    IsBoolExpr,
    IsNullExpr,
    LikeExpr,
    Literal,
    LiteralKind,
    Unary,
    UnaryOperator,
    Variable
} from "../src/parser/ast";

describe("UDF AST", () => {
    it("should generate a correct AST for a simple arithmetic UDF", () => {
        const query = `CREATE TEMP FUNCTION Arithmetic(x INT64, y INT64, z INT64)
RETURNS INT64
AS (
  x + y * z
);`;

        const grammar = new Grammar();
        const result = Parse(grammar, query);

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(CreateFunctionStmt);

        const createFunctionStmt = result[0] as CreateFunctionStmt;
        expect(createFunctionStmt.name).toBe("Arithmetic");
        expect(createFunctionStmt.is_private).toBe(false);
        expect(createFunctionStmt.params.length).toBe(3);
        expect(createFunctionStmt.body).toBeInstanceOf(Binary);

        const body = createFunctionStmt.body as Binary;
        expect(body.operator).toBe(BinaryOperator.PLUS);
        expect(body.left).toBeInstanceOf(Variable);
        expect((body.left as Variable).name).toBe("x");

        expect(body.right).toBeInstanceOf(Binary);
        const right = body.right as Binary;
        expect(right.operator).toBe(BinaryOperator.MULTIPLY);
        expect(right.left).toBeInstanceOf(Variable);
        expect((right.left as Variable).name).toBe("y");
        expect(right.right).toBeInstanceOf(Variable);
        expect((right.right as Variable).name).toBe("z");
    });

    it("should correctly identify a private function", () => {
        const query = `CREATE PRIVATE FUNCTION PrivateFunc(x INT64)
RETURNS INT64
AS (
  x
);`;

        const grammar = new Grammar();
        const result = Parse(grammar, query);

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(CreateFunctionStmt);

        const createFunctionStmt = result[0] as CreateFunctionStmt;
        expect(createFunctionStmt.name).toBe("PrivateFunc");
        expect(createFunctionStmt.is_private).toBe(true);
    });

    it("should correctly identify a public function", () => {
        const query = `CREATE PUBLIC FUNCTION PublicFunc(x INT64)
RETURNS INT64
AS (
  x
);`;

        const grammar = new Grammar();
        const result = Parse(grammar, query);

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(CreateFunctionStmt);

        const createFunctionStmt = result[0] as CreateFunctionStmt;
        expect(createFunctionStmt.name).toBe("PublicFunc");
        expect(createFunctionStmt.is_private).toBe(false);
    });

    it("should handle unary operators and concatenation", () => {
        const query = `CREATE TEMP FUNCTION UnaryConcat(x STRING, y INT64)
RETURNS STRING
AS (
  x || -y
);`;

        const grammar = new Grammar();
        const result = Parse(grammar, query);

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(CreateFunctionStmt);

        const createFunctionStmt = result[0] as CreateFunctionStmt;
        expect(createFunctionStmt.body).toBeInstanceOf(Binary);

        const body = createFunctionStmt.body as Binary;
        expect(body.operator).toBe(BinaryOperator.CONCAT);
        expect(body.left).toBeInstanceOf(Variable);
        expect((body.left as Variable).name).toBe("x");

        expect(body.right).toBeInstanceOf(Unary);
        const right = body.right as Unary;
        expect(right.operator).toBe(UnaryOperator.MINUS);
        expect(right.right).toBeInstanceOf(Variable);
        expect((right.right as Variable).name).toBe("y");
    });

    it("should handle logical expressions", () => {
        const query = `CREATE TEMP FUNCTION Logical(x BOOL, y BOOL, z BOOL)
RETURNS BOOL
AS (
  x OR y AND NOT z
);`;

        const grammar = new Grammar();
        const result = Parse(grammar, query);

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(CreateFunctionStmt);

        const createFunctionStmt = result[0] as CreateFunctionStmt;
        expect(createFunctionStmt.body).toBeInstanceOf(Binary);

        const body = createFunctionStmt.body as Binary;
        expect(body.operator).toBe(BinaryOperator.OR);
        expect(body.left).toBeInstanceOf(Variable);
        expect((body.left as Variable).name).toBe("x");

        expect(body.right).toBeInstanceOf(Binary);
        const right = body.right as Binary;
        expect(right.operator).toBe(BinaryOperator.AND);
        expect(right.left).toBeInstanceOf(Variable);
        expect((right.left as Variable).name).toBe("y");

        expect(right.right).toBeInstanceOf(Unary);
        const not = right.right as Unary;
        expect(not.operator).toBe(UnaryOperator.NOT);
        expect(not.right).toBeInstanceOf(Variable);
        expect((not.right as Variable).name).toBe("z");
    });

    it("should handle comparison expressions", () => {
        const query = `CREATE TEMP FUNCTION Compare(x INT64, y INT64)
RETURNS BOOL
AS (
  x > y
);`;

        const grammar = new Grammar();
        const result = Parse(grammar, query);

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(CreateFunctionStmt);

        const createFunctionStmt = result[0] as CreateFunctionStmt;
        expect(createFunctionStmt.body).toBeInstanceOf(Binary);

        const body = createFunctionStmt.body as Binary;
        expect(body.operator).toBe(BinaryOperator.GREATER_THAN);
        expect(body.left).toBeInstanceOf(Variable);
        expect((body.left as Variable).name).toBe("x");
        expect(body.right).toBeInstanceOf(Variable);
        expect((body.right as Variable).name).toBe("y");
    });

    it("should handle IS NULL and IS BOOL expressions", () => {
        const query = `CREATE TEMP FUNCTION IsNullAndBool(x INT64, y BOOL)
RETURNS BOOL
AS (
  x IS NOT NULL AND y IS TRUE
);`;

        const grammar = new Grammar();
        const result = Parse(grammar, query);

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(CreateFunctionStmt);

        const createFunctionStmt = result[0] as CreateFunctionStmt;
        expect(createFunctionStmt.body).toBeInstanceOf(Binary);

        const body = createFunctionStmt.body as Binary;
        expect(body.operator).toBe(BinaryOperator.AND);

        expect(body.left).toBeInstanceOf(IsNullExpr);
        const isNull = body.left as IsNullExpr;
        expect(isNull.not).toBe(true);
        expect(isNull.expression).toBeInstanceOf(Variable);
        expect((isNull.expression as Variable).name).toBe("x");

        expect(body.right).toBeInstanceOf(IsBoolExpr);
        const isBool = body.right as IsBoolExpr;
        expect(isBool.not).toBe(false);
        expect(isBool.value).toBe(true);
        expect(isBool.expression).toBeInstanceOf(Variable);
        expect((isBool.expression as Variable).name).toBe("y");
    });

    it("should handle IN expressions", () => {
        const query = `CREATE TEMP FUNCTION InExpr(x STRING)
RETURNS BOOL
AS (
  x IN ("a", "b", "c")
);`;

        const grammar = new Grammar();
        const result = Parse(grammar, query);

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(CreateFunctionStmt);

        const createFunctionStmt = result[0] as CreateFunctionStmt;
        expect(createFunctionStmt.body).toBeInstanceOf(InExpr);

        const body = createFunctionStmt.body as InExpr;
        expect(body.not).toBe(false);
        expect(body.expression).toBeInstanceOf(Variable);
        expect((body.expression as Variable).name).toBe("x");

        expect(body.values).toBeInstanceOf(Array);
        expect(body.values.length).toBe(3);
        expect(body.values[0]).toBeInstanceOf(Literal);
        expect((body.values[0] as Literal).value).toBe('"a"');
    });

    it("should handle LIKE expressions", () => {
        const query = `CREATE TEMP FUNCTION LikeExpr(x STRING)
RETURNS BOOL
AS (
  x LIKE "a%"
);`;

        const grammar = new Grammar();
        const result = Parse(grammar, query);

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(CreateFunctionStmt);

        const createFunctionStmt = result[0] as CreateFunctionStmt;
        expect(createFunctionStmt.body).toBeInstanceOf(LikeExpr);

        const body = createFunctionStmt.body as LikeExpr;
        expect(body.not).toBe(false);
        expect(body.expression).toBeInstanceOf(Variable);
        expect((body.expression as Variable).name).toBe("x");

        expect(body.pattern).toBeInstanceOf(Literal);
        expect((body.pattern as Literal).value).toBe('"a%"');
    });

    it("should handle BETWEEN expressions", () => {
        const query = `CREATE TEMP FUNCTION BetweenExpr(x INT64)
RETURNS BOOL
AS (
  x BETWEEN 1 AND 10
);`;

        const grammar = new Grammar();
        const result = Parse(grammar, query);

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(CreateFunctionStmt);

        const createFunctionStmt = result[0] as CreateFunctionStmt;
        expect(createFunctionStmt.body).toBeInstanceOf(BetweenExpr);

        const body = createFunctionStmt.body as BetweenExpr;
        expect(body.not).toBe(false);
        expect(body.expression).toBeInstanceOf(Variable);
        expect((body.expression as Variable).name).toBe("x");

        expect(body.lower).toBeInstanceOf(Literal);
        expect((body.lower as Literal).value).toBe("1");
        expect(body.upper).toBeInstanceOf(Literal);
        expect((body.upper as Literal).value).toBe("10");
    });

    it("should handle CASE expressions", () => {
        const query = `CREATE TEMP FUNCTION CaseExpr(x INT64)
RETURNS STRING
AS (
  CASE x
    WHEN 1 THEN "one"
    WHEN 2 THEN "two"
    ELSE "other"
  END
);`;

        const grammar = new Grammar();
        const result = Parse(grammar, query);

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(CreateFunctionStmt);

        const createFunctionStmt = result[0] as CreateFunctionStmt;
        expect(createFunctionStmt.body).toBeInstanceOf(CaseExpr);

        const body = createFunctionStmt.body as CaseExpr;
        expect(body.cases.length).toBe(2);
        expect(body.cases[0].condition).toBeInstanceOf(Literal);
        expect((body.cases[0].condition as Literal).value).toBe("1");
        expect(body.cases[0].result).toBeInstanceOf(Literal);
        expect((body.cases[0].result as Literal).value).toBe('"one"');
        expect(body.elseBranch).toBeInstanceOf(Literal);
        expect((body.elseBranch as Literal).value).toBe('"other"');
    });

    it("should handle bitwise expressions", () => {
        const query = `CREATE TEMP FUNCTION Bitwise(x INT64, y INT64, z INT64)
RETURNS INT64
AS (
  x & y | z
);`;

        const grammar = new Grammar();
        const result = Parse(grammar, query);

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(CreateFunctionStmt);

        const createFunctionStmt = result[0] as CreateFunctionStmt;
        expect(createFunctionStmt.body).toBeInstanceOf(Binary);

        const body = createFunctionStmt.body as Binary;
        expect(body.operator).toBe(BinaryOperator.BITWISE_OR);

        expect(body.left).toBeInstanceOf(Binary);
        const left = body.left as Binary;
        expect(left.operator).toBe(BinaryOperator.BITWISE_AND);
        expect(left.left).toBeInstanceOf(Variable);
        expect((left.left as Variable).name).toBe("x");
        expect(left.right).toBeInstanceOf(Variable);
        expect((left.right as Variable).name).toBe("y");

        expect(body.right).toBeInstanceOf(Variable);
        expect((body.right as Variable).name).toBe("z");
    });
});
