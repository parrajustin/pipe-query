/*
 * Test File: udf_dependency.sql
 * Purpose: Validate parsing of SQL UDFs that depend on other functions.
 * Coverage:
 * - Simple SQL UDF.
 * - UDF calling another user-defined function.
 * - UDF calling built-in functions.
 * - Deeply nested function calls.
 */

-- 1. Helper Function
CREATE TEMP FUNCTION Square(x INT64)
RETURNS INT64
AS (
  x * x
);

-- 2. Dependent Function
CREATE TEMP FUNCTION SumSquares(a INT64, b INT64)
RETURNS INT64
AS (
  Square(a) + Square(b)
);

-- 3. UDF calling built-in and other UDF
CREATE FUNCTION CalculateHypotenuse(a INT64, b INT64)
RETURNS FLOAT64
AS (
  SQRT(CAST(SumSquares(a, b) AS FLOAT64))
);

-- 4. Nested calls and expressions
CREATE TEMP FUNCTION ComplexCalc(x INT64)
RETURNS INT64
AS (
  IF(x > 0, Square(x) + 1, Square(ABS(x)) * 2)
);
