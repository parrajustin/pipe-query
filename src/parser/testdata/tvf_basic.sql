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
