# AST Documentation

This document describes the Abstract Syntax Tree (AST) used in the Pipe Query parser. The AST is defined in `src/parser/ast.ts`.

## Overview

The AST is divided into three main categories of nodes:

1.  **Types**: Represent data types (scalar, complex, and table types).
2.  **Expressions (`Expr`)**: Represent values and computations.
3.  **Statements (`Stmt`)**: Represent actions, queries, and definitions.

All nodes implement the Visitor pattern, allowing for easy traversal and processing (e.g., for code generation, analysis, or execution).

## 1. Types

The type system has been expanded to support complex types and table types required for UDFs and TVFs.

### `Type` (Abstract Base Class)

Base class for all type nodes.

### `SimpleType`

Represents scalar types like `INT64`, `STRING`, `BOOL`, `FLOAT64`, etc.

- `name`: Token (The type name)

### `ArrayType`

Represents an array of another type, e.g., `ARRAY<STRING>`.

- `elementType`: Type

### `StructType`

Represents a structure with named fields, e.g., `STRUCT<name STRING, age INT64>`.

- `fields`: `{ name: Token, type: Type }[]`

### `TableType`

Represents a table schema, used in TVF parameters and return types, e.g., `TABLE<id INT64, val STRING>`.

- `columns`: `{ name: Token, type: Type }[]`

### `AnyType`

Represents the polymorphic `ANY TYPE`, used in templated functions.

### `AnyTableType`

Represents the polymorphic `ANY TABLE`, used in TVFs that accept any table as input.

## 2. Expressions (`Expr`)

Expressions evaluate to a value.

### `Literal`

Represents a constant value (number, string, boolean, null).

- `value`: any

### `Variable`

Represents a variable reference.

- `name`: Token

### `Call`

Represents a function call.

- `callee`: Expr (Usually a `Variable` holding the function name)
- `args`: Expr[]

### `Binary` / `Unary` / `Logical`

Standard operators (`+`, `-`, `AND`, `OR`, `NOT`, etc.).

### `Assign`

Assignment expression (e.g., in `SET` statements or default values).

### `Get`

Member access, e.g., `struct.field`.

### `CaseExpr`

`CASE WHEN ... THEN ... ELSE ... END` expression.

## 3. Statements (`Stmt`)

Statements are the top-level units of execution.

### Function Definitions

#### `CreateFunctionStmt` (Scalar UDF)

Defines a scalar user-defined function.

- `modifiers`: `TEMP`, `PUBLIC`, `PRIVATE`
- `name`: Function name
- `params`: List of `FunctionParam` (name, type, default value)
- `returnType`: The return `Type`
- `language`: `js` or `sql` (implicit if null)
- `body`:
  - For SQL UDFs: An `Expr` representing the function logic.
  - For JS UDFs: A `string` (from a string literal) containing the JavaScript code.

#### `CreateTableFunctionStmt` (TVF)

Defines a table-valued function.

- `modifiers`: `TEMP`, `PUBLIC`, `PRIVATE`
- `name`: Function name
- `params`: List of `FunctionParam`
- `returnSchema`: A `TableType` defining the output schema (or null if inferred).
- `body`: A `Stmt` representing the query. This is typically a `QueryStmt` or a pipe chain.

### Query Statements

#### `QueryStmt`

Represents a full query, consisting of a sequence of statements (pipe operators).

- `statements`: `Stmt[]`

#### `PipeOperatorStmt` (Abstract)

Base class for statements that operate on a table stream (e.g., `SELECT`, `WHERE`, `AGGREGATE`).

- `FromStmt`: Starts a pipe chain from a table.
- `SelectStmt`: `|> SELECT ...`
- `WhereStmt`: `|> WHERE ...`
- `AggregateStmt`: `|> AGGREGATE ... GROUP BY ...`
- `JoinStmt`: `|> JOIN ... ON ...`
- `UnionStmt`, `ExceptStmt`, `IntersectStmt`: Set operations.
- `ExtendStmt`: `|> EXTEND ...` (Adds columns, often used for window functions).

## Implementation Notes

### Visitor Pattern

To implement logic (like a compiler or interpreter), implement the `StmtVisitor`, `ExprVisitor`, and `TypeVisitor` interfaces.

Example:

```typescript
class TypePrinter implements TypeVisitor<string> {
  visitSimpleType(type: SimpleType): string {
    return type.name.value;
  }
  // ... other methods
}
```

### Handling UDFs and TVFs

- **UDFs**: When visiting `CreateFunctionStmt`, check the `language`. If `js`, the body is a raw string to be executed in a JS sandbox. If `sql`, the body is an expression to be evaluated.
- **TVFs**: `CreateTableFunctionStmt` contains a `body` which is a `Stmt`. This body should be evaluated to produce a relation (table). The `returnSchema` can be used to validate or coerce the output.

### Polymorphism

`AnyType` and `AnyTableType` require special handling during resolution. They match any type/table passed as an argument.
