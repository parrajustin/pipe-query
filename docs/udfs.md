# Google SQL User Defined Functions (UDFs)

This document provides documentation for Google SQL User Defined Functions (UDFs), including supported data types, expression information, and a formal grammar definition using the Grammar-Well format.

For detailed information on scalar expressions used within UDFs, please refer to [Scalar Expressions](expressions.md).

## 1. Data Types

Google SQL supports a variety of data types for UDF parameters and return values.

| Type Name                                                                       | Description                                                                                              |
| :------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------- |
| `ARRAY<T>`                                                                      | An ordered list of zero or more elements of non-array values.                                            |
| `BOOL` (alias: `BOOLEAN`)                                                       | Boolean values (`TRUE`, `FALSE`, `NULL`).                                                                |
| `BYTES`                                                                         | Variable-length binary data. Can be parameterized as `BYTES(L)`.                                         |
| `DATE`                                                                          | A logical calendar date (year, month, day).                                                              |
| `DATETIME`                                                                      | A year, month, day, hour, minute, second, and subsecond.                                                 |
| `GEOGRAPHY`                                                                     | A collection of points, linestrings, and polygons on the Earth's surface.                                |
| `INTERVAL`                                                                      | A duration of time (years, months, days, hours, minutes, seconds).                                       |
| `JSON`                                                                          | JSON data.                                                                                               |
| `INT64` (aliases: `INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`) | 64-bit signed integer.                                                                                   |
| `NUMERIC` (alias: `DECIMAL`)                                                    | Fixed precision and scale decimal. Precision: 38, Scale: 9. Can be parameterized `NUMERIC(P, S)`.        |
| `BIGNUMERIC` (alias: `BIGDECIMAL`)                                              | Fixed precision and scale decimal. Precision: 76.76, Scale: 38. Can be parameterized `BIGNUMERIC(P, S)`. |
| `FLOAT64`                                                                       | Double precision floating point.                                                                         |
| `RANGE<T>`                                                                      | Contiguous range between two dates, datetimes, or timestamps.                                            |
| `STRING`                                                                        | Variable-length Unicode character data. Can be parameterized as `STRING(L)`.                             |
| `STRUCT`                                                                        | Container of ordered fields.                                                                             |
| `TIME`                                                                          | A time of day (hour, minute, second, subsecond).                                                         |
| `TIMESTAMP`                                                                     | An absolute point in time.                                                                               |

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
    | "CREATE" ("OR" "REPLACE")? ("TEMPORARY" | "TEMP")?@temp "FUNCTION" ("IF" "NOT" "EXISTS")? FunctionName@name "(" FunctionParameters?@params ")" (SqlFunctionDefinition | JsFunctionDefinition)@def
    => {
      const modifiers = $temp ? [$temp.value] : []; // Extract string value
      // Flatten params if present, otherwise empty array
      const parameters = $params || [];
      return new CreateFunctionStmt(
        modifiers,
        $name,
        parameters,
        $def.returnType,
        $def.determinism,
        $def.language,
        $def.options,
        $def.body
      );
    }

  [SqlFunctionDefinition]:
    | ReturnsClause?@ret "AS" "(" SqlFunctionBody@body ")"
    => {
      return {
        returnType: $ret,
        body: $body,
        language: null,
        determinism: null,
        options: []
      };
    }

  [JsFunctionDefinition]:
    | ReturnsClause@ret DeterminismSpecifier?@det LanguageClause@lang "AS" JsFunctionBodyString@body OptionsClause?@opts
    => {
      return {
        returnType: $ret,
        body: $body.value, // Extract string value
        language: $lang,
        determinism: $det ? $det.value : null,
        options: $opts || []
      };
    }

  [FunctionName]:
    | Identifier ("." Identifier)* => ( $0 ) -- Simplified for now, assuming single token or handling elsewhere

  [FunctionParameters]:
    | FunctionParameter ("," FunctionParameter)*
    => {
      return [$0, ...$1.map(p => p[1])];
    }

  [FunctionParameter]:
    | Identifier@name (DataType | "ANY" "TYPE")@type ("DEFAULT" Expression@def)?
    => {
      // Handle ANY TYPE as AnyType node
      const paramType = $type.length === 2 && $type[0].value === "ANY" ? new AnyType() : $type;
      return new FunctionParam($name, paramType, $def);
    }

  [ReturnsClause]:
    | "RETURNS" DataType@type => ( $type )

  [DeterminismSpecifier]:
    | "DETERMINISTIC"
    | "NOT" "DETERMINISTIC"
    | "IMMUTABLE"
    | "STABLE"
    | "VOLATILE"

  [LanguageClause]:
    | "LANGUAGE" "js"@lang => ( $lang.value )

  [OptionsClause]:
    | "OPTIONS" "(" OptionList@opts ")" => ( $opts )

  [OptionList]:
    | OptionItem ("," OptionItem)*
    => {
      return [$0, ...$1.map(i => i[1])];
    }

  [OptionItem]:
    | Identifier@key "=" Expression@val
    => {
      return { key: $key, value: $val }; // key is now string from Identifier rule
    }

  [JsFunctionBodyString]:
    | r:{r"""((?!""").)*"""}

  [SqlFunctionBody]:
    | Expression@expr => ( $expr )

  [DataType]:
    | "ARRAY" "<" DataType@elem ">" => ( new ArrayType($elem) )
    | "BOOL" | "BOOLEAN" => ( new SimpleType(SimpleTypeKind.BOOL) )
    | "BYTES" ("(" IntegerLiteral ")")? => ( new SimpleType(SimpleTypeKind.BYTES) )
    | "DATE" => ( new SimpleType(SimpleTypeKind.DATE) )
    | "DATETIME" => ( new SimpleType(SimpleTypeKind.DATETIME) )
    | "GEOGRAPHY" => ( new SimpleType(SimpleTypeKind.GEOGRAPHY) )
    | "INTERVAL" => ( new SimpleType(SimpleTypeKind.INTERVAL) )
    | "JSON" => ( new SimpleType(SimpleTypeKind.JSON) )
    | "INT64" | "INT" | "SMALLINT" | "INTEGER" | "BIGINT" | "TINYINT" | "BYTEINT" => ( new SimpleType(SimpleTypeKind.INT64) )
    | "NUMERIC" ("(" IntegerLiteral ("," IntegerLiteral)? ")")? | "DECIMAL" ("(" IntegerLiteral ("," IntegerLiteral)? ")")? => ( new SimpleType(SimpleTypeKind.NUMERIC) )
    | "BIGNUMERIC" ("(" IntegerLiteral ("," IntegerLiteral)? ")")? | "BIGDECIMAL" ("(" IntegerLiteral ("," IntegerLiteral)? ")")? => ( new SimpleType(SimpleTypeKind.BIGNUMERIC) )
    | "FLOAT64" => ( new SimpleType(SimpleTypeKind.FLOAT64) )
    | "RANGE" "<" DataType@elem ">" => ( new SimpleType(SimpleTypeKind.STRING) ) -- Placeholder
    | "STRING" ("(" IntegerLiteral ")")? => ( new SimpleType(SimpleTypeKind.STRING) )
    | "STRUCT" ("<" StructFields@fields ">" | "(" StructFields@fields ")")? => ( new StructType($fields || []) )
    | "TIME" => ( new SimpleType(SimpleTypeKind.TIME) )
    | "TIMESTAMP" => ( new SimpleType(SimpleTypeKind.TIMESTAMP) )

  [StructFields]:
    | StructField ("," StructField)*
    => {
      return [$0, ...$1.map(f => f[1])];
    }

  [StructField]:
    | (Identifier)?@name DataType@type
    => {
      return { name: $name, type: $type };
    }

  [Identifier]:
    | <word> => ( $0.value )

  # Expression Grammar
  # The Expression rule and its dependencies are defined in docs/expressions.md
  # We import/reference them here conceptually.
  [Expression]:
    | <import: expressions.md:Expression>
}
```
