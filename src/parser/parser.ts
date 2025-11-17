import { Token, TokenType } from './lexer';
import { QueryParseError } from '../index';
import {
  Expr,
  Stmt,
  Binary,
  Grouping,
  Literal,
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
} from './ast';

class ParseError extends Error {}

export class Parser {
  private readonly tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
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
    if (this.match(TokenType.FROM)) return this.fromStatement();
    if (this.match(TokenType.PIPE_GREATER)) return this.pipeStatement();
    return this.expressionStatement();
  }

  private fromStatement(): Stmt {
    const table = this.consume(TokenType.IDENTIFIER, 'Expect table name.');
    return new FromStmt(table);
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

  private expressionStatement(): Stmt {
    const expr = this.expression();
    return new ExpressionStmt(expr);
  }

  private expression(): Expr {
    return this.equality();
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
      if (this.match(TokenType.LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else {
        break;
      }
    }

    return expr;
  }

  private finishCall(callee: Expr): Expr {
    let args: Expr[] = [];
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

  private primary(): Expr {
    if (this.match(TokenType.FALSE)) return new Literal(false);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.NIL)) return new Literal(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);
    }

    if(this.match(TokenType.IDENTIFIER)) {
        return new Variable(this.previous());
    }

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
