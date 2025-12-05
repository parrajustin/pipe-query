-- Define a temporary UDF to parse a JSON string and extract the HTTP code.
CREATE TEMP FUNCTION ParseHttpCode(json_payload STRING) RETURNS INT64 AS (
  SAFE_CAST(JSON_VALUE(json_payload, '$.http_response_code') AS INT64)
);

-- Define a temporary UDF to classify the HTTP code into a readable category.
CREATE TEMP FUNCTION ClassifyErrorType(http_code INT64) RETURNS STRING AS ((
  CASE
    WHEN http_code IS NULL THEN 'Unparsed'
    WHEN http_code >= 200 AND http_code < 300 THEN 'OK'
    WHEN http_code >= 400 AND http_code < 500 THEN 'Client Error'
    WHEN http_code >= 500 AND http_code < 600 THEN 'Server Error'
    ELSE 'Other'
  END
));

-- Define a temporary TVF to deduplicate events.
-- This version is refactored to use pipe syntax *inside* its definition.
CREATE TEMP TABLE FUNCTION DeduplicateByUser(
  events_table TABLE, 
  time_window_seconds INT64
) AS (
  FROM events_table
  
  -- Use EXTEND to add a discrete time bucket for partitioning.
  |> EXTEND
    FLOOR(UNIX_SECONDS(event_timestamp) / time_window_seconds) AS time_bucket,
    
  -- Use WINDOW to calculate the row number (rn) for each user/time_bucket.
  -- This is the pipe equivalent of the `QUALIFY ROW_NUMBER() OVER (...)`
    ROW_NUMBER() OVER (
      PARTITION BY user_id, time_bucket 
      ORDER BY event_timestamp ASC
    ) AS rn
    
  -- Use WHERE to filter, keeping only the first event (rn = 1) in each partition.
  |> WHERE rn = 1
  
  -- Use SELECT * to return all original columns from events_table,
  -- effectively discarding the temporary 'time_bucket' and 'rn' columns.
  |> SELECT *
);

-- Use a WITH clause to create sample data for this example.
WITH RawEvents AS (
  FROM UNNEST([
    STRUCT(1 AS event_id, 'user_A' AS user_id, CURRENT_TIMESTAMP() AS event_timestamp, '{"http_response_code": "503"}' AS raw_json_payload),
    STRUCT(2, 'user_A', TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL 10 SECOND), '{"http_response_code": "503"}'),
    STRUCT(3, 'user_B', CURRENT_TIMESTAMP(), '{"http_response_code": "404"}'),
    STRUCT(4, 'user_C', CURRENT_TIMESTAMP(), '{"http_response_code": "200"}'),
    STRUCT(5, 'user_B', TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL 70 SECOND), '{"http_response_code": "404"}'),
    STRUCT(6, 'user_A', TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL 80 SECOND), '{"http_response_code": "503"}'),
    STRUCT(7, 'user_D', CURRENT_TIMESTAMP(), '{"http_response_code": "401"}'),
    STRUCT(8, 'user_D', CURRENT_TIMESTAMP(), '{"http_response_code": "401"}'),
    STRUCT(9, 'user_E', CURRENT_TIMESTAMP(), '{"http_response_code": "500"}'),
    STRUCT(10, 'user_E', CURRENT_TIMESTAMP(), '{"other_key": "value"}')
  ])
)

-- This is the main query. Its structure is unchanged, as the TVF's
-- public signature (its inputs and outputs) remains the same.
FROM RawEvents

-- Use the first UDF to parse the JSON and add the `http_code` column.
|> EXTEND
  ParseHttpCode(raw_json_payload) AS http_code

-- Use the second UDF to classify the code and add the `error_category` column.
|> EXTEND
  ClassifyErrorType(http_code) AS error_category

-- Use the CALL operator to invoke the TVF (which now uses pipe syntax internally).
|> CALL DeduplicateByUser(60)

-- Filter out successful events.
|> WHERE error_category != 'OK'

-- Use AGGREGATE to count errors by category.
|> AGGREGATE
  COUNT(event_id) AS total_errors,
  COUNT(DISTINCT user_id) AS impacted_users
  GROUP BY error_category

-- Use ORDER BY to find the most common errors.
|> ORDER BY total_errors DESC

-- Use LIMIT to get just the top 10.
|> LIMIT 10;