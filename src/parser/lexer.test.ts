import { Lexer, Token, TokenType } from './lexer';

describe('Lexer', () => {
  // Helper function to get all tokens and simplify them for easier comparison
  const getSimplifiedTokens = (query: string) => {
    const lexer = new Lexer(query);
    const tokens = lexer.scanTokens();
    // We remove line/col numbers to make tests less brittle
    return tokens.map(t => ({ type: t.type, lexeme: t.lexeme, literal: t.literal }));
  };

  it('should tokenize a simple query', () => {
    const query = 'FROM users |> SELECT name';
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
      { type: TokenType.FROM, lexeme: 'FROM', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'users', literal: null },
      { type: TokenType.PIPE_GREATER, lexeme: '|>', literal: null },
      { type: TokenType.SELECT, lexeme: 'SELECT', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'name', literal: null },
      { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should handle various keywords', () => {
    const query = 'CREATE TEMP FUNCTION my_func() AS (SELECT * FROM table)';
    const tokens = getSimplifiedTokens(query);
    const tokenTypes = tokens.map(t => t.type);
    expect(tokenTypes).toContain(TokenType.CREATE);
    expect(tokenTypes).toContain(TokenType.TEMP);
    expect(tokenTypes).toContain(TokenType.FUNCTION);
    expect(tokenTypes).toContain(TokenType.AS);
    expect(tokenTypes).toContain(TokenType.SELECT);
    expect(tokenTypes).toContain(TokenType.FROM);
    expect(tokenTypes).toContain(TokenType.TABLE);
  });

  it('should handle quoted identifiers', () => {
    const query = 'FROM `my-table` |> SELECT `column with spaces`';
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
      { type: TokenType.FROM, lexeme: 'FROM', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: '`my-table`', literal: 'my-table' },
      { type: TokenType.PIPE_GREATER, lexeme: '|>', literal: null },
      { type: TokenType.SELECT, lexeme: 'SELECT', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: '`column with spaces`', literal: 'column with spaces' },
      { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should handle different literal types', () => {
    const query = `SELECT 'hello', "world", 123, 45.67, TRUE, FALSE, NULL`;
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
        { type: TokenType.SELECT, lexeme: 'SELECT', literal: null },
        { type: TokenType.STRING, lexeme: "'hello'", literal: 'hello' },
        { type: TokenType.COMMA, lexeme: ',', literal: null },
        { type: TokenType.STRING, lexeme: '"world"', literal: 'world' },
        { type: TokenType.COMMA, lexeme: ',', literal: null },
        { type: TokenType.NUMBER, lexeme: '123', literal: 123 },
        { type: TokenType.COMMA, lexeme: ',', literal: null },
        { type: TokenType.NUMBER, lexeme: '45.67', literal: 45.67 },
        { type: TokenType.COMMA, lexeme: ',', literal: null },
        { type: TokenType.TRUE, lexeme: 'TRUE', literal: null },
        { type: TokenType.COMMA, lexeme: ',', literal: null },
        { type: TokenType.FALSE, lexeme: 'FALSE', literal: null },
        { type: TokenType.COMMA, lexeme: ',', literal: null },
        { type: TokenType.NULL, lexeme: 'NULL', literal: null },
        { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should tokenize operators', () => {
    const query = 'age > 25 AND clicks != 0';
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
        { type: TokenType.IDENTIFIER, lexeme: 'age', literal: null },
        { type: TokenType.GREATER, lexeme: '>', literal: null },
        { type: TokenType.NUMBER, lexeme: '25', literal: 25 },
        { type: TokenType.AND, lexeme: 'AND', literal: null },
        { type: TokenType.IDENTIFIER, lexeme: 'clicks', literal: null },
        { type: TokenType.BANG_EQUAL, lexeme: '!=', literal: null },
        { type: TokenType.NUMBER, lexeme: '0', literal: 0 },
        { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should handle single-line comments', () => {
    const query = `
      -- This is a comment
      FROM users # Another comment
      |> SELECT name
    `;
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
        { type: TokenType.FROM, lexeme: 'FROM', literal: null },
        { type: TokenType.IDENTIFIER, lexeme: 'users', literal: null },
        { type: TokenType.PIPE_GREATER, lexeme: '|>', literal: null },
        { type: TokenType.SELECT, lexeme: 'SELECT', literal: null },
        { type: TokenType.IDENTIFIER, lexeme: 'name', literal: null },
        { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should handle multi-line comments', () => {
    const query = `
      /* This is a
         multi-line comment */
      FROM users
    `;
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
        { type: TokenType.FROM, lexeme: 'FROM', literal: null },
        { type: TokenType.IDENTIFIER, lexeme: 'users', literal: null },
        { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should handle parentheses, commas, and dots', () => {
    const query = 'SELECT user.name, user.age FROM users(1, 2)';
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
        { type: TokenType.SELECT, lexeme: 'SELECT', literal: null },
        { type: TokenType.IDENTIFIER, lexeme: 'user', literal: null },
        { type: TokenType.DOT, lexeme: '.', literal: null },
        { type: TokenType.IDENTIFIER, lexeme: 'name', literal: null },
        { type: TokenType.COMMA, lexeme: ',', literal: null },
        { type: TokenType.IDENTIFIER, lexeme: 'user', literal: null },
        { type: TokenType.DOT, lexeme: '.', literal: null },
        { type: TokenType.IDENTIFIER, lexeme: 'age', literal: null },
        { type: TokenType.FROM, lexeme: 'FROM', literal: null },
        { type: TokenType.IDENTIFIER, lexeme: 'users', literal: null },
        { type: TokenType.LEFT_PAREN, lexeme: '(', literal: null },
        { type: TokenType.NUMBER, lexeme: '1', literal: 1 },
        { type: TokenType.COMMA, lexeme: ',', literal: null },
        { type: TokenType.NUMBER, lexeme: '2', literal: 2 },
        { type: TokenType.RIGHT_PAREN, lexeme: ')', literal: null },
        { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should handle a complex query with multiple features', () => {
    const query = `
        -- Get senior users from the 'users' table
        FROM \`user-data\`
        |> WHERE age >= 60 AND city = 'New York'
        |> SELECT name, age
        |> ORDER BY age DESC;
    `;
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
        { type: TokenType.FROM, lexeme: 'FROM', literal: null },
        { type: TokenType.IDENTIFIER, lexeme: '`user-data`', literal: 'user-data' },
        { type: TokenType.PIPE_GREATER, lexeme: '|>', literal: null },
        { type: TokenType.WHERE, lexeme: 'WHERE', literal: null },
        { type: TokenType.IDENTIFIER, lexeme: 'age', literal: null },
        { type: TokenType.GREATER_EQUAL, lexeme: '>=', literal: null },
        { type: TokenType.NUMBER, lexeme: '60', literal: 60 },
        { type: TokenType.AND, lexeme: 'AND', literal: null },
        { type: TokenType.IDENTIFIER, lexeme: 'city', literal: null },
        { type: TokenType.EQUAL, lexeme: '=', literal: null },
        { type: TokenType.STRING, lexeme: "'New York'", literal: 'New York' },
        { type: TokenType.PIPE_GREATER, lexeme: '|>', literal: null },
        { type: TokenType.SELECT, lexeme: 'SELECT', literal: null },
        { type: TokenType.IDENTIFIER, lexeme: 'name', literal: null },
        { type: TokenType.COMMA, lexeme: ',', literal: null },
        { type: TokenType.IDENTIFIER, lexeme: 'age', literal: null },
        { type: TokenType.PIPE_GREATER, lexeme: '|>', literal: null },
        { type: TokenType.ORDER, lexeme: 'ORDER', literal: null },
        { type: TokenType.BY, lexeme: 'BY', literal: null },
        { type: TokenType.IDENTIFIER, lexeme: 'age', literal: null },
        { type: TokenType.DESC, lexeme: 'DESC', literal: null },
        { type: TokenType.SEMICOLON, lexeme: ';', literal: null },
        { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should handle array and struct literals', () => {
    const query = "SELECT [1, 'a'], STRUCT(1, 'a') AS my_struct";
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
      { type: TokenType.SELECT, lexeme: 'SELECT', literal: null },
      { type: TokenType.LEFT_BRACKET, lexeme: '[', literal: null },
      { type: TokenType.NUMBER, lexeme: '1', literal: 1 },
      { type: TokenType.COMMA, lexeme: ',', literal: null },
      { type: TokenType.STRING, lexeme: "'a'", literal: 'a' },
      { type: TokenType.RIGHT_BRACKET, lexeme: ']', literal: null },
      { type: TokenType.COMMA, lexeme: ',', literal: null },
      { type: TokenType.STRUCT, lexeme: 'STRUCT', literal: null },
      { type: TokenType.LEFT_PAREN, lexeme: '(', literal: null },
      { type: TokenType.NUMBER, lexeme: '1', literal: 1 },
      { type: TokenType.COMMA, lexeme: ',', literal: null },
      { type: TokenType.STRING, lexeme: "'a'", literal: 'a' },
      { type: TokenType.RIGHT_PAREN, lexeme: ')', literal: null },
      { type: TokenType.AS, lexeme: 'AS', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'my_struct', literal: null },
      { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should tokenize all operators', () => {
    const query = '= == != <> > >= < <= AND OR NOT IN LIKE BETWEEN IS NULL IS TRUE IS FALSE || & | ^ ~ << >>';
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
      { type: TokenType.EQUAL, lexeme: '=', literal: null },
      { type: TokenType.EQUAL_EQUAL, lexeme: '==', literal: null },
      { type: TokenType.BANG_EQUAL, lexeme: '!=', literal: null },
      { type: TokenType.LESS_GREATER, lexeme: '<>', literal: null },
      { type: TokenType.GREATER, lexeme: '>', literal: null },
      { type: TokenType.GREATER_EQUAL, lexeme: '>=', literal: null },
      { type: TokenType.LESS, lexeme: '<', literal: null },
      { type: TokenType.LESS_EQUAL, lexeme: '<=', literal: null },
      { type: TokenType.AND, lexeme: 'AND', literal: null },
      { type: TokenType.OR, lexeme: 'OR', literal: null },
      { type: TokenType.NOT, lexeme: 'NOT', literal: null },
      { type: TokenType.IN, lexeme: 'IN', literal: null },
      { type: TokenType.LIKE, lexeme: 'LIKE', literal: null },
      { type: TokenType.BETWEEN, lexeme: 'BETWEEN', literal: null },
      { type: TokenType.IS, lexeme: 'IS', literal: null },
      { type: TokenType.NULL, lexeme: 'NULL', literal: null },
      { type: TokenType.IS, lexeme: 'IS', literal: null },
      { type: TokenType.TRUE, lexeme: 'TRUE', literal: null },
      { type: TokenType.IS, lexeme: 'IS', literal: null },
      { type: TokenType.FALSE, lexeme: 'FALSE', literal: null },
      { type: TokenType.PIPE_PIPE, lexeme: '||', literal: null },
      { type: TokenType.AMPERSAND, lexeme: '&', literal: null },
      { type: TokenType.PIPE, lexeme: '|', literal: null },
      { type: TokenType.CARET, lexeme: '^', literal: null },
      { type: TokenType.TILDE, lexeme: '~', literal: null },
      { type: TokenType.SHIFT_LEFT, lexeme: '<<', literal: null },
      { type: TokenType.SHIFT_RIGHT, lexeme: '>>', literal: null },
      { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should handle date and time literals', () => {
    const query = "SELECT DATE '2023-12-25', DATETIME '2023-12-25 10:30:00', TIMESTAMP '2023-12-25 10:30:00Z'";
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
      { type: TokenType.SELECT, lexeme: 'SELECT', literal: null },
      { type: TokenType.DATE, lexeme: 'DATE', literal: null },
      { type: TokenType.STRING, lexeme: "'2023-12-25'", literal: '2023-12-25' },
      { type: TokenType.COMMA, lexeme: ',', literal: null },
      { type: TokenType.DATETIME, lexeme: 'DATETIME', literal: null },
      { type: TokenType.STRING, lexeme: "'2023-12-25 10:30:00'", literal: '2023-12-25 10:30:00' },
      { type: TokenType.COMMA, lexeme: ',', literal: null },
      { type: TokenType.TIMESTAMP, lexeme: 'TIMESTAMP', literal: null },
      { type: TokenType.STRING, lexeme: "'2023-12-25 10:30:00Z'", literal: '2023-12-25 10:30:00Z' },
      { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should handle JOIN operators', () => {
    const query = 'FROM users |> INNER JOIN orders ON users.id == orders.userId |> LEFT JOIN products ON products.id == orders.productId';
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
      { type: TokenType.FROM, lexeme: 'FROM', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'users', literal: null },
      { type: TokenType.PIPE_GREATER, lexeme: '|>', literal: null },
      { type: TokenType.INNER, lexeme: 'INNER', literal: null },
      { type: TokenType.JOIN, lexeme: 'JOIN', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'orders', literal: null },
      { type: TokenType.ON, lexeme: 'ON', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'users', literal: null },
      { type: TokenType.DOT, lexeme: '.', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'id', literal: null },
      { type: TokenType.EQUAL_EQUAL, lexeme: '==', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'orders', literal: null },
      { type: TokenType.DOT, lexeme: '.', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'userId', literal: null },
      { type: TokenType.PIPE_GREATER, lexeme: '|>', literal: null },
      { type: TokenType.LEFT, lexeme: 'LEFT', literal: null },
      { type: TokenType.JOIN, lexeme: 'JOIN', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'products', literal: null },
      { type: TokenType.ON, lexeme: 'ON', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'products', literal: null },
      { type: TokenType.DOT, lexeme: '.', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'id', literal: null },
      { type: TokenType.EQUAL_EQUAL, lexeme: '==', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'orders', literal: null },
      { type: TokenType.DOT, lexeme: '.', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'productId', literal: null },
      { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should handle all JOIN types', () => {
    const query = 'LEFT JOIN RIGHT JOIN FULL OUTER JOIN INNER JOIN';
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
      { type: TokenType.LEFT, lexeme: 'LEFT', literal: null },
      { type: TokenType.JOIN, lexeme: 'JOIN', literal: null },
      { type: TokenType.RIGHT, lexeme: 'RIGHT', literal: null },
      { type: TokenType.JOIN, lexeme: 'JOIN', literal: null },
      { type: TokenType.FULL, lexeme: 'FULL', literal: null },
      { type: TokenType.OUTER, lexeme: 'OUTER', literal: null },
      { type: TokenType.JOIN, lexeme: 'JOIN', literal: null },
      { type: TokenType.INNER, lexeme: 'INNER', literal: null },
      { type: TokenType.JOIN, lexeme: 'JOIN', literal: null },
      { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should handle IS NULL and IS TRUE/FALSE', () => {
    const query = 'WHERE name IS NOT NULL AND active IS TRUE AND deleted IS FALSE';
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
      { type: TokenType.WHERE, lexeme: 'WHERE', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'name', literal: null },
      { type: TokenType.IS, lexeme: 'IS', literal: null },
      { type: TokenType.NOT, lexeme: 'NOT', literal: null },
      { type: TokenType.NULL, lexeme: 'NULL', literal: null },
      { type: TokenType.AND, lexeme: 'AND', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'active', literal: null },
      { type: TokenType.IS, lexeme: 'IS', literal: null },
      { type: TokenType.TRUE, lexeme: 'TRUE', literal: null },
      { type: TokenType.AND, lexeme: 'AND', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'deleted', literal: null },
      { type: TokenType.IS, lexeme: 'IS', literal: null },
      { type: TokenType.FALSE, lexeme: 'FALSE', literal: null },
      { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should handle BETWEEN and LIKE', () => {
    const query = "WHERE age BETWEEN 18 AND 65 AND name LIKE 'J%'";
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
      { type: TokenType.WHERE, lexeme: 'WHERE', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'age', literal: null },
      { type: TokenType.BETWEEN, lexeme: 'BETWEEN', literal: null },
      { type: TokenType.NUMBER, lexeme: '18', literal: 18 },
      { type: TokenType.AND, lexeme: 'AND', literal: null },
      { type: TokenType.NUMBER, lexeme: '65', literal: 65 },
      { type: TokenType.AND, lexeme: 'AND', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'name', literal: null },
      { type: TokenType.LIKE, lexeme: 'LIKE', literal: null },
      { type: TokenType.STRING, lexeme: "'J%'", literal: 'J%' },
      { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should handle ORDER BY with ASC and DESC', () => {
    const query = 'ORDER BY age DESC, name ASC';
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
      { type: TokenType.ORDER, lexeme: 'ORDER', literal: null },
      { type: TokenType.BY, lexeme: 'BY', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'age', literal: null },
      { type: TokenType.DESC, lexeme: 'DESC', literal: null },
      { type: TokenType.COMMA, lexeme: ',', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'name', literal: null },
      { type: TokenType.ASC, lexeme: 'ASC', literal: null },
      { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should handle numbers with exponents', () => {
    const query = '1e10 1.2e-5 .5E+2';
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
      { type: TokenType.NUMBER, lexeme: '1e10', literal: 1e10 },
      { type: TokenType.NUMBER, lexeme: '1.2e-5', literal: 1.2e-5 },
      { type: TokenType.NUMBER, lexeme: '.5E+2', literal: 50 },
      { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should handle strings with escaped quotes', () => {
    const query = `'a\\'b' "c\\"d"`;
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
      { type: TokenType.STRING, lexeme: `'a\\'b'`, literal: "a'b" },
      { type: TokenType.STRING, lexeme: `"c\\"d"`, literal: 'c"d' },
      { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  it('should handle empty and whitespace-only input', () => {
    const tokensEmpty = getSimplifiedTokens('');
    expect(tokensEmpty.length).toBe(1);
    expect(tokensEmpty[0].type).toBe(TokenType.EOF);

    const tokensWhitespace = getSimplifiedTokens(' \t\r\n ');
    expect(tokensWhitespace.length).toBe(1);
    expect(tokensWhitespace[0].type).toBe(TokenType.EOF);
  });

  it('should be case-insensitive for keywords', () => {
    const query = 'sElEcT Name FrOm uSeRs';
    const tokens = getSimplifiedTokens(query);
    const expectedTokens = [
      { type: TokenType.SELECT, lexeme: 'sElEcT', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'Name', literal: null },
      { type: TokenType.FROM, lexeme: 'FrOm', literal: null },
      { type: TokenType.IDENTIFIER, lexeme: 'uSeRs', literal: null },
      { type: TokenType.EOF, lexeme: '', literal: null },
    ];
    expect(tokens).toEqual(expectedTokens);
  });

  describe('Error Handling', () => {
    it('should throw an error for an unterminated string', () => {
      const query = "'hello";
      expect(() => getSimplifiedTokens(query)).toThrow('Unterminated string');
    });

    it('should throw an error for an unterminated quoted identifier', () => {
      const query = '`my-table';
      expect(() => getSimplifiedTokens(query)).toThrow('Unterminated quoted identifier');
    });

    it('should throw an error for an unexpected character', () => {
      const query = 'SELECT @';
      expect(() => getSimplifiedTokens(query)).toThrow('Unexpected character: @');
    });

    it('should throw an error for an unterminated block comment', () => {
      const query = '/* oops';
      expect(() => getSimplifiedTokens(query)).toThrow('Unterminated block comment');
    });

    it('should throw an error for an invalid number format', () => {
      const query = '1.2e';
      expect(() => getSimplifiedTokens(query)).toThrow('Invalid number format');
    });
  });
});
