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

## Pseudo-Grammar

```ebnf
CreateTVFStatement ::=
    "CREATE" ("OR" "REPLACE")? ("TEMPORARY" | "TEMP")? "TABLE" "FUNCTION" ("IF" "NOT" "EXISTS")?
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
  | "|>" "UNION" ("ALL" | "DISTINCT")? QueryExpression
  | "|>" "INTERSECT" ("DISTINCT")? QueryExpression
  | "|>" "EXCEPT" ("DISTINCT")? QueryExpression
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
    | "CREATE" __ ("TEMPORARY" | "TEMP" | "PRIVATE") __ "TABLE" __ "FUNCTION" __
      <word> "(" FunctionParams? ")" __
      (ReturnsTableClause __)?
      "AS" __ "(" __ QueryExpression __ ")" __ ";"

  [PublicTableFunction]:
    | "CREATE" __ "PUBLIC" __ "TABLE" __ "FUNCTION" __
      <word> "(" FunctionParams? ")" __
      (ReturnsTableClause __)?
      "AS" __ "(" __ QueryExpression __ ")" __ ";"

  [ReturnsTableClause]:
    | "RETURNS" __ "TABLE" __ "<" __ ColumnDeclarations __ ">"

  [ColumnDeclarations]:
    | ColumnDeclaration
    | ColumnDeclarations "," __ ColumnDeclaration

  [ColumnDeclaration]:
    | <word> __ <dataType>

  # Update FunctionParam to support ANY TYPE, ANY TABLE, and TABLE<...>
  [FunctionParam]:
    | <word> __ <dataType>
    | <word> __ "ANY" __ "TYPE"
    | <word> __ "ANY" __ "TABLE"
    | <word> __ "TABLE" __ "<" __ ColumnDeclarations __ ">"
    # Value table argument
    | <word> __ "TABLE" __ "<" __ <dataType> __ ">"

  # -----------------------------------------------------------------
  # Query Expression (Pipe Syntax)
  # -----------------------------------------------------------------

  [QueryExpression]:
    | WithClause? FromClause PipeOperator*

  [WithClause]:
    | "WITH" __ CteList __

  [CteList]:
    | Cte
    | CteList "," __ Cte

  [Cte]:
    | <word> __ "AS" __ "(" __ QueryExpression __ ")"

  [FromClause]:
    | "FROM" __ TableExpression

  [TableExpression]:
    | <word> # Table name
    | FunctionCall # TVF call
    | "(" __ QueryExpression __ ")" # Subquery

  [PipeOperator]:
    | "|>" __ "SELECT" __ SelectList
    | "|>" __ "WHERE" __ Expression
    | "|>" __ "AGGREGATE" __ AggregateList __ ("GROUP" __ "BY" __ GroupList)?
    | "|>" __ "JOIN" __ TableExpression __ "ON" __ Expression
    | "|>" __ "EXTEND" __ ExpressionList
    | "|>" __ "UNION" __ ("ALL" | "DISTINCT")? __ QueryExpression
    | "|>" __ "INTERSECT" __ ("DISTINCT")? __ QueryExpression
    | "|>" __ "EXCEPT" __ ("DISTINCT")? __ QueryExpression
    | "|>" __ "LIMIT" __ <int_lit>

  [SelectList]:
    | SelectItem
    | SelectList "," __ SelectItem

  [SelectItem]:
    | Expression ("AS" __ <word>)?
    | "*"

  [AggregateList]:
    | AggregateItem
    | AggregateList "," __ AggregateItem

  [AggregateItem]:
    | FunctionCall ("AS" __ <word>)?

  [GroupList]:
    | Expression
    | GroupList "," __ Expression

  [ExpressionList]:
    | Expression
    | ExpressionList "," __ Expression

  # -----------------------------------------------------------------
  # Expressions & Window Functions
  # -----------------------------------------------------------------

  # Extending standard FunctionCall to support OVER clause
  [FunctionCall]:
    | <word> "(" __ ArgumentList? __ ")" (__ OverClause)?

  [ArgumentList]:
    | Expression
    | ArgumentList "," __ Expression

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

  # Placeholder for base Expression if not imported
  [Expression]:
    | <word>
    | <int_lit>
    | <string_lit>
    | FunctionCall
    | Expression __ <operator> __ Expression
    | "(" __ Expression __ ")"

}
```

## Scratch Space (Research Notes)

### Window Functions

- Syntax: `function_name(...) OVER window_name_or_spec`
- Window Spec: `PARTITION BY ... ORDER BY ... ROWS/RANGE ...`
- Usage in TVF: Can be used freely in the `SELECT` list of the TVF body.
- Parameterization: Window size (e.g., `ROWS BETWEEN N PRECEDING`) can be parameterized if `N` is an integer argument to the TVF.

### Aggregate Functions

- Syntax: `func(...) [HAVING MIN/MAX ...] [ORDER BY ...] [LIMIT ...]`
- Usage in TVF: Can be used with `GROUP BY` in the TVF body.
- `HAVING MAX/MIN`: Special clause to restrict aggregation to rows with max/min value in a column.

### Table Parameters

- `TABLE<col type, ...>`: Explicit schema.
- `ANY TABLE`: Polymorphic.
- Value Tables: `TABLE<type>` (single unnamed column).
- Parameter Names: Should not collide with column names of input tables to avoid ambiguity.

### Table Function Calls

- Called in `FROM` clause: `FROM MyTVF(arg1, arg2)`
- Can be joined: `FROM Table1 JOIN MyTVF(Table1.col) ON ...` (Correlated join if supported).

### Links

- [ZetaSQL Table Functions](https://github.com/google/zetasql/blob/master/docs/table-functions.md)
- [BigQuery Table Functions](https://cloud.google.com/bigquery/docs/reference/standard-sql/table-functions)
- [ZetaSQL Window Functions](https://github.com/google/zetasql/blob/master/docs/window-function-calls.md)
- [ZetaSQL Aggregate Functions](https://github.com/google/zetasql/blob/master/docs/aggregate-function-calls.md)
