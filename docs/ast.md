# AST Documentation

This document describes the Abstract Syntax Tree (AST) used in the Pipe Query parser. The AST is defined in `src/parser/ast.ts`.

## Overview

The AST is divided into three main categories of nodes:

1.  **Types**: Represent data types (scalar, complex, and table types).
2.  **Expressions (`Expr`)**: Represent values and computations.
3.  **Statements (`Stmt`)**: Represent actions, queries, and definitions.

All nodes implement the Visitor pattern, allowing for easy traversal and processing.

## Enums

The AST uses several Enums to ensure type safety and avoid magic strings.

### `SimpleTypeKind`

`INT64`, `FLOAT64`, `STRING`, `BOOL`, `BYTES`, `DATE`, `DATETIME`, `TIME`, `TIMESTAMP`, `GEOGRAPHY`, `INTERVAL`, `JSON`, `NUMERIC`, `BIGNUMERIC`

### `BinaryOperator`

`PLUS` (+), `MINUS` (-), `MULTIPLY` (\*), `DIVIDE` (/), `CONCAT` (||), `EQUALS` (=), `NOT_EQUALS` (!=), `LESS_THAN` (<), `LESS_THAN_OR_EQUAL` (<=), `GREATER_THAN` (>), `GREATER_THAN_OR_EQUAL` (>=), `AND`, `OR`, `IS`, `IN`, `LIKE`, `BITWISE_OR` (|), `BITWISE_XOR` (^), `BITWISE_AND` (&), `BITWISE_LEFT_SHIFT` (<<), `BITWISE_RIGHT_SHIFT` (>>)

### `UnaryOperator`

`PLUS` (+), `MINUS` (-), `NOT`, `BITWISE_NOT` (~)

### `LiteralKind`

`INT`, `FLOAT`, `STRING`, `BOOL`, `NULL`

### `JoinType`

`INNER`, `LEFT`, `RIGHT`, `FULL`, `CROSS`

### `SetOperator`

`UNION`, `INTERSECT`, `EXCEPT`

### `OrderByDirection`

`ASC`, `DESC`

## 1. Types

### `Type` (Abstract Base Class)

### `SimpleType`

- `kind`: `SimpleTypeKind`

### `ArrayType`

- `elementType`: `Type`

### `StructType`

- `fields`: `{ name: string, type: Type }[]`

### `TableType`

- `columns`: `{ name: string, type: Type }[]`

### `AnyType`

- `kind`: (Implicitly ANY)

### `AnyTableType`

- `kind`: (Implicitly ANY TABLE)

## 2. Expressions (`Expr`)

### `Literal`

- `kind`: `LiteralKind`
- `value`: `string | number | boolean | null`

### `Variable`

- `name`: `string`

### `Call`

- `callee`: `Expr`
- `args`: `Expr[]`

### `Binary`

- `left`: `Expr`
- `operator`: `BinaryOperator`
- `right`: `Expr`

### `Unary`

- `operator`: `UnaryOperator`
- `right`: `Expr`

### `Logical`

- `left`: `Expr`
- `operator`: `BinaryOperator` (AND/OR)
- `right`: `Expr`

### `Assign`

- `name`: `string`
- `value`: `Expr`

### `Get`

- `object`: `Expr`
- `name`: `string`

### `CaseExpr`

- `cases`: `{ condition: Expr, result: Expr }[]`
- `elseBranch`: `Expr | null`

## 3. Statements (`Stmt`)

### Function Definitions

#### `CreateFunctionStmt`

- `modifiers`: `string[]`
- `name`: `string`
- `params`: `FunctionParam[]`
- `returnType`: `Type | null`
- `determinism`: `string | null`
- `language`: `string | null`
- `options`: `{ key: string, value: Expr }[]`
- `body`: `Expr | string`

#### `CreateTableFunctionStmt`

- `modifiers`: `string[]`
- `name`: `string`
- `params`: `FunctionParam[]`
- `returnSchema`: `TableType | null`
- `body`: `Stmt`

### Query Statements

#### `QueryStmt`

- `statements`: `Stmt[]`

#### `PipeOperatorStmt` (Abstract)

- `SelectStmt`: `columns: SelectColumn[]`
- `WhereStmt`: `condition: Expr`
- `AggregateStmt`: `columns: AggregateColumn[]`, `groupBy: Variable[]`
- `JoinStmt`: `table: string`, `on: Expr`, `type: JoinType`
- `SetStmt`: `operator: SetOperator`, `query: QueryStmt`, `distinct: boolean`
- `ExtendStmt`: `columns: SelectColumn[]`
- `RenameStmt`: `renames: { from: string, to: string }[]`
- `OrderByStmt`: `columns: { expression: Expr, direction: OrderByDirection }[]`
- `LimitStmt`: `count: Expr`, `offset: Expr | null`
- `DistinctStmt`: (No fields)
- `AsStmt`: `name: string`
- `CallStmt`: `name: string`, `args: Expr[]`
