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
