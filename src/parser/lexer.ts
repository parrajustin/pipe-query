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
  AMPERSAND = 'AMPERSAND',
  CARET = 'CARET',
  TILDE = 'TILDE',

  // One or two character tokens
  BANG = 'BANG',
  BANG_EQUAL = 'BANG_EQUAL',
  EQUAL = 'EQUAL',
  EQUAL_EQUAL = 'EQUAL_EQUAL',
  GREATER = 'GREATER',
  GREATER_EQUAL = 'GREATER_EQUAL',
  LESS = 'LESS',
  LESS_EQUAL = 'LESS_EQUAL',
  LESS_GREATER = 'LESS_GREATER', // <>
  PIPE = 'PIPE',
  PIPE_GREATER = 'PIPE_GREATER', // |>
  PIPE_PIPE = 'PIPE_PIPE', // ||
  SHIFT_LEFT = 'SHIFT_LEFT', // <<
  SHIFT_RIGHT = 'SHIFT_RIGHT', // >>

  // Literals
  IDENTIFIER = 'IDENTIFIER',
  STRING_LITERAL = 'STRING_LITERAL',
  NUMBER = 'NUMBER',

  // Keywords
  AGGREGATE = 'AGGREGATE',
  ALL = 'ALL',
  AND = 'AND',
  AS = 'AS',
  ASC = 'ASC',
  BETWEEN = 'BETWEEN',
  BY = 'BY',
  CALL = 'CALL',
  CASE = 'CASE',
  CREATE = 'CREATE',
  DAY = 'DAY',
  DESC = 'DESC',
  DISTINCT = 'DISTINCT',
  ELSE = 'ELSE',
  END = 'END',
  EXCEPT = 'EXCEPT',
  EXTEND = 'EXTEND',
  FALSE = 'FALSE',
  FROM = 'FROM',
  FULL = 'FULL',
  FUNCTION = 'FUNCTION',
  GROUP = 'GROUP',
  IF = 'IF',
  IN = 'IN',
  INNER = 'INNER',
  INTERVAL = 'INTERVAL',
  IS = 'IS',
  JOIN = 'JOIN',
  LEFT = 'LEFT',
  LIKE = 'LIKE',
  LIMIT = 'LIMIT',
  NOT = 'NOT',
  NULL = 'NULL',
  ON = 'ON',
  OFFSET = 'OFFSET',
  OR = 'OR',
  ORDER = 'ORDER',
  OUTER = 'OUTER',
  OVER = 'OVER',
  PARTITION = 'PARTITION',
  RENAME = 'RENAME',
  RETURNS = 'RETURNS',
  RIGHT = 'RIGHT',
  SAFE_CAST = 'SAFE_CAST',
  SECOND = 'SECOND',
  SELECT = 'SELECT',
  SET = 'SET',
  TABLE = 'TABLE',
  TEMP = 'TEMP',
  THEN = 'THEN',
  TRUE = 'TRUE',
  UNION = 'UNION',
  WHEN = 'WHEN',
  WHERE = 'WHERE',
  WINDOW = 'WINDOW',
  WITH = 'WITH',
  YEAR = 'YEAR',

  // Data Types
  ARRAY = 'ARRAY',
  BOOL = 'BOOL',
  BOOLEAN = 'BOOLEAN',
  BYTES = 'BYTES',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  TIME = 'TIME',
  TIMESTAMP = 'TIMESTAMP',
  STRUCT = 'STRUCT',
  STRING = 'STRING',
  JSON = 'JSON',
  INT = 'INT',
  INT64 = 'INT64',
  SMALLINT = 'SMALLINT',
  INTEGER = 'INTEGER',
  BIGINT = 'BIGINT',
  TINYINT = 'TINYINT',
  BYTEINT = 'BYTEINT',
  NUMERIC = 'NUMERIC',
  DECIMAL = 'DECIMAL',
  BIGNUMERIC = 'BIGNUMERIC',
  BIGDECIMAL = 'BIGDECIMAL',
  FLOAT64 = 'FLOAT64',


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
    aggregate: TokenType.AGGREGATE,
    all: TokenType.ALL,
    and: TokenType.AND,
    as: TokenType.AS,
    asc: TokenType.ASC,
    between: TokenType.BETWEEN,
    by: TokenType.BY,
    call: TokenType.CALL,
    case: TokenType.CASE,
    create: TokenType.CREATE,
    date: TokenType.DATE,
    datetime: TokenType.DATETIME,
    day: TokenType.DAY,
    desc: TokenType.DESC,
    distinct: TokenType.DISTINCT,
    else: TokenType.ELSE,
    end: TokenType.END,
    except: TokenType.EXCEPT,
    extend: TokenType.EXTEND,
    false: TokenType.FALSE,
    from: TokenType.FROM,
    full: TokenType.FULL,
    function: TokenType.FUNCTION,
    group: TokenType.GROUP,
    if: TokenType.IF,
    in: TokenType.IN,
    inner: TokenType.INNER,
    interval: TokenType.INTERVAL,
    is: TokenType.IS,
    join: TokenType.JOIN,
    left: TokenType.LEFT,
    like: TokenType.LIKE,
    limit: TokenType.LIMIT,
    not: TokenType.NOT,
    null: TokenType.NULL,
    on: TokenType.ON,
    offset: TokenType.OFFSET,
    or: TokenType.OR,
    order: TokenType.ORDER,
    outer: TokenType.OUTER,
    over: TokenType.OVER,
    partition: TokenType.PARTITION,
    rename: TokenType.RENAME,
    returns: TokenType.RETURNS,
    right: TokenType.RIGHT,
    safe_cast: TokenType.SAFE_CAST,
    second: TokenType.SECOND,
    select: TokenType.SELECT,
    set: TokenType.SET,
    struct: TokenType.STRUCT,
    table: TokenType.TABLE,
    temp: TokenType.TEMP,
    then: TokenType.THEN,
    timestamp: TokenType.TIMESTAMP,
    true: TokenType.TRUE,
    union: TokenType.UNION,
    when: TokenType.WHEN,
    where: TokenType.WHERE,
    window: TokenType.WINDOW,
    with: TokenType.WITH,
    year: TokenType.YEAR,
    // Data Types
    array: TokenType.ARRAY,
    bool: TokenType.BOOL,
    boolean: TokenType.BOOLEAN,
    bytes: TokenType.BYTES,
    time: TokenType.TIME,
    string: TokenType.STRING,
    json: TokenType.JSON,
    int: TokenType.INT,
    int64: TokenType.INT64,
    smallint: TokenType.SMALLINT,
    integer: TokenType.INTEGER,
    bigint: TokenType.BIGINT,
    tinyint: TokenType.TINYINT,
    byteint: TokenType.BYTEINT,
    numeric: TokenType.NUMERIC,
    decimal: TokenType.DECIMAL,
    bignumeric: TokenType.BIGNUMERIC,
    bigdecimal: TokenType.BIGDECIMAL,
    float64: TokenType.FLOAT64,
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
      case '.':
        if (this.isDigit(this.peek())) {
          this.number();
        } else {
          this.addToken(TokenType.DOT);
        }
        break;
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
      case '#':
        // A comment goes until the end of the line.
        while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
        break;
      case '!':
        this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case '=':
        this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
        break;
      case '<':
        if (this.match('=')) {
          this.addToken(TokenType.LESS_EQUAL);
        } else if (this.match('>')) {
          this.addToken(TokenType.LESS_GREATER);
        } else if (this.match('<')) {
          this.addToken(TokenType.SHIFT_LEFT);
        }
        else {
          this.addToken(TokenType.LESS);
        }
        break;
      case '>':
        if (this.match('=')) {
          this.addToken(TokenType.GREATER_EQUAL);
        } else if (this.match('>')) {
          this.addToken(TokenType.SHIFT_RIGHT);
        } else {
          this.addToken(TokenType.GREATER);
        }
        break;
      case '|':
        if (this.match('>')) {
          this.addToken(TokenType.PIPE_GREATER);
        } else if (this.match('|')) {
          this.addToken(TokenType.PIPE_PIPE);
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
          while (this.peek() !== '*' || this.peekNext() !== '/') {
            if (this.isAtEnd()) {
              throw new Error(`[line ${this.line}] Error: Unterminated block comment.`);
            }
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
      case '&': this.addToken(TokenType.AMPERSAND); break;
      case '^': this.addToken(TokenType.CARET); break;
      case '~': this.addToken(TokenType.TILDE); break;

      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace.
        break;

      case '\n':
        this.line++;
        this.col = 0;
        break;

      case "'":
        this.string(c);
        break;
      
      case '`':
        this.quotedIdentifier();
        break;

      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          throw new Error(`[line ${this.line}] Error: Unexpected character: ${c}`);
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
    let value = '';
    while (this.peek() !== quote && !this.isAtEnd()) {
      let char = this.peek();
      if (char === '\\') {
        this.advance(); // Consume the backslash
        if (this.isAtEnd()) {
          throw new Error(`[line ${this.line}] Error: Unterminated string.`);
        }
        const nextChar = this.peek();
        if (nextChar === quote || nextChar === '\\') {
          char = nextChar;
        } else {
          // Not a valid escape sequence, treat as literal backslash
          char = '\\' + nextChar;
        }
      }
      value += char;
      this.advance();
    }

    if (this.isAtEnd()) {
      throw new Error(`[line ${this.line}] Error: Unterminated string.`);
    }

    // The closing quote.
    this.advance();

    this.addToken(TokenType.STRING_LITERAL, value);
  }

  private quotedIdentifier(): void {
    while (this.peek() !== '`' && !this.isAtEnd()) {
      if (this.peek() === '\n') {
        this.line++;
        this.col = 0;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      throw new Error(`[line ${this.line}] Error: Unterminated quoted identifier.`);
    }

    // The closing `.
    this.advance();

    // Trim the surrounding backticks.
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.IDENTIFIER, value);
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
    
    // Look for an exponent part.
    if (this.peek().toLowerCase() === 'e') {
      this.advance();
      if (this.peek() === '+' || this.peek() === '-') {
        this.advance();
      }
      if (!this.isDigit(this.peek())) {
        throw new Error(`[line ${this.line}] Error: Invalid number format, expected digit after exponent.`);
      }
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
