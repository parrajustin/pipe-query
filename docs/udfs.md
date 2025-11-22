# Google SQL User Defined Functions (UDFs)

This document provides documentation for Google SQL User Defined Functions (UDFs), including supported data types, expression information, and a formal grammar definition using the Grammar-Well format.

## 1. Data Types

Google SQL supports a variety of data types for UDF parameters and return values.

| Type Name | Description |
| :--- | :--- |
| `ARRAY<T>` | An ordered list of zero or more elements of non-array values. |
| `BOOL` (alias: `BOOLEAN`) | Boolean values (`TRUE`, `FALSE`, `NULL`). |
| `BYTES` | Variable-length binary data. Can be parameterized as `BYTES(L)`. |
| `DATE` | A logical calendar date (year, month, day). |
| `DATETIME` | A year, month, day, hour, minute, second, and subsecond. |
| `GEOGRAPHY` | A collection of points, linestrings, and polygons on the Earth's surface. |
| `INTERVAL` | A duration of time (years, months, days, hours, minutes, seconds). |
| `JSON` | JSON data. |
| `INT64` (aliases: `INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`) | 64-bit signed integer. |
| `NUMERIC` (alias: `DECIMAL`) | Fixed precision and scale decimal. Precision: 38, Scale: 9. Can be parameterized `NUMERIC(P, S)`. |
| `BIGNUMERIC` (alias: `BIGDECIMAL`) | Fixed precision and scale decimal. Precision: 76.76, Scale: 38. Can be parameterized `BIGNUMERIC(P, S)`. |
| `FLOAT64` | Double precision floating point. |
| `RANGE<T>` | Contiguous range between two dates, datetimes, or timestamps. |
| `STRING` | Variable-length Unicode character data. Can be parameterized as `STRING(L)`. |
| `STRUCT` | Container of ordered fields. |
| `TIME` | A time of day (hour, minute, second, subsecond). |
| `TIMESTAMP` | An absolute point in time. |

## 2. User Defined Functions (UDFs)

UDFs allow you to extend the SQL language with custom logic. They can be written in SQL or JavaScript.

### SQL UDFs

SQL UDFs are defined using a SQL expression. They operate on one row at a time and return a single value.

**Example:**

```sql
CREATE TEMP FUNCTION AddFourAndDivide(x INT64, y INT64)
RETURNS FLOAT64
AS (
  (x + 4) / y
);
```

### JavaScript UDFs

JavaScript UDFs allow you to write complex logic using JavaScript.

**Example:**

```sql
CREATE TEMP FUNCTION MultiplyInputs(x FLOAT64, y FLOAT64)
RETURNS FLOAT64
LANGUAGE js
AS r"""
  return x * y;
""";
```

## 3. Grammar

The following is a mock grammar for creating UDFs, defined in the Grammar-Well format.

```grammar
grammar {
  [CreateFunctionStatement]:
    | "CREATE" ("OR" "REPLACE")? ("TEMPORARY" | "TEMP")? "FUNCTION" ("IF" "NOT" "EXISTS")? FunctionName "(" FunctionParameters? ")" (SqlFunctionDefinition | JsFunctionDefinition)

  [SqlFunctionDefinition]:
    | ReturnsClause? "AS" "(" SqlFunctionBody ")"

  [JsFunctionDefinition]:
    | ReturnsClause DeterminismSpecifier? LanguageClause "AS" JsFunctionBodyString OptionsClause?

  [FunctionName]:
    | Identifier ("." Identifier)*

  [FunctionParameters]:
    | FunctionParameter ("," FunctionParameter)*

  [FunctionParameter]:
    | Identifier (DataType | "ANY" "TYPE") ("DEFAULT" Expression)?

  [ReturnsClause]:
    | "RETURNS" DataType

  [DeterminismSpecifier]:
    | "DETERMINISTIC"
    | "NOT" "DETERMINISTIC"
    | "IMMUTABLE"
    | "STABLE"
    | "VOLATILE"

  [LanguageClause]:
    | "LANGUAGE" "js"

  [OptionsClause]:
    | "OPTIONS" "(" OptionList ")"

  [OptionList]:
    | OptionItem ("," OptionItem)*

  [OptionItem]:
    | Identifier "=" Expression

  [JsFunctionBodyString]:
    | StringLiteral

  [SqlFunctionBody]:
    | Expression

  [DataType]:
    | "ARRAY" "<" DataType ">"
    | "BOOL" | "BOOLEAN"
    | "BYTES" ("(" IntegerLiteral ")")?
    | "DATE"
    | "DATETIME"
    | "GEOGRAPHY"
    | "INTERVAL"
    | "JSON"
    | "INT64" | "INT" | "SMALLINT" | "INTEGER" | "BIGINT" | "TINYINT" | "BYTEINT"
    | "NUMERIC" ("(" IntegerLiteral ("," IntegerLiteral)? ")")? | "DECIMAL" ("(" IntegerLiteral ("," IntegerLiteral)? ")")?
    | "BIGNUMERIC" ("(" IntegerLiteral ("," IntegerLiteral)? ")")? | "BIGDECIMAL" ("(" IntegerLiteral ("," IntegerLiteral)? ")")?
    | "FLOAT64"
    | "RANGE" "<" DataType ">"
    | "STRING" ("(" IntegerLiteral ")")?
    | "STRUCT" ("<" StructFields ">" | "(" StructFields ")")?
    | "TIME"
    | "TIMESTAMP"

  [StructFields]:
    | StructField ("," StructField)*

  [StructField]:
    | (Identifier)? DataType

  # Simplified Expression and Literal definitions for completeness of the mock grammar
  [Expression]:
    | Literal
    | Identifier
    | Expression Operator Expression
    | "(" Expression ")"
    | FunctionCall

  [FunctionCall]:
    | FunctionName "(" (Expression ("," Expression)*)? ")"

  [Literal]:
    | StringLiteral
    | IntegerLiteral
    | FloatLiteral
    | BooleanLiteral
    | NullLiteral

  [StringLiteral]:
    | r:{'([^'\\]|\\.)*'}
    | r:{"([^"\\]|\\.)*"}
    | r:{r'([^'\\]|\\.)*'}
    | r:{r"([^"\\]|\\.)*"}
    | r:{'''((?!''').)*'''}
    | r:{"""((?!""").)*"""}

  [IntegerLiteral]:
    | r:{[0-9]+}

  [FloatLiteral]:
    | r:{[0-9]*\.[0-9]+([eE][+-]?[0-9]+)?}

  [BooleanLiteral]:
    | "TRUE" | "FALSE"

  [NullLiteral]:
    | "NULL"

  [Identifier]:
    | r:{[a-zA-Z_][a-zA-Z0-9_]*}
    | r:{`[^`]+`}

  [Operator]:
    | "+" | "-" | "*" | "/" | "=" | "<" | ">" | "<=" | ">=" | "!=" | "<>"
}
```
