export enum TokenType {
  // Single-character tokens
  LEFT_PAREN = 'LEFT_PAREN',
  RIGHT_PAREN = 'RIGHT_PAREN',
  LEFT_BRACE = 'LEFT_BRACE',
  RIGHT_BRACE = 'RIGHT_BRACE',
  LEFT_BRACKET = 'LEFT_BRACKET',
  RIGHT_BRACKET = 'RIGHT_BRACKET',
  COMMA = 'COMMA',
  DOT = 'DOT',
  MINUS = 'MINUS',
  PLUS = 'PLUS',
  SEMICOLON = 'SEMICOLON',
  SLASH = 'SLASH',
  STAR = 'STAR',

  // One or two character tokens
  BANG = 'BANG',
  BANG_EQUAL = 'BANG_EQUAL',
  EQUAL = 'EQUAL',
  EQUAL_EQUAL = 'EQUAL_EQUAL',
  GREATER = 'GREATER',
  GREATER_EQUAL = 'GREATER_EQUAL',
  LESS = 'LESS',
  LESS_EQUAL = 'LESS_EQUAL',
  PIPE = 'PIPE',
  PIPE_GREATER = 'PIPE_GREATER', // |>

  // Literals
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',

  // Keywords
  AS = 'AS',
  AGGREGATE = 'AGGREGATE',
  AND = 'AND',
  BY = 'BY',
  CALL = 'CALL',
  CREATE = 'CREATE',
  DISTINCT = 'DISTINCT',
  EXCEPT = 'EXCEPT',
  EXTEND = 'EXTEND',
  ELSE = 'ELSE',
  END = 'END',
  FALSE = 'FALSE',
  FROM = 'FROM',
  FUNCTION = 'FUNCTION',
  GROUP = 'GROUP',
  IF = 'IF',
  IN = 'IN',
  JOIN = 'JOIN',
  LIMIT = 'LIMIT',
  NIL = 'NIL',
  NOT = 'NOT',
  ON = 'ON',
  OR = 'OR',
  ORDER = 'ORDER',
  RENAME = 'RENAME',
  SELECT = 'SELECT',
  SET = 'SET',
  TABLE = 'TABLE',
  TEMP = 'TEMP',
  THEN = 'THEN',
  TRUE = 'TRUE',
  UNION = 'UNION',
  WHERE = 'WHERE',
  WITH = 'WITH',

  // Other
  COMMENT = 'COMMENT',
  EOF = 'EOF',
}

export interface Token {
  type: TokenType;
  lexeme: string;
  literal: any;
  line: number;
  col: number;
}

export class Lexer {
  private readonly source: string;
  private readonly tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 1;
  private col = 1;

  private static readonly keywords: { [key: string]: TokenType } = {
    as: TokenType.AS,
    aggregate: TokenType.AGGREGATE,
    and: TokenType.AND,
    by: TokenType.BY,
    call: TokenType.CALL,
    create: TokenType.CREATE,
    distinct: TokenType.DISTINCT,
    except: TokenType.EXCEPT,
    extend: TokenType.EXTEND,
    else: TokenType.ELSE,
    end: TokenType.END,
    false: TokenType.FALSE,
    from: TokenType.FROM,
    function: TokenType.FUNCTION,
    group: TokenType.GROUP,
    if: TokenType.IF,
    in: TokenType.IN,
    join: TokenType.JOIN,
    limit: TokenType.LIMIT,
    nil: TokenType.NIL,
    not: TokenType.NOT,
    on: TokenType.ON,
    or: TokenType.OR,
    order: TokenType.ORDER,
    rename: TokenType.RENAME,
    select: TokenType.SELECT,
    set: TokenType.SET,
    table: TokenType.TABLE,
    temp: TokenType.TEMP,
    then: TokenType.THEN,
    true: TokenType.TRUE,
    union: TokenType.UNION,
    where: TokenType.WHERE,
    with: TokenType.WITH,
  };

  constructor(source: string) {
    this.source = source;
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push({
      type: TokenType.EOF,
      lexeme: '',
      literal: null,
      line: this.line,
      col: this.col,
    });
    return this.tokens;
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private scanToken(): void {
    const c = this.advance();
    switch (c) {
      case '(': this.addToken(TokenType.LEFT_PAREN); break;
      case ')': this.addToken(TokenType.RIGHT_PAREN); break;
      case '{': this.addToken(TokenType.LEFT_BRACE); break;
      case '}': this.addToken(TokenType.RIGHT_BRACE); break;
      case '[': this.addToken(TokenType.LEFT_BRACKET); break;
      case ']': this.addToken(TokenType.RIGHT_BRACKET); break;
      case ',': this.addToken(TokenType.COMMA); break;
      case '.': this.addToken(TokenType.DOT); break;
      case '-':
        if (this.match('-')) {
          // A comment goes until the end of the line.
          while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
        } else {
          this.addToken(TokenType.MINUS);
        }
        break;
      case '+': this.addToken(TokenType.PLUS); break;
      case ';': this.addToken(TokenType.SEMICOLON); break;
      case '*': this.addToken(TokenType.STAR); break;
      case '!':
        this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case '=':
        this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
        break;
      case '<':
        this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case '>':
        this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);
        break;
      case '|':
        if (this.match('>')) {
          this.addToken(TokenType.PIPE_GREATER);
        } else {
          this.addToken(TokenType.PIPE);
        }
        break;
      case '/':
        if (this.match('/')) {
          // A comment goes until the end of the line.
          while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
        } else if (this.match('*')) {
          // A block comment goes until the closing */
          while (this.peek() !== '*' && this.peekNext() !== '/' && !this.isAtEnd()) {
            if (this.peek() === '\n') {
              this.line++;
              this.col = 0;
            }
            this.advance();
          }
          this.advance(); // consume the *
          this.advance(); // consume the /
        }
        else {
          this.addToken(TokenType.SLASH);
        }
        break;

      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace.
        break;

      case '\n':
        this.line++;
        this.col = 0;
        break;

      case '"':
      case "'":
        this.string(c);
        break;

      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          // TODO: Error handling
          console.error(`[line ${this.line}] Error: Unexpected character.`);
        }
        break;
    }
  }

  private advance(): string {
    this.current++;
    this.col++;
    return this.source.charAt(this.current - 1);
  }

  private addToken(type: TokenType, literal: any = null): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push({
      type,
      lexeme: text,
      literal,
      line: this.line,
      col: this.col,
    });
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== expected) return false;

    this.current++;
    this.col++;
    return true;
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source.charAt(this.current);
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source.charAt(this.current + 1);
  }

  private string(quote: string): void {
    while (this.peek() !== quote && !this.isAtEnd()) {
      if (this.peek() === '\n') {
        this.line++;
        this.col = 0;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      // TODO: Error handling
      console.error(`[line ${this.line}] Error: Unterminated string.`);
      return;
    }

    // The closing ".
    this.advance();

    // Trim the surrounding quotes.
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  private number(): void {
    while (this.isDigit(this.peek())) this.advance();

    // Look for a fractional part.
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance();

      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(
      TokenType.NUMBER,
      parseFloat(this.source.substring(this.start, this.current))
    );
  }

  private identifier(): void {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const text = this.source.substring(this.start, this.current);
    let type = Lexer.keywords[text.toLowerCase()];
    if (type === undefined) type = TokenType.IDENTIFIER;
    this.addToken(type);
  }

  private isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }
}
