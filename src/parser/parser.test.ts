import { Parser } from './parser';
import * as ast from './ast';

// Helper to get AST from a query string
const getAst = (query: string) => {
    const parser = new Parser(query);
    const queryStmt = parser.parse();
    return queryStmt ? queryStmt.statements : [];
};

describe('Parser', () => {
    it('should parse a simple FROM statement', () => {
        const query = 'FROM users';
        const statements = getAst(query);

        expect(statements).toHaveLength(1);
        const fromStmt = statements[0] as ast.FromStmt;
        expect(fromStmt).toBeInstanceOf(ast.FromStmt);
        expect(fromStmt.table.value).toBe('users');
    });

    it('should parse a simple FROM and SELECT query', () => {
        const query = 'FROM users |> SELECT id, name';
        const statements = getAst(query);

        expect(statements).toHaveLength(2);
        const fromStmt = statements[0] as ast.FromStmt;
        expect(fromStmt).toBeInstanceOf(ast.FromStmt);
        expect(fromStmt.table.value).toBe('users');

        const selectStmt = statements[1] as ast.SelectStmt;
        expect(selectStmt).toBeInstanceOf(ast.SelectStmt);
        expect(selectStmt.columns).toHaveLength(2);
        expect((selectStmt.columns[0].expression as ast.Variable).name.value).toBe('id');
        expect((selectStmt.columns[1].expression as ast.Variable).name.value).toBe('name');
    });
});
