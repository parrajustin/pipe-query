/*
 * Test File: array_functions.sql
 * Purpose: Validate parsing of Array and Struct operations within UDFs.
 * Coverage:
 * - Array constructors (typed and untyped).
 * - Array access using OFFSET and ORDINAL.
 * - Struct constructors and field access.
 * - Nested Arrays and Structs.
 */

-- 1. Array Constructor and Length
CREATE TEMP FUNCTION GetArrayLength(arr ARRAY<INT64>)
RETURNS INT64
AS (
  ARRAY_LENGTH(arr)
);

-- 2. Array Access with OFFSET/ORDINAL
CREATE TEMP FUNCTION GetFirstAndThird(arr ARRAY<STRING>)
RETURNS STRING
AS (
  arr[OFFSET(0)] || ' - ' || arr[ORDINAL(3)]
);

-- 3. Structs and Arrays
CREATE FUNCTION CreateUser(id INT64, name STRING)
RETURNS STRUCT<id INT64, name STRING, tags ARRAY<STRING>>
AS (
  STRUCT(id, name, ARRAY['new', 'user'])
);

-- 4. Complex Nested Access
CREATE FUNCTION GetTag(user STRUCT<id INT64, tags ARRAY<STRING>>, index INT64)
RETURNS STRING
AS (
  user.tags[SAFE_OFFSET(index)]
);

-- 5. Array of Structs Constructor
CREATE TEMP FUNCTION MockUsers()
RETURNS ARRAY<STRUCT<id INT64>>
AS (
  [STRUCT(1), STRUCT(2), STRUCT(3)]
);
