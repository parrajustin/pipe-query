import { Parser } from './parser';
import { Lexer } from './lexer';
import * as ast from './ast';
import { TokenType, Token } from './lexer';
import * as fs from 'fs';
import * as path from 'path';

// Helper to get AST from a query string
const getAst = (query: string) => {
    const lexer = new Lexer(query);
    const tokens = lexer.scanTokens();
    const parser = new Parser(tokens);
    const queryStmt = parser.parse();
    return queryStmt ? queryStmt.statements : [];
};

describe('Parser', () => {
    it('should parse a simple FROM and SELECT query', () => {
        const query = 'FROM users |> SELECT id, name';
        const statements = getAst(query);

        expect(statements).toHaveLength(2);
        const fromStmt = statements[0] as ast.FromStmt;
        expect(fromStmt).toBeInstanceOf(ast.FromStmt);
        expect(fromStmt.table.lexeme).toBe('users');

        const selectStmt = statements[1] as ast.SelectStmt;
        expect(selectStmt).toBeInstanceOf(ast.SelectStmt);
        expect(selectStmt.columns).toHaveLength(2);
        expect((selectStmt.columns[0].expression as ast.Variable).name.lexeme).toBe('id');
        expect((selectStmt.columns[1].expression as ast.Variable).name.lexeme).toBe('name');
    });

    it('should parse a WHERE clause with logical operators', () => {
        const query = "FROM users |> WHERE age > 21 AND name == 'John'";
        const statements = getAst(query);

        expect(statements).toHaveLength(2);
        const whereStmt = statements[1] as ast.WhereStmt;
        expect(whereStmt).toBeInstanceOf(ast.WhereStmt);

        const logicalExpr = whereStmt.condition as ast.Logical;
        expect(logicalExpr).toBeInstanceOf(ast.Logical);
        expect(logicalExpr.operator.type).toBe(TokenType.AND);

        const left = logicalExpr.left as ast.Binary;
        expect(left.operator.type).toBe(TokenType.GREATER);
        expect((left.left as ast.Variable).name.lexeme).toBe('age');
        expect((left.right as ast.Literal).value).toBe(21);

        const right = logicalExpr.right as ast.Binary;
        expect(right.operator.type).toBe(TokenType.EQUAL_EQUAL);
        expect((right.left as ast.Variable).name.lexeme).toBe('name');
        expect((right.right as ast.Literal).value).toBe('John');
    });

    it('should parse an ORDER BY clause with ASC and DESC', () => {
        const query = 'FROM users |> ORDER BY age DESC, name ASC';
        const statements = getAst(query);
        const orderByStmt = statements[1] as ast.OrderByStmt;

        expect(orderByStmt).toBeInstanceOf(ast.OrderByStmt);
        expect(orderByStmt.columns).toHaveLength(2);
        expect((orderByStmt.columns[0].expression as ast.Variable).name.lexeme).toBe('age');
        expect(orderByStmt.columns[0].direction!.type).toBe(TokenType.DESC);
        expect((orderByStmt.columns[1].expression as ast.Variable).name.lexeme).toBe('name');
        expect(orderByStmt.columns[1].direction!.type).toBe(TokenType.ASC);
    });

    it('should parse a LIMIT clause with OFFSET', () => {
        const query = 'FROM users |> LIMIT 10 OFFSET 20';
        const statements = getAst(query);
        const limitStmt = statements[1] as ast.LimitStmt;

        expect(limitStmt).toBeInstanceOf(ast.LimitStmt);
        expect((limitStmt.count as ast.Literal).value).toBe(10);
        expect((limitStmt.offset as ast.Literal).value).toBe(20);
    });
    
    it('should parse a simple AGGREGATE ... GROUP BY', () => {
        const query = "FROM sales |> AGGREGATE SUM(amount) AS total_sales GROUP BY category";
        const statements = getAst(query);

        const aggregateStmt = statements[1] as ast.AggregateStmt;
        expect(aggregateStmt).toBeInstanceOf(ast.AggregateStmt);
        expect(aggregateStmt.columns).toHaveLength(1);
        expect(aggregateStmt.groupBy).toHaveLength(1);

        const aggCol = aggregateStmt.columns[0];
        expect((aggCol.expression.callee as ast.Variable).name.lexeme).toBe("SUM");
        expect(aggCol.alias.lexeme).toBe("total_sales");

        expect(aggregateStmt.groupBy[0].name.lexeme).toBe("category");
    });
    
    it('should parse a JOIN clause', () => {
        const query = 'FROM users |> JOIN orders ON users.id == orders.userId';
        const statements = getAst(query);
        const joinStmt = statements[1] as ast.JoinStmt;
        expect(joinStmt).toBeInstanceOf(ast.JoinStmt);
        expect(joinStmt.table.lexeme).toBe('orders');
        expect(joinStmt.on).toBeInstanceOf(ast.Binary);
    });

    it('should throw an error for double-quoted string literals', () => {
        const query = 'FROM users |> WHERE name == "John"';
        const lexer = new Lexer(query);
        expect(() => lexer.scanTokens()).toThrow('Unexpected character: "');
    });

    it('should parse a string literal containing double quotes', () => {
        const query = "FROM users |> WHERE name == 'John \"The Rock\" Doe'";
        const statements = getAst(query);
        const whereStmt = statements[1] as ast.WhereStmt;
        const binaryExpr = whereStmt.condition as ast.Binary;
        const literal = binaryExpr.right as ast.Literal;
        expect(literal.value).toBe('John "The Rock" Doe');
    });

    it('should parse a string literal with an escaped single quote', () => {
        const query = "FROM users |> WHERE name == 'John O\\'Brian'";
        const statements = getAst(query);
        const whereStmt = statements[1] as ast.WhereStmt;
        const binaryExpr = whereStmt.condition as ast.Binary;
        const literal = binaryExpr.right as ast.Literal;
        expect(literal.value).toBe("John O'Brian");
    });

    it('should parse a UDF', () => {
        const query = `
-- Define a temporary UDF to parse a JSON string and extract the HTTP code.
CREATE TEMP FUNCTION ParseHttpCode(json_payload STRING) RETURNS INT64 AS (
  SAFE_CAST(JSON_VALUE(json_payload, '$.http_response_code') AS INT64)
);`;
        const statements = getAst(query);

        expect(statements).toHaveLength(1);
        const createFuncStmt = statements[0] as ast.CreateFunctionStmt;

        expect(createFuncStmt).toBeInstanceOf(ast.CreateFunctionStmt);
        expect(createFuncStmt.name.lexeme).toBe('ParseHttpCode');
        expect(createFuncStmt.table).toBe(false);

        // Check parameters
        expect(createFuncStmt.params).toHaveLength(1);
        const param = createFuncStmt.params[0];
        expect(param.name.lexeme).toBe('json_payload');
        expect(param.type.lexeme).toBe('STRING');
        expect(param.type.type).toBe(TokenType.STRING);

        // Check return type
        expect(createFuncStmt.returnType).not.toBeNull();
        expect(createFuncStmt.returnType!.lexeme).toBe('INT64');
        expect(createFuncStmt.returnType!.type).toBe(TokenType.INT64);

        // Check body
        const body = createFuncStmt.body as ast.Call;
        expect(body).toBeInstanceOf(ast.Call);
        expect((body.callee as ast.Variable).name.lexeme).toBe('SAFE_CAST');
    });

    /*
    it('should parse the complex script.sql correctly', () => {
        const filePath = path.join(__dirname, 'testdata', 'script.sql');
        const query = fs.readFileSync(filePath, 'utf-8');
        const statements = getAst(query);
        // This is more of a smoke test to ensure the parser doesn't crash on a complex script.
        // A more robust test would involve walking the AST and asserting its structure.
        expect(statements.length).toBeGreaterThan(1);
        
        // Quick check for some statement types
        expect(statements.some(s => s instanceof ast.FromStmt)).toBe(true);
        expect(statements.some(s => s instanceof ast.ExtendStmt)).toBe(true);
        expect(statements.some(s => s instanceof ast.CallStmt)).toBe(true);
        expect(statements.some(s => s instanceof ast.WhereStmt)).toBe(true);
        expect(statements.some(s => s instanceof ast.AggregateStmt)).toBe(true);
        expect(statements.some(s => s instanceof ast.OrderByStmt)).toBe(true);
        expect(statements.some(s => s instanceof ast.LimitStmt)).toBe(true);
    });
    */
});