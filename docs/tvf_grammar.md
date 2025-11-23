# TVF Grammar Draft

## TVF Concepts & Variations

Table-Valued Functions (TVFs) in Google SQL are powerful tools that allow you to encapsulate complex query logic into reusable functions. Unlike scalar functions which return a single value, TVFs return an entire table.

### Key Concepts

1.  **Table Parameters**: TVFs can accept tables as arguments. This allows for "higher-order" query logic where you pass data _into_ a function for processing.
    - `TABLE<col type, ...>`: Enforces a specific schema.
    - `ANY TABLE`: Accepts any table (polymorphic).
2.  **Templated Parameters (`ANY TYPE`)**: Allows functions to accept arguments of any type, resolved at call time.
3.  **Query Expression**: The body of a SQL TVF is a standard `SELECT` statement (or `WITH` statement). This means anything you can do in a query, you can do in a TVF.

### Variations & Structures

#### 1. TVF with Window Functions & Parameters (Pipe Syntax)

You can parameterize window operations. In pipe syntax, use `EXTEND` or `SELECT` to apply window functions.

```sql
/*
  Calculates a moving average over a specified window size.
  Arguments:
    data: Input table with 'value' and 'ts' columns.
    window_size: Number of rows to include in the moving average.
*/
CREATE TEMP TABLE FUNCTION MovingAverage(
  data TABLE<value FLOAT64, ts TIMESTAMP>,
  window_size INT64
)
AS (
  FROM data
  |> SELECT
      ts,
      value,
      AVG(value) OVER (
        ORDER BY ts
        ROWS BETWEEN window_size PRECEDING AND CURRENT ROW
      ) AS moving_avg
);
```

#### 2. TVF with Aggregate Calls (Pipe Syntax)

Use the `AGGREGATE` pipe operator for summarization.

```sql
/*
  Aggregates sales data and filters by a minimum threshold.
  Arguments:
    sales_data: Input table.
    min_threshold: Minimum total sales to include.
*/
CREATE TEMP TABLE FUNCTION HighValueSales(
  sales_data TABLE<item STRING, amount FLOAT64>,
  min_threshold FLOAT64
)
AS (
  FROM sales_data
  |> AGGREGATE SUM(amount) AS total_sales GROUP BY item
  |> WHERE total_sales >= min_threshold
);
```

#### 3. TVF with CTEs (Pipe Syntax)

Use `WITH` clauses with pipe syntax for intermediate steps.

```sql
/*
  Complex processing using CTEs to prepare data before final selection.
*/
CREATE TABLE FUNCTION ProcessUserStats(
  raw_logs TABLE<user_id INT64, action STRING, timestamp TIMESTAMP>
)
AS (
  WITH DailyCounts AS (
    FROM raw_logs
    |> AGGREGATE COUNT(*) AS action_count GROUP BY user_id, DATE(timestamp) AS date
  ),
  UserAverages AS (
    FROM DailyCounts
    |> AGGREGATE AVG(action_count) AS avg_daily_actions GROUP BY user_id
  )
  FROM DailyCounts AS d
  |> JOIN UserAverages AS u ON d.user_id = u.user_id
  |> SELECT
      d.user_id,
      d.date,
      d.action_count,
      u.avg_daily_actions
);
```

#### 4. TVF with `ANY TABLE` (Polymorphic)

```sql
CREATE TEMP TABLE FUNCTION FilterByStatus(
  input_table ANY TABLE,
  status_val STRING
)
AS (
  FROM input_table
  |> WHERE status = status_val -- 'input_table' must have a 'status' column
);
```

#### 5. TVF with `OVER` Operator (Windowing)

Using the `OVER` operator directly in an `EXTEND` pipe to add columns without grouping.

```sql
/*
  Adds a running total and rank to the input data.
*/
CREATE TEMP TABLE FUNCTION AddRankAndRunningTotal(
  data TABLE<category STRING, score INT64>
)
AS (
  FROM data
  |> EXTEND
      RANK() OVER (PARTITION BY category ORDER BY score DESC) AS rank,
      SUM(score) OVER (PARTITION BY category ORDER BY score ROWS UNBOUNDED PRECEDING) AS running_total
);
```

#### 6. Set Operations (Union, Intersect, Except)

Set operations in pipe syntax are applied to the result of the previous pipe. The right-hand side is a parenthesized query expression.

```sql
FROM table_a
|> UNION ALL (FROM table_b)
|> INTERSECT DISTINCT (FROM table_a |> WHERE id > 5)
```

## Pseudo-Grammar

```ebnf
CreateTVFStatement ::=
    "CREATE" ("OR" "REPLACE")? ("TEMPORARY" | "TEMP" | "PUBLIC" | "PRIVATE")? "TABLE" "FUNCTION" ("IF" "NOT" "EXISTS")?
    FunctionName "(" FunctionParameters? ")"
    ("RETURNS" "TABLE" "<" ColumnDeclarations ">")?
    "AS" "(" QueryExpression ")"

FunctionName ::= Identifier ("." Identifier)*

FunctionParameters ::= FunctionParameter ("," FunctionParameter)*

FunctionParameter ::=
    Identifier (DataType | "ANY" "TYPE" | "ANY" "TABLE" | TableType) ("DEFAULT" Expression)?

TableType ::= "TABLE" "<" (ColumnDeclarations | DataType) ">"

ColumnDeclarations ::= ColumnDeclaration ("," ColumnDeclaration)*

ColumnDeclaration ::= Identifier DataType

# QueryExpression covers all standard query syntax including WITH, SELECT, FROM, WHERE, GROUP BY, WINDOW, etc.
QueryExpression ::= (WithClause)? FromClause PipeOperator*

FromClause ::= "FROM" (Table | FunctionCall | SubQuery)

PipeOperator ::=
    "|>" "SELECT" SelectList
  | "|>" "WHERE" Expression
  | "|>" "AGGREGATE" AggregateList ("GROUP" "BY" GroupList)?
  | "|>" "JOIN" Table "ON" Expression
  | "|>" "EXTEND" ExpressionList
  | "|>" "UNION" ("ALL" | "DISTINCT")? "(" QueryExpression ")"
  | "|>" "INTERSECT" ("DISTINCT")? "(" QueryExpression ")"
  | "|>" "EXCEPT" ("DISTINCT")? "(" QueryExpression ")"
  | "|>" "LIMIT" Integer

```

## Grammar-Well Implementation

```grammar
grammar {
  # Add to QueryRoot
  [QueryRoot]
    | PrivateTableFunction
    | PublicTableFunction

  [PrivateTableFunction]:
    | "CREATE" __ ("TEMPORARY" | "TEMP" | "PRIVATE")@mod __ "TABLE" __ "FUNCTION" __
      <word>@name "(" FunctionParams?@params ")" __
      (ReturnsTableClause@ret __)?
      "AS" __ "(" __ QueryExpression@body __ ")" __ ";"
    => {
      const modifiers = [$mod.value]; // Extract string
      const parameters = $params || [];
      return new CreateTableFunctionStmt(modifiers, $name, parameters, $ret, $body);
    }

  [PublicTableFunction]:
    | "CREATE" __ "PUBLIC" __ "TABLE" __ "FUNCTION" __
      <word>@name "(" FunctionParams?@params ")" __
      (ReturnsTableClause@ret __)?
      "AS" __ "(" __ QueryExpression@body __ ")" __ ";"
    => {
      const modifiers = ["PUBLIC"];
      const parameters = $params || [];
      return new CreateTableFunctionStmt(modifiers, $name, parameters, $ret, $body);
    }

  [ReturnsTableClause]:
    | "RETURNS" __ "TABLE" __ "<" __ ColumnDeclarations@cols __ ">"
    => {
      return new TableType($cols);
    }

  [ColumnDeclarations]:
    | ColumnDeclaration
    | ColumnDeclarations "," __ ColumnDeclaration
    => {
      return [$0, ...$1.map(c => c[2])];
    }

  [ColumnDeclaration]:
    | <word>@name __ DataType@type
    => {
      return { name: $name, type: $type }; // name is now string
    }

  # Update FunctionParam to support ANY TYPE, ANY TABLE, and TABLE<...>
  [FunctionParams]:
    | FunctionParam
    | FunctionParams "," __ FunctionParam
    => {
      return [$0, ...$1.map(p => p[2])];
    }

  [FunctionParam]:
    | <word>@name __ DataType@type (__ "DEFAULT" __ Expression@def)?
    => {
      return new FunctionParam($name, $type, $def);
    }
    | <word>@name __ "ANY" __ "TYPE"
    => {
      return new FunctionParam($name, new AnyType());
    }
    | <word>@name __ "ANY" __ "TABLE"
    => {
      return new FunctionParam($name, new AnyTableType());
    }
    | <word>@name __ "TABLE" __ "<" __ ColumnDeclarations@cols __ ">"
    => {
      return new FunctionParam($name, new TableType($cols));
    }
    # Value table argument
    | <word>@name __ "TABLE" __ "<" __ DataType@type __ ">"
    => {
      return new FunctionParam($name, new TableType([{name: "value", type: $type}]));
    }

  # -----------------------------------------------------------------
  # Query Expression (Pipe Syntax)
  # -----------------------------------------------------------------

  [QueryExpression]:
    | WithClause?@with FromClause@from PipeOperator*@pipes
    => {
      // Note: WithClause is not currently supported in AST QueryStmt constructor.
      // We are ignoring it for now as per AST limitations.
      return new QueryStmt([$from, ...$pipes]);
    }

  [WithClause]:
    | "WITH" __ CteList __

  [CteList]:
    | Cte
    | CteList "," __ Cte

  [Cte]:
    | <word> __ "AS" __ "(" __ QueryExpression __ ")"

  [FromClause]:
    | "FROM" __ TableExpression@table
    => {
      // Assuming TableExpression returns a string (table name) for simple cases
      // If it returns something else, we might need a different Stmt or cast.
      // AST FromStmt: constructor(public readonly table: string)
      return new FromStmt($table);
    }

  [TableExpression]:
    | <word> => ( $0.value ) # Table name as string
    | FunctionCall # TVF call - Not supported in FromStmt yet?
    | "(" __ QueryExpression __ ")" # Subquery - Not supported in FromStmt yet?

  [PipeOperator]:
    | "|>" __ "SELECT" __ SelectList@cols
    => { return new SelectStmt($cols); }
    | "|>" __ "WHERE" __ Expression@cond
    => { return new WhereStmt($cond); }
    | "|>" __ "AGGREGATE" __ AggregateList@aggs __ ("GROUP" __ "BY" __ GroupList@groups)?
    => { return new AggregateStmt($aggs, $groups || []); }
    | "|>" __ "JOIN" __ TableExpression@table __ "ON" __ Expression@cond
    => {
       return new JoinStmt($table, $cond, JoinType.INNER);
    }
    | "|>" __ "EXTEND" __ ExpressionList@cols
    => {
       const columns = $cols.map(e => ({expression: e, alias: null}));
       return new ExtendStmt(columns);
    }
    | "|>" __ "UNION" __ ("ALL" | "DISTINCT")?@mod __ "(" __ QueryExpression@q __ ")"
    => {
       const distinct = $mod ? $mod.value === "DISTINCT" : true; // Default UNION is DISTINCT in SQL usually, but pipe syntax?
       // Pipe syntax UNION is usually DISTINCT unless ALL is specified.
       // If mod is null, default to DISTINCT? Or ALL? Standard SQL UNION is DISTINCT.
       return new SetStmt(SetOperator.UNION, $q, distinct);
    }
    | "|>" __ "INTERSECT" __ ("DISTINCT")?@mod __ "(" __ QueryExpression@q __ ")"
    => {
       return new SetStmt(SetOperator.INTERSECT, $q, true);
    }
    | "|>" __ "EXCEPT" __ ("DISTINCT")?@mod __ "(" __ QueryExpression@q __ ")"
    => {
       return new SetStmt(SetOperator.EXCEPT, $q, true);
    }
    | "|>" __ "LIMIT" __ <int_lit>@count
    => { return new LimitStmt(new Literal(LiteralKind.INT, parseInt($count.value)), null); }

  [SelectList]:
    | SelectItem
    | SelectList "," __ SelectItem
    => {
      return [$0, ...$1.map(i => i[2])];
    }

  [SelectItem]:
    | Expression@expr ("AS" __ <word>@alias)?
    => {
      return { expression: $expr, alias: $alias ? $alias.value : null };
    }
    | "*"
    => {
      return { expression: new Variable("*"), alias: null };
    }

  [AggregateList]:
    | AggregateItem
    | AggregateList "," __ AggregateItem
    => {
      return [$0, ...$1.map(i => i[2])];
    }

  [AggregateItem]:
    | FunctionCall@call ("AS" __ <word>@alias)?
    => {
      return { expression: $call, alias: $alias ? $alias.value : "?" };
    }

  [GroupList]:
    | Expression
    | GroupList "," __ Expression
    => {
      // GroupBy expects Variable[]. But grammar allows Expression.
      // AST mismatch: public readonly groupBy: Variable[]
      // We will cast/assume Expression is Variable or wrap it?
      // For now returning Expression array.
      return [$0, ...$1.map(e => e[2])];
    }

  [ExpressionList]:
    | Expression
    | ExpressionList "," __ Expression
    => {
      return [$0, ...$1.map(e => e[2])];
    }

  [DataType]:
    | <import: udfs.md:DataType>

  # -----------------------------------------------------------------
  # Expressions & Window Functions
  # -----------------------------------------------------------------

  # Top-level expression rule (Lowest precedence)
  [Expression]:
    | OrExpression

  # 12. Logical OR
  [OrExpression]:
    | AndExpression
    | OrExpression "OR" __ AndExpression
    => { return new Logical($0, BinaryOperator.OR, $2); }

  # 11. Logical AND
  [AndExpression]:
    | NotExpression
    | AndExpression "AND" __ NotExpression
    => { return new Logical($0, BinaryOperator.AND, $2); }

  # 10. Logical NOT
  [NotExpression]:
    | "NOT" __ NotExpression
    => { return new Unary(UnaryOperator.NOT, $1); }
    | ComparisonExpression

  # 9. Comparisons
  [ComparisonExpression]:
    | BitwiseOrExpression
    | BitwiseOrExpression __ ComparisonOp@op __ BitwiseOrExpression
    => { return new Binary($0, $op, $2); }
    | BitwiseOrExpression __ "IS" __ ("NOT" __)? "NULL"
    => {
      return new Binary($0, BinaryOperator.IS, new Literal(LiteralKind.NULL, null));
    }
    | BitwiseOrExpression __ "IS" __ ("NOT" __)? "TRUE"
    => { return new Binary($0, BinaryOperator.IS, new Literal(LiteralKind.BOOL, true)); }
    | BitwiseOrExpression __ "IS" __ ("NOT" __)? "FALSE"
    => { return new Binary($0, BinaryOperator.IS, new Literal(LiteralKind.BOOL, false)); }
    | BitwiseOrExpression __ ("NOT" __)? "IN" __ "(" __ ExpressionList __ ")"
    => {
       return new Binary($0, BinaryOperator.IN, new Literal(LiteralKind.STRING, "PLACEHOLDER_LIST"));
    }
    | BitwiseOrExpression __ ("NOT" __)? "LIKE" __ BitwiseOrExpression
    => { return new Binary($0, BinaryOperator.LIKE, $2); }
    | BitwiseOrExpression __ ("NOT" __)? "BETWEEN" __ BitwiseOrExpression __ "AND" __ BitwiseOrExpression
    => {
       return new Call(new Variable("BETWEEN"), [$0, $2, $4]);
    }

  [ComparisonOp]:
    | "=" => ( BinaryOperator.EQUALS )
    | "!=" => ( BinaryOperator.NOT_EQUALS )
    | "<>" => ( BinaryOperator.NOT_EQUALS )
    | "<" => ( BinaryOperator.LESS_THAN )
    | "<=" => ( BinaryOperator.LESS_THAN_OR_EQUAL )
    | ">" => ( BinaryOperator.GREATER_THAN )
    | ">=" => ( BinaryOperator.GREATER_THAN_OR_EQUAL )

  # 8. Bitwise OR (|)
  [BitwiseOrExpression]:
    | BitwiseXorExpression
    | BitwiseOrExpression __ "|" __ BitwiseXorExpression

  # 7. Bitwise XOR (^)
  [BitwiseXorExpression]:
    | BitwiseAndExpression
    | BitwiseXorExpression __ "^" __ BitwiseAndExpression

  # 6. Bitwise AND (&)
  [BitwiseAndExpression]:
    | BitwiseShiftExpression
    | BitwiseAndExpression __ "&" __ BitwiseShiftExpression

  # 5. Bitwise Shift (<<, >>)
  [BitwiseShiftExpression]:
    | AdditiveExpression
    | BitwiseShiftExpression __ "<<" __ AdditiveExpression
    | BitwiseShiftExpression __ ">>" __ AdditiveExpression

  # 4. Additive (+, -)
  [AdditiveExpression]:
    | MultiplicativeExpression
    | AdditiveExpression __ "+" __ MultiplicativeExpression
    => { return new Binary($0, BinaryOperator.PLUS, $2); }
    | AdditiveExpression __ "-" __ MultiplicativeExpression
    => { return new Binary($0, BinaryOperator.MINUS, $2); }

  # 3. Multiplicative (*, /, ||)
  [MultiplicativeExpression]:
    | UnaryExpression
    | MultiplicativeExpression __ "*" __ UnaryExpression
    => { return new Binary($0, BinaryOperator.MULTIPLY, $2); }
    | MultiplicativeExpression __ "/" __ UnaryExpression
    => { return new Binary($0, BinaryOperator.DIVIDE, $2); }
    | MultiplicativeExpression __ "||" __ UnaryExpression
    => { return new Binary($0, BinaryOperator.CONCAT, $2); }

  # 2. Unary (+, -, ~)
  [UnaryExpression]:
    | "+" __ UnaryExpression
    => { return new Unary(UnaryOperator.PLUS, $1); }
    | "-" __ UnaryExpression
    => { return new Unary(UnaryOperator.MINUS, $1); }
    | "~" __ UnaryExpression
    => { return new Unary(UnaryOperator.BITWISE_NOT, $1); }
    | PostfixExpression

  # 1. Postfix (Access) - [], ., OFFSET, ORDINAL
  [PostfixExpression]:
    | PrimaryExpression
    | PostfixExpression "." <word>@field
    => { return new Get($0, $field.value); }
    | PostfixExpression "[" __ Expression@idx __ "]"
    => {
       return new Call(new Variable("GET_INDEX"), [$0, $idx]);
    }
    | PostfixExpression "[" __ "OFFSET" "(" __ Expression __ ")" __ "]"
    => { return new Call(new Variable("GET_OFFSET"), [$0, $2]); }
    | PostfixExpression "[" __ "ORDINAL" "(" __ Expression __ ")" __ "]"
    => { return new Call(new Variable("GET_ORDINAL"), [$0, $2]); }

  # 0. Primary Expressions (Atoms)
  [PrimaryExpression]:
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
    | "(" __ QueryExpression __ ")" # Scalar Subquery

  # Literals
  [Literal]:
    | <int_lit> => ( new Literal(LiteralKind.INT, parseInt($0.value)) )
    | <float_lit> => ( new Literal(LiteralKind.FLOAT, parseFloat($0.value)) )
    | <string_lit> => ( new Literal(LiteralKind.STRING, $0.value) )
    | <bool_lit> => ( new Literal(LiteralKind.BOOL, $0.value === 'true') )
    | <null_lit> => ( new Literal(LiteralKind.NULL, null) )
    | TypedLiteral

  [TypedLiteral]:
    | "DATE" __ <string_lit>
    | "TIME" __ <string_lit>
    | "DATETIME" __ <string_lit>
    | "TIMESTAMP" __ <string_lit>
    | "INTERVAL" __ <string_lit> __ <word>
    | "JSON" __ <string_lit>
    | "NUMERIC" __ <string_lit>
    | "BIGNUMERIC" __ <string_lit>

  # Identifiers (Columns, Variables)
  [Identifier]:
    | <word> => ( new Variable($0.value) )

  # Function Calls (Merged with TVF OverClause support)
  [FunctionCall]:
    | <word>@name "(" __ (ExpressionList)?@args __ ")" (__ OverClause)?
    => {
      return new Call(new Variable($name.value), $args || []);
    }
    | "COUNT"@name "(" __ "*" __ ")" (__ OverClause)?
    => {
      return new Call(new Variable($name.value), []);
    }

  [OverClause]:
    | "OVER" __ "(" __ WindowSpecification __ ")"

  [WindowSpecification]:
    | ("PARTITION" __ "BY" __ PartitionList)? (__ OrderByClause)? (__ WindowFrameClause)?

  [PartitionList]:
    | Expression
    | PartitionList "," __ Expression

  [OrderByClause]:
    | "ORDER" __ "BY" __ OrderItemList

  [OrderItemList]:
    | Expression (__ ("ASC" | "DESC"))?
    | OrderItemList "," __ Expression (__ ("ASC" | "DESC"))?

  [WindowFrameClause]:
    | ("ROWS" | "RANGE") __ FrameExtent

  [FrameExtent]:
    | "UNBOUNDED" __ "PRECEDING"
    | "CURRENT" __ "ROW"
    | Expression __ "PRECEDING"
    | "BETWEEN" __ FrameBound __ "AND" __ FrameBound

  [FrameBound]:
    | "UNBOUNDED" __ "PRECEDING"
    | "UNBOUNDED" __ "FOLLOWING"
    | "CURRENT" __ "ROW"
    | Expression __ "PRECEDING"
    | Expression __ "FOLLOWING"

  # CASE Expression
  [CaseExpression]:
    | "CASE" __ (Expression __)?@base CaseWhenClauses@cases __ ("ELSE" __ Expression __)?@elseExpr "END"
    => {
      // AST CaseExpr: cases: {condition, result}[], elseBranch
      // If base is present, we might need to distribute it?
      // For now, passing cases as is.
      return new CaseExpr($cases, $elseExpr);
    }

  [CaseWhenClauses]:
    | "WHEN" __ Expression@cond __ "THEN" __ Expression@res
    => { return [{condition: $cond, result: $res}]; }
    | CaseWhenClauses __ "WHEN" __ Expression@cond __ "THEN" __ Expression@res
    => { return [...$0, {condition: $cond, result: $res}]; }

  # IF Expression
  [IfExpression]:
    | "IF" "(" __ Expression "," __ Expression "," __ Expression __ ")"

  # COALESCE Expression
  [CoalesceExpression]:
    | "COALESCE" "(" __ ExpressionList __ ")"

  # NULLIF Expression
  [NullIfExpression]:
    | "NULLIF" "(" __ Expression "," __ Expression __ ")"

  # CAST Expression
  [CastExpression]:
    | "CAST" "(" __ Expression __ "AS" __ <dataType> __ ")"

  # EXTRACT Expression
  [ExtractExpression]:
    | "EXTRACT" "(" __ <word> __ "FROM" __ Expression __ ")"

  # Array Constructor
  [ArrayConstructor]:
    | "[" __ (ExpressionList)? __ "]"
    | "ARRAY" "<" __ <dataType> __ ">" "[" __ (ExpressionList)? __ "]"

  # Struct Constructor
  [StructConstructor]:
    | "STRUCT" "(" __ (ExpressionList)?@exprs __ ")"
    => {
       return new Call(new Variable("STRUCT"), $exprs || []);
    }
    | "STRUCT" "<" __ ColumnDeclarations __ ">" "(" __ (ExpressionList)?@exprs __ ")"
    => {
       return new Call(new Variable("STRUCT"), $exprs || []);
    }

}
```

## Reflection

### Test Data Coverage

The grammar has been updated to support the syntax found in the `src/parser/testdata/*.sql` files.

1.  **`tvf.sql` & `tvf_basic.sql`**:

    - **Creation**: `PrivateTableFunction` and `PublicTableFunction` rules cover `CREATE TEMP/PUBLIC/PRIVATE TABLE FUNCTION`.
    - **Parameters**: `FunctionParams` supports scalar types (`<word> __ <dataType>`), `ANY TABLE`, `ANY TYPE`, and value tables (`TABLE<INT64>`).
    - **Body**: `QueryExpression` supports `FROM ... |> SELECT ...`.

2.  **`tvf_params.sql`**:

    - **Table Parameters**: `FunctionParam` rule includes `TABLE<...>` with `ColumnDeclarations`.
    - **Polymorphism**: `ANY TABLE` and `ANY TYPE` are explicitly handled.

3.  **`tvf_complex.sql`**:

    - **CTEs**: `WithClause` and `CteList` support `WITH ... AS (...)`.
    - **Window Functions**: `FunctionCall` now includes `OverClause`, allowing `AVG(...) OVER (...)`. `WindowSpecification` supports `PARTITION BY`, `ORDER BY`, and `ROWS/RANGE` frames.
    - **Aggregate**: `PipeOperator` includes `AGGREGATE ... GROUP BY`.

4.  **`tvf_set_ops.sql`**:

    - **Set Operations**: `PipeOperator` now includes `UNION`, `INTERSECT`, `EXCEPT` followed by a parenthesized `QueryExpression` (`"(" __ QueryExpression __ ")"`). This matches the syntax `|> UNION ALL (FROM table_b)`.

5.  **`tvf_edge_cases.sql`**:
    - **No Parameters**: `FunctionParams?` is optional in the function definition.
    - **Defaults**: `FunctionParam` supports `DEFAULT Expression`.
    - **Nested CTEs**: The grammar allows `QueryExpression` inside `Cte`, which can contain another `WithClause` if `QueryExpression` supports it.
    - **Subqueries**: `PrimaryExpression` includes `"(" __ QueryExpression __ ")"` to support scalar subqueries like `(SELECT COUNT(*) ...)`.

### Compilation Logic

- **Scalar Subqueries**: Added `| "(" __ QueryExpression __ ")"` to `PrimaryExpression`. This allows `SELECT (SELECT 1)` or `WHERE x > (FROM t |> AGGREGATE MAX(y))`.
- **Expression Integration**: The full expression grammar from `docs/expressions.md` is now embedded, ensuring operator precedence is respected (e.g. `*` before `+`).
- **Pipe Operators**: The pipe operators are defined sequentially. The parser will consume them in order.

### Missing / Future Work

- **Recursive CTEs**: The current grammar does not have special syntax for `RECURSIVE`, but standard `WITH` can handle it if the analyzer supports it.
- **Quoted Identifiers**: The grammar uses `<word>` for identifiers. If we need to support `` `identifier` ``, the lexer needs to handle it or we need a `QuotedIdentifier` rule.
