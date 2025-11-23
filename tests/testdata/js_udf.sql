/*
 * Test File: js_udf.sql
 * Purpose: Validate parsing of JavaScript User Defined Functions.
 * Coverage:
 * - Basic JS UDF with primitive types.
 * - JS UDF with complex types (ARRAY, STRUCT).
 * - JS UDF using different quoting styles for the body (r"", "", '', etc.).
 * - JS UDF with OPTIONS clause.
 * - Edge cases: Empty body, special characters in strings, determinism specifiers.
 */

-- 1. Basic JS UDF
CREATE TEMP FUNCTION Multiply(x FLOAT64, y FLOAT64)
RETURNS FLOAT64
LANGUAGE js
AS r"""
  return x * y;
""";

-- 2. JS UDF with Array and Struct
CREATE OR REPLACE FUNCTION ProcessUsers(users ARRAY<STRUCT<name STRING, age INT64>>)
RETURNS ARRAY<STRING>
LANGUAGE js
OPTIONS (library=["gs://my-bucket/lib.js"])
AS r"""
  return users.filter(u => u.age > 18).map(u => u.name);
""";

-- 3. JS UDF with Determinism and different quoting
CREATE FUNCTION ParseJson(input STRING)
RETURNS JSON
DETERMINISTIC
LANGUAGE js
AS r"""return JSON.parse(input);""";

-- 4. Edge Case: Empty body (syntactically valid in some contexts, though runtime error)
CREATE TEMP FUNCTION DoNothing()
RETURNS INT64
LANGUAGE js
AS r"""""";

-- 5. Edge Case: Complex quoting with escapes
CREATE FUNCTION ComplexString()
RETURNS STRING
LANGUAGE js
AS r"""
  var s = "Hello 'World'";
  return s + "\nNew Line";
""";
