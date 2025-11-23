# Scalar Expressions

Scalar expressions are expressions that resolve to a single value (as opposed to a table or a set of rows). They are the building blocks of queries, used in `SELECT` lists, `WHERE` clauses, function arguments, and more.

This document outlines the grammar and syntax for scalar expressions in our SQL dialect, designed to be compatible with `grammar-well`.

## Lexical Structure

The lexer defines the basic tokens used in expressions.

```well
lexer {
    // ... existing tokens ...

    // Literal Values
    [literals]
        - when r:{true|false} tag "bool_lit" highlight "keyword"
        - when "NULL" tag "null_lit" highlight "keyword"
        - when r:{\d+\.\d+} tag "float_lit" highlight "number"
        - when r:{\d+} tag "int_lit" highlight "number"
        - when r:{"[^"]*"} tag "string_lit" highlight "string"
        - when r:{'[^']*'} tag "string_lit" highlight "string"

    // Operators
    [operators]
        - when "+" tag "plus"
        - when "-" tag "minus"
        - when "*" tag "star"
        - when "/" tag "slash"
        - when "%" tag "percent"
        - when "=" tag "eq"
        - when "!=" tag "neq"
        - when "<>" tag "neq"
        - when "<" tag "lt"
        - when "<=" tag "lte"
        - when ">" tag "gt"
        - when ">=" tag "gte"
        - when "AND" tag "and" highlight "keyword"
        - when "OR" tag "or" highlight "keyword"
        - when "NOT" tag "not" highlight "keyword"
        - when "IS" tag "is" highlight "keyword"
        - when "IN" tag "in" highlight "keyword"
        - when "LIKE" tag "like" highlight "keyword"
        - when "BETWEEN" tag "between" highlight "keyword"
        - when "||" tag "concat"

    // Keywords for Expressions
    [keywords]
        - when "CASE" tag "case" highlight "keyword"
        - when "WHEN" tag "when" highlight "keyword"
        - when "THEN" tag "then" highlight "keyword"
        - when "ELSE" tag "else" highlight "keyword"
        - when "END" tag "end" highlight "keyword"
        - when "IF" tag "if" highlight "keyword"
        - when "COALESCE" tag "coalesce" highlight "keyword"
        - when "NULLIF" tag "nullif" highlight "keyword"
        - when "STRUCT" tag "struct" highlight "keyword"
        - when "ARRAY" tag "array" highlight "keyword"
        - when "EXTRACT" tag "extract" highlight "keyword"
        - when "CAST" tag "cast" highlight "keyword"
        - when "AS" tag "as" highlight "keyword"
}
```

## Operator Precedence

The following table lists operators from highest (evaluated first) to lowest precedence.

| Operator                                                   | Description                                                      |
| :--------------------------------------------------------- | :--------------------------------------------------------------- | ---------- | --------------------------------------- |
| `.` `[]` `OFFSET` `ORDINAL`                                | Field access, Array access                                       |
| `+` `-` `~`                                                | Unary plus, minus, bitwise not                                   |
| `*` `/` `                                                  |                                                                  | `          | Multiplication, Division, Concatenation |
| `+` `-`                                                    | Addition, Subtraction                                            |
| `<<` `>>`                                                  | Bitwise left shift, right shift                                  |
| `&`                                                        | Bitwise AND                                                      |
| `^`                                                        | Bitwise XOR                                                      |
| `                                                          | `                                                                | Bitwise OR |
| `=` `<` `>` `<=` `>=` `!=` `<>` `LIKE` `BETWEEN` `IN` `IS` | Comparison, Pattern matching, Range, Membership, Null/Bool check |
| `NOT`                                                      | Logical NOT                                                      |
| `AND`                                                      | Logical AND                                                      |
| `OR`                                                       | Logical OR                                                       |

## Grammar Rules

The grammar defines how tokens are combined to form valid expressions, strictly following the precedence order defined above.

```well
grammar {
    // Top-level expression rule (Lowest precedence)
    [Expression]
        | OrExpression

    // 12. Logical OR
    [OrExpression]
        | AndExpression
        | OrExpression "OR" __ AndExpression

    // 11. Logical AND
    [AndExpression]
        | NotExpression
        | AndExpression "AND" __ NotExpression

    // 10. Logical NOT
    [NotExpression]
        | "NOT" __ NotExpression
        | ComparisonExpression

    // 9. Comparisons
    [ComparisonExpression]
        | BitwiseOrExpression
        | BitwiseOrExpression __ ComparisonOp __ BitwiseOrExpression
        | BitwiseOrExpression __ "IS" __ ("NOT" __)? "NULL"
        | BitwiseOrExpression __ "IS" __ ("NOT" __)? "TRUE"
        | BitwiseOrExpression __ "IS" __ ("NOT" __)? "FALSE"
        | BitwiseOrExpression __ ("NOT" __)? "IN" __ "(" __ ExpressionList __ ")"
        | BitwiseOrExpression __ ("NOT" __)? "LIKE" __ BitwiseOrExpression
        | BitwiseOrExpression __ ("NOT" __)? "BETWEEN" __ BitwiseOrExpression __ "AND" __ BitwiseOrExpression

    [ComparisonOp]
        | "=" | "!=" | "<>" | "<" | "<=" | ">" | ">="

    // 8. Bitwise OR (|)
    [BitwiseOrExpression]
        | BitwiseXorExpression
        | BitwiseOrExpression __ "|" __ BitwiseXorExpression

    // 7. Bitwise XOR (^)
    [BitwiseXorExpression]
        | BitwiseAndExpression
        | BitwiseXorExpression __ "^" __ BitwiseAndExpression

    // 6. Bitwise AND (&)
    [BitwiseAndExpression]
        | BitwiseShiftExpression
        | BitwiseAndExpression __ "&" __ BitwiseShiftExpression

    // 5. Bitwise Shift (<<, >>)
    [BitwiseShiftExpression]
        | AdditiveExpression
        | BitwiseShiftExpression __ "<<" __ AdditiveExpression
        | BitwiseShiftExpression __ ">>" __ AdditiveExpression

    // 4. Additive (+, -)
    [AdditiveExpression]
        | MultiplicativeExpression
        | AdditiveExpression __ "+" __ MultiplicativeExpression
        | AdditiveExpression __ "-" __ MultiplicativeExpression

    // 3. Multiplicative (*, /, ||)
    [MultiplicativeExpression]
        | UnaryExpression
        | MultiplicativeExpression __ "*" __ UnaryExpression
        | MultiplicativeExpression __ "/" __ UnaryExpression
        | MultiplicativeExpression __ "||" __ UnaryExpression

    // 2. Unary (+, -, ~)
    [UnaryExpression]
        | "+" __ UnaryExpression
        | "-" __ UnaryExpression
        | "~" __ UnaryExpression
        | PostfixExpression

    // 1. Postfix (Access) - [], ., OFFSET, ORDINAL
    [PostfixExpression]
        | PrimaryExpression
        | PostfixExpression "." <word>
        | PostfixExpression "[" __ Expression __ "]"
        | PostfixExpression "[" __ "OFFSET" "(" __ Expression __ ")" __ "]"
        | PostfixExpression "[" __ "ORDINAL" "(" __ Expression __ ")" __ "]"

    // 0. Primary Expressions (Atoms)
    [PrimaryExpression]
        | Literal
        | Identifier
        | FunctionCall
        | CaseExpression
        | IfExpression
        | CoalesceExpression
        | NullIfExpression
        | ArrayConstructor
        | StructConstructor
        | CastExpression
        | ExtractExpression
        | "(" __ Expression __ ")"

    // ... Literals and other rules ...

    // Literals
    [Literal]
        | <int_lit>
        | <float_lit>
        | <string_lit>
        | <bool_lit>
        | <null_lit>
        | TypedLiteral

    [TypedLiteral]
        | "DATE" __ <string_lit>
        | "TIME" __ <string_lit>
        | "DATETIME" __ <string_lit>
        | "TIMESTAMP" __ <string_lit>
        | "INTERVAL" __ <string_lit> __ <word> // e.g. INTERVAL '1' DAY
        | "JSON" __ <string_lit>
        | "NUMERIC" __ <string_lit>
        | "BIGNUMERIC" __ <string_lit>

    // Identifiers (Columns, Variables)
    [Identifier]
        | <word>

    // Function Calls
    [FunctionCall]
        | <word> "(" __ (ExpressionList)? __ ")"
        | "COUNT" "(" __ "*" __ ")" // Special case for COUNT(*)

    [ExpressionList]
        | Expression
        | ExpressionList "," __ Expression

    // CASE Expression
    [CaseExpression]
        | "CASE" __ (Expression __)? CaseWhenClauses __ ("ELSE" __ Expression __)? "END"

    [CaseWhenClauses]
        | "WHEN" __ Expression __ "THEN" __ Expression
        | CaseWhenClauses __ "WHEN" __ Expression __ "THEN" __ Expression

    // IF Expression
    [IfExpression]
        | "IF" "(" __ Expression "," __ Expression "," __ Expression __ ")"

    // COALESCE Expression
    [CoalesceExpression]
        | "COALESCE" "(" __ ExpressionList __ ")"

    // NULLIF Expression
    [NullIfExpression]
        | "NULLIF" "(" __ Expression "," __ Expression __ ")"

    // CAST Expression
    [CastExpression]
        | "CAST" "(" __ Expression __ "AS" __ <dataType> __ ")"

    // EXTRACT Expression
    [ExtractExpression]
        | "EXTRACT" "(" __ <word> __ "FROM" __ Expression __ ")"

    // Array Constructor
    [ArrayConstructor]
        | "[" __ (ExpressionList)? __ "]"
        | "ARRAY" "<" __ <dataType> __ ">" "[" __ (ExpressionList)? __ "]"

    // Struct Constructor
    [StructConstructor]
        | "STRUCT" "(" __ (ExpressionList)? __ ")"
        | "STRUCT" "<" __ ColumnDeclarations __ ">" "(" __ (ExpressionList)? __ ")"
}
```

## Expression Types

### 1. Literals

Literals represent constant values.

- **Numbers**: `123`, `3.14`
- **Strings**: `'hello'`, `"world"`
- **Booleans**: `true`, `false`
- **Null**: `NULL`
- **Typed Literals**:
  - `DATE '2023-01-01'`
  - `TIMESTAMP '2023-01-01 12:00:00'`
  - `INTERVAL '1' DAY`
  - `JSON '{"key": "value"}'`

### 2. Identifiers

Identifiers refer to columns or variables. They can be simple names or qualified paths.

- `column_name`
- `table.column`
- `struct_col.field`

### 3. Arithmetic Operations

Standard mathematical operations.

- `a + b`
- `x * (y - z)`

### 4. Logical Operations

Boolean logic.

- `x > 5 AND y < 10`
- `NOT is_active`

### 5. Comparison Operations

Comparing values.

- `a = b`
- `age >= 18`
- `name LIKE 'J%'`
- `status IN ('active', 'pending')`
- `score BETWEEN 0 AND 100`

### 6. Function Calls

Invoking built-in or user-defined functions.

- `UPPER(name)`
- `DATE_ADD(date_col, INTERVAL 1 DAY)`

### 7. Conditional Expressions

Logic to return different values based on conditions.

**CASE**:

```sql
CASE
    WHEN score > 90 THEN 'A'
    WHEN score > 80 THEN 'B'
    ELSE 'C'
END
```

**IF**:

```sql
IF(condition, true_val, false_val)
```

**COALESCE**:
Returns the first non-null argument.

```sql
COALESCE(nullable_col, 'default')
```

**NULLIF**:
Returns NULL if arguments are equal, otherwise the first argument.

```sql
NULLIF(a, 0) -- Avoid division by zero
```

### 8. Array & Struct Constructors

Creating complex types.

**Array**:

```sql
[1, 2, 3]
ARRAY<STRING>['a', 'b']
```

**Struct**:

```sql
STRUCT(1 as id, 'name' as name)
```
