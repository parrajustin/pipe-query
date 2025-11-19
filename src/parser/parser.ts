import { Token, TokenType } from './lexer';
import { QueryParseError } from '../index';
import {
  Expr,
  Stmt,
  Binary,
  Grouping,
  Literal,
  Logical,
  Unary,
  Variable,
  FromStmt,
  QueryStmt,
  ExpressionStmt,
  SelectStmt,
  WhereStmt,
  SelectColumn,
  AggregateStmt,
  AggregateColumn,
  Call,
  ExtendStmt,
  RenameStmt,
  OrderByStmt,
  LimitStmt,
  DistinctStmt,
  JoinStmt,
  UnionStmt,
  ExceptStmt,
  Get,
  AsStmt,
  CallStmt,
  SetStmt,
  CreateFunctionStmt,
  CaseExpr,
  FunctionParam,
} from './ast';

class ParseError extends Error {}

export class Parser {
  private readonly tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private isDataType(token: Token): boolean {
    return [
        TokenType.ARRAY, TokenType.BOOL, TokenType.BOOLEAN, TokenType.BYTES,
        TokenType.DATE, TokenType.DATETIME, TokenType.TIME, TokenType.TIMESTAMP,
        TokenType.STRUCT, TokenType.STRING, TokenType.JSON, TokenType.INT,
        TokenType.INT64, TokenType.SMALLINT, TokenType.INTEGER, TokenType.BIGINT,
        TokenType.TINYINT, TokenType.BYTEINT, TokenType.NUMERIC, TokenType.DECIMAL,
        TokenType.BIGNUMERIC, TokenType.BIGDECIMAL, TokenType.FLOAT64
    ].includes(token.type);
  }

  parse(): QueryStmt | null {
    try {
      const statements: Stmt[] = [];
      while (!this.isAtEnd()) {
        statements.push(this.statement());
      }
      return new QueryStmt(statements);
    } catch (error) {
      return null;
    }
  }

  private statement(): Stmt {
    if (this.match(TokenType.CREATE)) return this.createFunctionStatement();
    if (this.match(TokenType.FROM)) return this.fromStatement();
    if (this.match(TokenType.PIPE_GREATER)) return this.pipeStatement();
    return this.expressionStatement();
  }

  private fromStatement(): Stmt {
    const table = this.consume(TokenType.IDENTIFIER, 'Expect table name.');
    return new FromStmt(table);
  }

  private createFunctionStatement(): Stmt {
    this.consume(TokenType.TEMP, "Expect 'TEMP' after 'CREATE'.");
    const isTable = this.match(TokenType.TABLE);
    this.consume(TokenType.FUNCTION, "Expect 'FUNCTION' after 'TEMP'.");
    const name = this.consume(TokenType.IDENTIFIER, 'Expect function name.');

    this.consume(TokenType.LEFT_PAREN, "Expect '(' after function name.");
    const params: FunctionParam[] = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
        do {
            const paramName = this.consume(TokenType.IDENTIFIER, 'Expect parameter name.');
            if (!this.isDataType(this.peek())) {
              throw this.error(this.peek(), 'Expect parameter type.');
            }
            const paramType = this.advance();
            params.push({ name: paramName, type: paramType });
        } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.");

    let returnType: Token | null = null;
    if (this.match(TokenType.RETURNS)) {
        if (!this.isDataType(this.peek())) {
            throw this.error(this.peek(), "Expect return type.");
        }
        returnType = this.advance();
    }

    this.consume(TokenType.AS, "Expect 'AS' before function body.");
    
    this.consume(TokenType.LEFT_PAREN, "Expect '(' before function body.");
    const body = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after function body.");
    
    this.consume(TokenType.SEMICOLON, "Expect ';' after function definition.");

    return new CreateFunctionStmt(name, params, returnType, body, isTable);
  }


  private pipeStatement(): Stmt {
    const operatorToken = this.peek();

    switch(operatorToken.type) {
        case TokenType.SELECT:
            this.advance();
            return this.selectStatement();
        case TokenType.WHERE:
            this.advance();
            return this.whereStatement();
        case TokenType.AGGREGATE:
            this.advance();
            return this.aggregateStatement();
        case TokenType.EXTEND:
            this.advance();
            return this.extendStatement();
        case TokenType.RENAME:
            this.advance();
            return this.renameStatement();
        case TokenType.ORDER:
            this.advance();
            return this.orderByStatement();
        case TokenType.LIMIT:
            this.advance();
            return this.limitStatement();
        case TokenType.DISTINCT:
            this.advance();
            return this.distinctStatement();
        case TokenType.JOIN:
            this.advance();
            return this.joinStatement();
        case TokenType.UNION:
            this.advance();
            return this.unionStatement();
        case TokenType.EXCEPT:
            this.advance();
            return this.exceptStatement();
        case TokenType.SET:
            this.advance();
            return this.setStatement();
        case TokenType.AS:
            this.advance();
            return this.asStatement();
        case TokenType.CALL:
            this.advance();
            return this.callStatement();
        default:
            throw this.error(this.peek(), 'Unsupported pipe operator.');
    }
  }

  private selectStatement(): Stmt {
    const columns: SelectColumn[] = [];

    do {
      const expression = this.expression();
      let alias = null;
      if (this.match(TokenType.AS)) {
        alias = this.consume(TokenType.IDENTIFIER, "Expect alias after 'AS'.");
      }
      columns.push({ expression, alias });
    } while (this.match(TokenType.COMMA));

    return new SelectStmt(columns);
  }

  private whereStatement(): Stmt {
    const condition = this.expression();
    return new WhereStmt(condition);
  }

  private aggregateStatement(): Stmt {
    const columns: AggregateColumn[] = [];
    do {
      const expression = this.call();
      if (!(expression instanceof Call)) {
        throw this.error(this.peek(), 'Expect aggregate function call.');
      }

      this.consume(TokenType.AS, "Expect 'AS' after aggregate function.");
      const alias = this.consume(
        TokenType.IDENTIFIER,
        'Expect alias after as.'
      );
      columns.push({ expression, alias });
    } while (this.match(TokenType.COMMA));

    const groupBy: Variable[] = [];
    if(this.match(TokenType.GROUP, TokenType.BY)) {
        this.consume(TokenType.BY, "Expect 'BY' after 'GROUP'.");
        do {
          const expression = this.expression();
          if (!(expression instanceof Variable)) {
            throw this.error(this.peek(), 'Expect identifier in GROUP BY.');
          }
          groupBy.push(expression);
        } while (this.match(TokenType.COMMA));
    }

    return new AggregateStmt(columns, groupBy);
  }

  private extendStatement(): Stmt {
    const columns: SelectColumn[] = [];

    do {
      const expression = this.expression();
      let alias = null;
      if (this.match(TokenType.AS)) {
        alias = this.consume(TokenType.IDENTIFIER, "Expect alias after 'AS'.");
      }
      columns.push({ expression, alias });
    } while (this.match(TokenType.COMMA));

    return new ExtendStmt(columns);
  }

  private renameStatement(): Stmt {
    const renames: { from: Token; to: Token }[] = [];

    do {
      const from = this.consume(TokenType.IDENTIFIER, 'Expect column name to rename.');
      this.consume(TokenType.AS, "Expect 'AS' after column name.");
      const to = this.consume(TokenType.IDENTIFIER, 'Expect new column name.');
      renames.push({ from, to });
    } while (this.match(TokenType.COMMA));

    return new RenameStmt(renames);
  }

  private orderByStatement(): Stmt {
    const columns: { expression: Expr; direction: Token | null }[] = [];
    this.consume(TokenType.BY, "Expect 'BY' after 'ORDER'.");
    do {
      const expression = this.expression();
      let direction = null;
      if (this.match(TokenType.ASC, TokenType.DESC)) {
        direction = this.previous();
      }
      columns.push({ expression, direction });
    } while (this.match(TokenType.COMMA));

    return new OrderByStmt(columns);
  }

  private limitStatement(): Stmt {
    const count = this.expression();
    let offset = null;
    if (this.match(TokenType.OFFSET)) {
      offset = this.expression();
    }
    return new LimitStmt(count, offset);
  }

  private distinctStatement(): Stmt {
    return new DistinctStmt();
  }

  private joinStatement(): Stmt {
    const table = this.consume(TokenType.IDENTIFIER, 'Expect table name.');
    this.consume(TokenType.ON, "Expect 'ON' after table name.");
    const on = this.equality();
    return new JoinStmt(table, on);
  }

  private unionStatement(): Stmt {
    const table = this.consume(TokenType.IDENTIFIER, 'Expect table name.');
    return new UnionStmt(table);
  }

  private exceptStatement(): Stmt {
    const table = this.consume(TokenType.IDENTIFIER, 'Expect table name.');
    return new ExceptStmt(table);
  }

  private setStatement(): Stmt {
    const name = this.consume(TokenType.IDENTIFIER, 'Expect variable name.');
    return new SetStmt(name);
  }

  private asStatement(): Stmt {
    const name = this.consume(TokenType.IDENTIFIER, 'Expect alias name.');
    return new AsStmt(name);
  }

  private callStatement(): Stmt {
    const name = this.consume(TokenType.IDENTIFIER, 'Expect function name.');
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after function name.");
    const args: Expr[] = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");
    return new CallStmt(name, args);
  }

  private expressionStatement(): Stmt {
    const expr = this.expression();
    return new ExpressionStmt(expr);
  }

  private expression(): Expr {
    return this.logicalOr();
  }

  private logicalOr(): Expr {
    let expr = this.logicalAnd();

    while (this.match(TokenType.OR)) {
      const operator = this.previous();
      const right = this.logicalAnd();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }

  private logicalAnd(): Expr {
    let expr = this.equality();

    while (this.match(TokenType.AND)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new Logical(expr, operator, right);
    }

    return expr;
  }


  private equality(): Expr {
    let expr = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expr {
    let expr = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      const operator = this.previous();
      const right = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private term(): Expr {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expr {
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }

    return this.call();
  }

  private call(): Expr {
    let expr = this.primary();

    while (true) {
      if (this.check(TokenType.LEFT_PAREN)) {
        this.advance(); // consume '('
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.DOT)) {
        const name = this.consume(
          TokenType.IDENTIFIER,
          "Expect property name after '.'."
        );
        expr = new Get(expr, name);
      } else {
        break;
      }
    }

    return expr;
  }

  private finishCall(callee: Expr): Expr {
    let args: Expr[] = [];
    if (callee instanceof Variable && (callee.name.lexeme.toLowerCase() === 'cast' || callee.name.lexeme.toLowerCase() === 'safe_cast')) {
        const expression = this.expression();
        this.consume(TokenType.AS, "Expect 'AS' in cast expression.");
        const type = this.expression(); // for now, we parse type as an expression
        args.push(expression, type);
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after cast.");
        return new Call(callee, this.previous(), args);
    }


    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        if (args.length >= 255) {
          this.error(this.peek(), "Can't have more than 255 arguments.");
        }
        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }

    const paren = this.consume(
      TokenType.RIGHT_PAREN,
      "Expect ')' after arguments."
    );

    return new Call(callee, paren, args);
  }

  private caseExpression(): Expr {
    const cases: { condition: Expr; result: Expr }[] = [];
    let elseBranch: Expr | null = null;

    while (this.match(TokenType.WHEN)) {
      const condition = this.expression();
      this.consume(TokenType.THEN, "Expect 'THEN' after WHEN condition.");
      const result = this.expression();
      cases.push({ condition, result });
    }

    if (this.match(TokenType.ELSE)) {
      elseBranch = this.expression();
    }

    this.consume(TokenType.END, "Expect 'END' after CASE statement.");
    return new CaseExpr(cases, elseBranch);
  }

  private primary(): Expr {
    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NULL)) return new Literal(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING_LITERAL)) {
      return new Literal(this.previous().literal);
    }

    if (this.isDataType(this.peek())) {
      return new Variable(this.advance());
    }

    if(this.match(TokenType.IDENTIFIER, TokenType.SAFE_CAST, TokenType.IF, TokenType.CASE, TokenType.OVER)) {
        return new Variable(this.previous());
    }

    if (this.match(TokenType.CASE)) return this.caseExpression();

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Grouping(expr);
    }

    throw this.error(this.peek(), 'Expect expression.');
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek(), message);
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private error(token: Token, message: string): QueryParseError {
    return new QueryParseError(`[line ${token.line}] Error at '${token.lexeme}': ${message}`);
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.FROM:
        case TokenType.PIPE_GREATER:
        case TokenType.SELECT:
        case TokenType.WHERE:
        case TokenType.ORDER:
        case TokenType.GROUP:
        case TokenType.LIMIT:
          return;
      }

      this.advance();
    }
  }
}
