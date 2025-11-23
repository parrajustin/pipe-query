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
