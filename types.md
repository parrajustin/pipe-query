### Supported Data Types

The library will support a core set of data types that are common in JSON and JavaScript environments.

#### Array Type
- **Description:** An ordered list of zero or more elements of non-array values.
- **SQL Type Name:** `ARRAY`
- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT [1, 2, 3] as numbers
  const result = { numbers: [1, 2, 3] };
  ```

#### Boolean Type
- **Description:** A value that can be either `TRUE` or `FALSE`.
- **SQL Type Name:** `BOOL` (alias: `BOOLEAN`)
- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT true as is_active
  const result = { is_active: true };
  ```

#### Bytes Type
- **Description:** Variable-length binary data.
- **SQL Type Name:** `BYTES`
- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT b"hello" as bytes_data
  const result = { bytes_data: Buffer.from("hello") };
  ```

#### Date Type
- **Description:** A Gregorian calendar date, independent of time zone.
- **SQL Type Name:** `DATE`
- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT DATE '2023-12-25' as christmas_date
  const result = { christmas_date: new Date('2023-12-25T00:00:00Z') }; // Represented as a Date object at UTC midnight
  ```

#### Datetime Type
- **Description:** A Gregorian date and a time, as they might be displayed on a watch, independent of time zone.
- **SQL Type Name:** `DATETIME`
- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT DATETIME '2023-12-25 10:30:00' as some_datetime
  const result = { some_datetime: new Date('2023-12-25T10:30:00') };
  ```

#### Geography Type
- **Description:** A collection of points, linestrings, and polygons, which is represented as a point set, or a subset of the surface of the Earth.
- **SQL Type Name:** `GEOGRAPHY`
- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT ST_GEOGPOINT(10, 20) as location
  const result = { location: { type: 'Point', coordinates: [10, 20] } }; // Represented as a GeoJSON object
  ```

#### Interval Type
- **Description:** A duration of time, without referring to any specific point in time.
- **SQL Type Name:** `INTERVAL`
- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT INTERVAL 1 HOUR as one_hour
  const result = { one_hour: { hours: 1 } }; // Represented as a duration object
  ```

#### JSON Type
- **Description:** Represents JSON, a lightweight data-interchange format.
- **SQL Type Name:** `JSON`
- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT JSON '{"a": 1}' as json_data
  const result = { json_data: { a: 1 } };
  ```

#### Numeric Types
- **Description:** A numeric value. Several types are supported.
  - **INT64:** A 64-bit integer. (Aliases: `INT`, `SMALLINT`, `INTEGER`, `BIGINT`, `TINYINT`, `BYTEINT`)
  - **NUMERIC:** A decimal value with a precision of 38 digits. (Alias: `DECIMAL`)
  - **BIGNUMERIC:** A decimal value with a precision of 76.76 digits. (Alias: `BIGDECIMAL`)
  - **FLOAT64:** An approximate double precision numeric value.
- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT 123 as int_val, 123.45 as numeric_val, 1.23e6 as float_val
  const result = { int_val: 123, numeric_val: 123.45, float_val: 1230000 };
  ```

#### Range Type
- **Description:** Contiguous range between two dates, datetimes, or timestamps.
- **SQL Type Name:** `RANGE`
- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT RANGE<DATE> '[2023-01-01, 2023-01-31)' as january
  const result = { january: { start: new Date('2023-01-01T00:00:00Z'), end: new Date('2023-01-31T00:00:00Z') } };
  ```

#### String Type
- **Description:** Variable-length character data.
- **SQL Type Name:** `STRING`
- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT 'hello' as greeting
  const result = { greeting: 'hello' };
  ```

#### Struct Type
- **Description:** Container of ordered fields.
- **SQL Type Name:** `STRUCT`
- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT STRUCT(1 AS a, 'hello' AS b) as my_struct
  const result = { my_struct: { a: 1, b: 'hello' } };
  ```

#### Time Type
- **Description:** A time of day, as might be displayed on a clock, independent of a specific date and time zone.
- **SQL Type Name:** `TIME`
- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT TIME '10:30:00' as some_time
  const result = { some_time: '10:30:00' }; // Represented as a string
  ```

#### Timestamp Type
- **Description:** A timestamp value represents an absolute point in time, independent of any time zone or convention such as Daylight Saving Time (DST).
- **SQL Type Name:** `TIMESTAMP`
- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT TIMESTAMP '2023-12-25 10:30:00Z' as some_timestamp
  const result = { some_timestamp: new Date('2023-12-25T10:30:00Z') };
  ```