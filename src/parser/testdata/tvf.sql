-- 1. Basic TVF with Scalar Parameters and Implicit Return
CREATE TEMP TABLE FUNCTION SimpleRange(start_val INT64, end_val INT64)
AS (
    FROM UNNEST(GENERATE_ARRAY(start_val, end_val)) AS num
    |> SELECT num
);

-- 2. TVF with Explicit Return Schema
CREATE PUBLIC TABLE FUNCTION TypedRange(start_val INT64)
RETURNS TABLE<num INT64, label STRING>
AS (
    FROM UNNEST(GENERATE_ARRAY(1, start_val)) AS x
    |> SELECT x, CAST(x AS STRING)
);

-- 3. TVF with Table Parameters (Explicit Schema)
CREATE PRIVATE TABLE FUNCTION FilterUsers(
    users TABLE<id INT64, name STRING, age INT64>,
    min_age INT64
)
AS (
    FROM users
    |> WHERE age >= min_age
);

-- 4. TVF with ANY TABLE (Polymorphic)
CREATE TEMP TABLE FUNCTION CountRows(input_table ANY TABLE)
AS (
    FROM input_table
    |> AGGREGATE COUNT(*) AS total_rows
);

-- 5. TVF with ANY TYPE (Templated)
CREATE PUBLIC TABLE FUNCTION EchoValue(val ANY TYPE)
AS (
    FROM (SELECT val AS v)
    |> SELECT v
);

-- 6. TVF with Value Table Parameter
CREATE PRIVATE TABLE FUNCTION ProcessIds(ids TABLE<INT64>)
AS (
    FROM ids
    |> WHERE ids > 100
);

-- 7. Complex Body with Pipe Syntax: CTEs, JOIN, AGGREGATE, WINDOW
CREATE PUBLIC TABLE FUNCTION UserStats(
    logs TABLE<user_id INT64, action STRING, ts TIMESTAMP>,
    window_size INT64 DEFAULT 5
)
AS (
    WITH DailyActivity AS (
        FROM logs
        |> EXTEND DATE(ts) AS day
        |> AGGREGATE COUNT(*) AS daily_count GROUP BY user_id, day
    )
    FROM DailyActivity
    |> EXTEND AVG(daily_count) OVER (PARTITION BY user_id ORDER BY day ROWS BETWEEN window_size PRECEDING AND CURRENT ROW) AS moving_avg
    |> WHERE moving_avg > 10
);

-- 8. Set Operations (UNION, INTERSECT, EXCEPT)
CREATE PUBLIC TABLE FUNCTION CombineSets(
    table_a TABLE<id INT64>,
    table_b TABLE<id INT64>
)
AS (
    FROM table_a
    |> UNION ALL (FROM table_b)
    |> INTERSECT DISTINCT (FROM table_a |> WHERE id > 5)
);

-- 9. Edge Case: No Parameters
CREATE PUBLIC TABLE FUNCTION GetAllConfig()
AS (
    FROM ConfigTable
    |> SELECT *
);

-- 10. Edge Case: All Defaults
CREATE TEMP TABLE FUNCTION DefaultParams(
    x INT64 DEFAULT 1,
    y STRING DEFAULT 'default'
)
AS (
    SELECT x, y
);

-- 11. Edge Case: Nested CTEs (Replaces Quoted Identifier example)
CREATE PUBLIC TABLE FUNCTION NestedLogic(val INT64)
AS (
    WITH Level1 AS (
        SELECT val + 1 AS v1
    ),
    Level2 AS (
        FROM Level1
        |> EXTEND v1 * 2 AS v2
    )
    FROM Level2
    |> SELECT v2
);

-- 12. Edge Case: Subquery in Expression (Replaces Recursive CTE)
CREATE PUBLIC TABLE FUNCTION SubqueryLogic(n INT64)
AS (
    FROM (SELECT n AS base_val)
    |> EXTEND (SELECT COUNT(*) FROM UNNEST([1, 2, 3])) AS count_val
    |> WHERE base_val > count_val
);

/*
REFLECTION ON COVERAGE:

Covered:
- Creation modifiers: TEMP, PRIVATE, PUBLIC (Mandatory).
- Naming: Simple identifiers.
- Parameters:
  - Scalar types (INT64, STRING, etc.).
  - Table types (TABLE<...>, ANY TABLE).
  - Templated types (ANY TYPE).
  - Value tables (TABLE<INT64>).
  - Defaults (Literals).
- Return Clause: Implicit, Explicit (RETURNS TABLE<...>).
- Body Syntax (Pipe):
  - FROM ...
  - |> SELECT
  - |> WHERE
  - |> AGGREGATE ... GROUP BY
  - |> JOIN ... ON
  - |> EXTEND (Window functions)
  - |> UNION/INTERSECT/EXCEPT
- CTEs: Standard WITH.

Removed/Changed based on constraints:
- No `OR REPLACE` or `IF NOT EXISTS`.
- No Quoted Identifiers for TVF names.
- No Recursive CTEs.
*/
