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

-- 11. Edge Case: Nested CTEs
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

-- 12. Edge Case: Subquery in Expression
CREATE PUBLIC TABLE FUNCTION SubqueryLogic(n INT64)
AS (
    FROM (SELECT n AS base_val)
    |> EXTEND (SELECT COUNT(*) FROM UNNEST([1, 2, 3])) AS count_val
    |> WHERE base_val > count_val
);
