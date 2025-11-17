import { Lexer, TokenType } from '../src/parser/lexer';
import { Parser } from '../src/parser/parser';
import { Interpreter } from '../src/processor/interpreter';
import { DataContext } from '../src/processor/operators';
import { QueryStmt, AggregateStmt } from '../src/parser/ast';

describe('AGGREGATE operator', () => {
    describe('Lexer', () => {
        it('should tokenize a query with AGGREGATE and GROUP BY', () => {
            const query = 'FROM sales |> AGGREGATE SUM(amount) AS total_sales GROUP BY product';
            const lexer = new Lexer(query);
            const tokens = lexer.scanTokens();
            const tokenTypes = tokens.map(t => t.type);
            expect(tokenTypes).toEqual([
                TokenType.FROM,
                TokenType.IDENTIFIER,
                TokenType.PIPE_GREATER,
                TokenType.AGGREGATE,
                TokenType.IDENTIFIER,
                TokenType.LEFT_PAREN,
                TokenType.IDENTIFIER,
                TokenType.RIGHT_PAREN,
                TokenType.AS,
                TokenType.IDENTIFIER,
                TokenType.GROUP,
                TokenType.BY,
                TokenType.IDENTIFIER,
                TokenType.EOF,
            ]);
        });
    });

    describe('Parser', () => {
        it('should parse a query with AGGREGATE and GROUP BY', () => {
            const query = 'FROM sales |> AGGREGATE SUM(amount) AS total_sales GROUP BY product';
            const lexer = new Lexer(query);
            const tokens = lexer.scanTokens();
            const parser = new Parser(tokens);
            const ast = parser.parse() as QueryStmt;
            const aggregateStmt = ast.statements[1] as AggregateStmt;

            expect(aggregateStmt).toBeInstanceOf(AggregateStmt);
            expect(aggregateStmt.columns.length).toBe(1);
            expect(aggregateStmt.groupBy.length).toBe(1);
        });
    });

    describe('Interpreter', () => {
        it('should execute a query with AGGREGATE and GROUP BY', async () => {
            const query = 'FROM sales |> AGGREGATE SUM(amount) AS total_sales GROUP BY product';
            const dataContext: DataContext = {
                sales: [
                    { product: 'apple', amount: 10 },
                    { product: 'banana', amount: 15 },
                    { product: 'apple', amount: 20 },
                ],
            };
            const lexer = new Lexer(query);
            const tokens = lexer.scanTokens();
            const parser = new Parser(tokens);
            const ast = parser.parse() as QueryStmt;

            const interpreter = new Interpreter();
            const result = interpreter.interpret(ast, dataContext);

            expect(result).toEqual([
                { product: 'apple', total_sales: 30 },
                { product: 'banana', total_sales: 15 },
            ]);
        });
    });
});
