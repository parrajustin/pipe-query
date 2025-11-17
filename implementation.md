# Pipe Query Syntax TypeScript Library - Implementation Plan

## 1. Introduction

This document outlines the plan to create a TypeScript library that implements a query processor for a pipe-based SQL-like syntax. This library will be able to process in-memory data, such as JSON objects and arrays, allowing for powerful and expressive data manipulation in a TypeScript environment.

The pipe query syntax, as detailed in Google's documentation, offers a more linear and readable way to construct complex queries. This project aims to bring that simplicity and power to a client-side or server-side TypeScript application.

## 2. Key Features

- **Pipe-based Querying:** A natural, left-to-right flow for data transformation.
- **In-Memory Data Processing:** Operate directly on JSON and array data without needing a database.
- **Extensible Operator Support:** A modular design that allows for the addition of new operators.
- **Typed API:** Leveraging TypeScript for a better developer experience.

## 3. Implementation Plan

The project will be broken down into the following phases:

### Phase 1: Project Setup

1.  **Initialize a new TypeScript project.**
2.  **Set up the development environment:**
    -   `typescript`: The core compiler.
    -   `ts-node`: For running TypeScript files directly.
    -   `jest`: For unit testing.
    -   `eslint`: For code linting and quality.
3.  **Define the project structure:**
    ```
    /src
        /parser
            lexer.ts
            parser.ts
            ast.ts
        /processor
            interpreter.ts
            operators.ts
        index.ts
    /tests
    ```

### Phase 2: The Parser

The parser will be responsible for taking a raw query string and turning it into a structured representation (an Abstract Syntax Tree, or AST).

1.  **Lexer (`lexer.ts`):**
    -   Implement a tokenizer that scans the input string and converts it into a sequence of tokens (e.g., `KEYWORD`, `IDENTIFIER`, `OPERATOR`, `STRING`, `NUMBER`).
2.  **AST (`ast.ts`):**
    -   Define the nodes of the Abstract Syntax Tree. Each node will represent a part of the query, such as a `FromClause`, a `PipeOperation`, or an `Expression`.
3.  **Parser (`parser.ts`):**
    -   Takes the token stream from the lexer.
    -   Builds the AST based on the grammar of the pipe query syntax.
    -   The output will be a tree of operations that can be executed by the processor.

### Phase 3: The Query Processor

The processor (or interpreter) will take the AST and the input data and produce the final result.

1.  **Interpreter (`interpreter.ts`):**
    -   A function that walks the AST.
    -   It will start with the initial dataset (from the `FROM` clause).
    -   For each `|>` operation in the AST, it will apply the corresponding data transformation.
2.  **Operators (`operators.ts`):**
    -   Implement the logic for each supported pipe operator. Each operator will be a function that takes the current state of the data and returns the transformed data.

### Pipe Operators

This section provides a detailed breakdown of each pipe operator's functionality, complete with TypeScript-like pseudo-code examples, to give a clear picture of how the library will work.

#### `FROM`

The `FROM` clause is the starting point of any query, specifying the initial dataset. The data can be provided in two ways: either from a static JSON object (a "data context") or dynamically through a "data provider."

-   **Syntax:** `FROM <data_source>`
-   **Functionality:** Initializes the data pipeline with the specified dataset, sourced from either a static object or a dynamic provider.

##### 1. From a Static Data Context

This approach is suitable for when all the data is already present in memory. The `FROM` clause references a key in a provided JSON object that holds the data arrays.

-   **Input:** A JSON object containing named arrays of data.
-   **Output:** The initial array of data to be processed.

**Pseudo-code Example:**

```typescript
// The main data object provided to the query processor
const dataContext = {
  users: [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 },
  ],
  orders: [
    { orderId: 101, userId: 1, amount: 150 },
    { orderId: 102, userId: 2, amount: 200 },
  ],
};

// The query string
const query = `FROM users`;

// The processor would extract the 'users' array from the dataContext
const initialData = dataContext['users'];
```

-   **Implementation Details:**
    -   The interpreter will use the identifier from the `FROM` clause to look up the data array in the provided data context object.

##### 2. From a Data Provider

A data provider is a function that retrieves data on demand. This is useful for fetching data from external sources, like a database or an API, or for handling large datasets that can be streamed.

-   **Input:** A `DataProvider` function that takes a data source name and returns the data, either all at once or as a stream.
-   **Output:** The initial stream or array of data to be processed.

**`DataProvider` Interface:**

```typescript
interface DataProvider {
  (dataSourceName: string): Promise<any[]> | AsyncIterable<any>;
}
```

**Pseudo-code Example (Batch Data):**

This example shows a data provider that fetches a full dataset from a mock API.

```typescript
// The data provider fetches data and returns it as a promise
const myDataProvider: DataProvider = async (tableName) => {
  if (tableName === 'products') {
    // In a real scenario, this would be a fetch call to an API
    return Promise.resolve([
      { id: 10, name: 'Laptop', price: 1200 },
      { id: 20, name: 'Mouse', price: 50 },
    ]);
  }
  throw new Error(`Unknown table: ${tableName}`);
};

// The query string
const query = `FROM products`;

// The processor would invoke the data provider with 'products'
const initialData = await myDataProvider('products');
```

**Pseudo-code Example (Streaming Data):**

This example demonstrates how a data provider can stream data, which is ideal for large datasets.

```typescript
import { Readable } from 'stream';

// The data provider returns an async iterable (e.g., a Node.js stream)
const myStreamingProvider: DataProvider = (tableName) => {
  if (tableName === 'logs') {
    const logStream = new Readable({ objectMode: true });
    logStream.push({ level: 'info', message: 'User logged in' });
    logStream.push({ level: 'error', message: 'Database connection failed' });
    logStream.push(null); // End of stream
    return logStream;
  }
  throw new Error(`Unknown table: ${tableName}`);
};

// The query string
const query = `FROM logs`;

// The processor would handle the stream from the provider
const dataStream = myStreamingProvider('logs');

// The query processor would need to be designed to handle streams,
// processing each chunk of data as it arrives.
```

-   **Implementation Details:**
    -   The `FROM` clause will be the first part of the AST.
    -   The interpreter will first check if a `DataProvider` is available.
    -   If a provider exists, it will be called with the data source name from the `FROM` clause.
    -   The interpreter must be able to handle both a `Promise` (for batch data) and an `AsyncIterable` (for streaming data).
    -   If no data provider is given, it will fall back to looking up the data source name in the static data context object.

#### `SELECT`

The `SELECT` operator is used to specify which columns to include in the output, and to rename them.

-   **Syntax:** `|> SELECT <column1> [AS <alias1>], <column2> [AS <alias2>], ...`
-   **Functionality:** Transforms each row in the input data to a new object with only the specified columns.
-   **Input:** An array of JSON objects.
-   **Output:** A new array of JSON objects with the selected and aliased columns.

**Pseudo-code Example:**

```typescript
const inputData = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
];

// Query: |> SELECT name AS userName, age
const result = inputData.map(row => ({
  userName: row.name,
  age: row.age,
}));

// `result` would be:
// [
//   { userName: 'Alice', age: 30 },
//   { userName: 'Bob', age: 25 },
// ]
```

-   **Implementation Details:**
    -   The `SELECT` operator will iterate through each object in the input array.
    -   For each object, it will create a new object, picking out only the properties specified in the `SELECT` clause.
    -   If an `AS` alias is provided, the new property name will be the alias.

#### `WHERE`

The `WHERE` operator filters the data based on a boolean expression.

-   **Syntax:** `|> WHERE <boolean_expression>`
-   **Functionality:** Returns a subset of the rows from the input data that satisfy the condition.
-   **Input:** An array of JSON objects.
-   **Output:** A new array of JSON objects that pass the filter condition.

**Pseudo-code Example:**

```typescript
const inputData = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 35 },
];

// Query: |> WHERE age > 28
const result = inputData.filter(row => row.age > 28);

// `result` would be:
// [
//   { name: 'Alice', age: 30 },
//   { name: 'Charlie', age: 35 },
// ]
```

-   **Implementation Details:**
    -   The `WHERE` operator will evaluate the boolean expression for each row.
    -   The expression parser will need to handle common operators (`==`, `!=`, `>`, `<`, `>=`, `<=`, `AND`, `OR`, `IN`).
    -   It will return a new array containing only the rows for which the expression evaluates to `true`.

#### `EXTEND`

The `EXTEND` operator adds new columns to the dataset.

-   **Syntax:** `|> EXTEND <expression> AS <new_column_name>`
-   **Functionality:** Adds a new computed column to each row.
-   **Input:** An array of JSON objects.
-   **Output:** A new array of JSON objects with the new column added to each object.

**Pseudo-code Example:**

```typescript
const inputData = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
];

// Query: |> EXTEND age * 2 AS doubleAge
const result = inputData.map(row => ({
  ...row,
  doubleAge: row.age * 2,
}));

// `result` would be:
// [
//   { name: 'Alice', age: 30, doubleAge: 60 },
//   { name: 'Bob', age: 25, doubleAge: 50 },
// ]
```

-   **Implementation Details:**
    -   The `EXTEND` operator will iterate through each row of the input data.
    -   For each row, it will evaluate the expression and add the result as a new property with the specified alias.
    -   The expression parser must support arithmetic operations and functions.

#### `AGGREGATE`

The `AGGREGATE` operator performs summary calculations on the data, optionally grouped by one or more columns.

-   **Syntax:** `|> AGGREGATE <agg_func>(<column>) AS <alias> [GROUP BY <group_column>]`
-   **Functionality:** Aggregates data into a single row, or into groups of rows.
-   **Input:** An array of JSON objects.
-   **Output:** A new array of JSON objects with the aggregated results.

**Pseudo-code Example (with `GROUP BY`):**

```typescript
const inputData = [
  { category: 'fruit', sales: 10 },
  { category: 'vegetable', sales: 20 },
  { category: 'fruit', sales: 15 },
];

// Query: |> AGGREGATE SUM(sales) AS total_sales GROUP BY category
const groups = {};
inputData.forEach(row => {
  if (!groups[row.category]) {
    groups[row.category] = [];
  }
  groups[row.category].push(row);
});

const result = Object.keys(groups).map(key => ({
  category: key,
  total_sales: groups[key].reduce((sum, row) => sum + row.sales, 0),
}));

// `result` would be:
// [
//   { category: 'fruit', total_sales: 25 },
//   { category: 'vegetable', total_sales: 20 },
// ]
```

-   **Implementation Details:**
    -   If `GROUP BY` is present, the operator will first group the data into buckets based on the grouping key.
    -   It will then apply the aggregate function (`SUM`, `COUNT`, `AVG`, `MIN`, `MAX`, etc.) to each group.
    -   If `GROUP BY` is not present, the aggregation will be performed over the entire dataset, returning a single row.

#### `ORDER BY`

The `ORDER BY` operator sorts the data based on one or more columns.

-   **Syntax:** `|> ORDER BY <column1> [ASC|DESC], <column2> [ASC|DESC], ...`
-   **Functionality:** Sorts the input array of objects.
-   **Input:** An array of JSON objects.
-   **Output:** A new array of JSON objects, sorted according to the specified columns and directions.

**Pseudo-code Example:**

```typescript
const inputData = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 30 },
];

// Query: |> ORDER BY age DESC, name ASC
const result = inputData.sort((a, b) => {
  if (a.age > b.age) return -1;
  if (a.age < b.age) return 1;
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
});

// `result` would be:
// [
//   { name: 'Alice', age: 30 },
//   { name: 'Charlie', age: 30 },
//   { name: 'Bob', age: 25 },
// ]
```

-   **Implementation Details:**
    -   The `ORDER BY` operator will use a stable sort algorithm.
    -   It will parse the list of columns and their sort directions (ascending or descending).
    -   The comparison function will handle multiple sorting criteria in the specified order.

#### `LIMIT`

The `LIMIT` operator restricts the number of rows returned.

-   **Syntax:** `|> LIMIT <count> [OFFSET <skip_rows>]`
-   **Functionality:** Returns a slice of the input array.
-   **Input:** An array of JSON objects.
-   **Output:** A new, smaller array of JSON objects.

**Pseudo-code Example:**

```typescript
const inputData = [
  { name: 'Alice' },
  { name: 'Bob' },
  { name: 'Charlie' },
  { name: 'David' },
];

// Query: |> LIMIT 2 OFFSET 1
const result = inputData.slice(1, 1 + 2);

// `result` would be:
// [
//   { name: 'Bob' },
//   { name: 'Charlie' },
// ]
```

-   **Implementation Details:**
    -   The `LIMIT` operator will use the `slice` method on the array.
    -   The `OFFSET` is optional and defaults to 0.

#### `JOIN`

The `JOIN` operator combines rows from two datasets based on a related column between them.

-   **Syntax:** `|> <join_type> JOIN <other_data_source> ON <condition>`
-   **Functionality:** Merges two datasets.
-   **Input:** An array of JSON objects (the left side of the join).
-   **Output:** A new array of JSON objects containing the merged data.

**Pseudo-code Example:**

```typescript
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

const orders = [
  { orderId: 101, userId: 1, item: 'Laptop' },
  { orderId: 102, userId: 2, item: 'Mouse' },
  { orderId: 103, userId: 1, item: 'Keyboard' },
];

// Query: FROM users |> JOIN orders ON users.id == orders.userId
const result = [];
for (const user of users) {
  for (const order of orders) {
    if (user.id === order.userId) {
      result.push({ ...user, ...order });
    }
  }
}

// `result` would be:
// [
//   { id: 1, name: 'Alice', orderId: 101, userId: 1, item: 'Laptop' },
//   { id: 1, name: 'Alice', orderId: 103, userId: 1, item: 'Keyboard' },
//   { id: 2, name: 'Bob', orderId: 102, userId: 2, item: 'Mouse' },
// ]
```

-   **Implementation Details:**
    -   The `JOIN` implementation will need to support `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, and `FULL OUTER JOIN`.
    -   The `ON` condition will be parsed to determine the join keys. For performance, it may be beneficial to create a lookup map (hash table) from the join key to the rows of one of the datasets.
    -   **Edge Cases:**
        -   **Duplicate Column Names:** If the tables being joined have columns with the same name, the implementation must handle this gracefully. The typical SQL behavior is to require aliases to disambiguate. The output schema should be well-defined.
        -   **Null Keys:** The behavior of joins on `NULL` keys should be consistent with SQL standards (i.e., `NULL` does not equal `NULL`).
        -   **Cross Joins:** The syntax should support `CROSS JOIN` for generating a Cartesian product of two tables.

#### `CALL`

The `CALL` operator is used to invoke a Table-Valued Function (TVF).

-   **Syntax:** `|> CALL <tvf_name>(<arg1>, ...)`
-   **Functionality:** Passes the current dataset as an implicit first argument to the specified TVF and replaces the dataset with the result of the function.
-   **Input:** An array of JSON objects.
-   **Output:** The array of JSON objects returned by the TVF.

**Pseudo-code Example:**

```typescript
// Assuming a TVF `unnest_hobbies` is registered
const query = `FROM users |> CALL unnest_hobbies('hobbies')`;

const processor = createQueryProcessor(query, { functions: { unnest_hobbies } });

const dataContext = {
  users: [
    { name: 'Alice', hobbies: ['reading', 'hiking'] },
    { name: 'Bob', hobbies: ['gaming'] },
  ],
};
const result = await processor(dataContext);

// result would be:
// [
//   { name: 'Alice', hobby: 'reading' },
//   { name: 'Alice', hobby: 'hiking' },
//   { name: 'Bob', hobby: 'gaming' },
// ]
```

-   **Implementation Details:**
    -   The interpreter will look up the function name in the TVF registry.
    -   It will invoke the function, passing the current data as the first argument, followed by any other arguments specified in the `CALL` expression.
    -   The result of the TVF will replace the current dataset for subsequent pipe operations.

#### `SET`

The `SET` operator is used to define a temporary, named result set that can be used in subsequent operations. This is useful for breaking down complex queries into logical steps.

-   **Syntax:** `|> SET <variable_name>`
-   **Functionality:** Assigns the current result set to a variable.
-   **Input:** An array of JSON objects.
-   **Output:** The same array of JSON objects, but also stored in a named variable for later use.

**Pseudo-code Example:**

```typescript
const users = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
];

// Query: FROM users |> WHERE age > 28 |> SET senior_users
const senior_users = users.filter(user => user.age > 28);

// `senior_users` would be:
// [
//   { id: 1, name: 'Alice', age: 30 },
// ]
```

-   **Implementation Details:**
    -   The interpreter will maintain a map of named variables.
    -   When a `SET` operation is encountered, the current state of the data will be stored in this map with the given name.
    -   Subsequent `FROM` clauses can then reference this named result set.

#### `RENAME`

The `RENAME` operator is used to change the names of columns.

-   **Syntax:** `|> RENAME <old_name> AS <new_name>, ...`
-   **Functionality:** Renames one or more columns in the dataset.
-   **Input:** An array of JSON objects.
-   **Output:** A new array of JSON objects with the specified columns renamed.

**Pseudo-code Example:**

```typescript
const inputData = [
  { user_id: 1, user_name: 'Alice' },
  { user_id: 2, user_name: 'Bob' },
];

// Query: |> RENAME user_id AS id, user_name AS name
const result = inputData.map(row => ({
  id: row.user_id,
  name: row.user_name,
}));

// `result` would be:
// [
//   { id: 1, name: 'Alice' },
//   { id: 2, name: 'Bob' },
// ]
```

-   **Implementation Details:**
    -   The `RENAME` operator will iterate over each object in the input array.
    -   For each object, it will create a new object, copying all properties but renaming the specified ones.

#### `AS`

The `AS` operator is similar to `SET`, but it's used to create a named alias for the entire result of a subquery expression. It allows you to assign a name to the output of a series of pipe operations.

-   **Syntax:** `( <subquery> ) AS <alias_name>`
-   **Functionality:** Assigns an alias to the result of a subquery. This is conceptually similar to `SET`, but is used to name a subquery expression.
-   **Input:** An array of JSON objects.
-   **Output:** The same array of JSON objects, which can now be referenced by the alias.

**Pseudo-code Example:**

```typescript
const dataContext = {
  users: [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 },
  ],
};

// Query: (FROM users |> WHERE age > 28) AS senior_users
const senior_users = dataContext.users.filter(user => user.age > 28);

// `senior_users` can now be used in other parts of a larger query.
```

-   **Implementation Details:**
    -   The parser needs to handle parentheses to group a subquery.
    -   Like `SET`, the interpreter will store the result in a named variable map. The distinction between `AS` and `SET` is more semantic; `SET` is a pipe operator, while `AS` is often used to name a subquery result.

#### `DISTINCT`

The `DISTINCT` operator removes duplicate rows from the dataset.

-   **Syntax:** `|> DISTINCT [ON (<column1>, <column2>, ...)]`
-   **Functionality:** Returns a set of unique rows. If columns are specified with `ON`, uniqueness is determined by the combination of values in those columns.
-   **Input:** An array of JSON objects.
-   **Output:** A new array of JSON objects with duplicate rows removed.

**Pseudo-code Example (all columns):**

```typescript
const inputData = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Alice', age: 30 },
];

// Query: |> DISTINCT
const result = [...new Map(inputData.map(item => [JSON.stringify(item), item])).values()];


// `result` would be:
// [
//   { name: 'Alice', age: 30 },
//   { name: 'Bob', age: 25 },
// ]
```

**Pseudo-code Example (on specific columns):**

```typescript
const inputData = [
  { name: 'Alice', age: 30, city: 'New York' },
  { name: 'Bob', age: 25, city: 'London' },
  { name: 'Alice', age: 35, city: 'Paris' },
];

// Query: |> DISTINCT ON (name)
const seen = new Set();
const result = inputData.filter(row => {
  if (seen.has(row.name)) {
    return false;
  } else {
    seen.add(row.name);
    return true;
  }
});

// `result` would be (first occurrence kept):
// [
//   { name: 'Alice', age: 30, city: 'New York' },
//   { name: 'Bob', age: 25, city: 'London' },
// ]
```

-   **Implementation Details:**
    -   If no columns are specified, the operator can serialize each entire object to a string to check for uniqueness.
    -   If columns are specified with `ON`, a composite key can be created from the values of those columns for each row to track uniqueness. A `Set` is efficient for this.

#### `UNION`

The `UNION` operator combines the result sets of two or more `SELECT` statements. By default, `UNION` removes duplicate rows. `UNION ALL` includes all rows.

-   **Syntax:** `( <query1> ) UNION [ALL] ( <query2> )`
-   **Functionality:** Combines two datasets vertically.
-   **Input:** Two arrays of JSON objects.
-   **Output:** A single array of JSON objects containing rows from both inputs.

**Pseudo-code Example:**

```typescript
const developers = [
  { name: 'Alice', role: 'developer' },
  { name: 'Bob', role: 'developer' },
];

const managers = [
  { name: 'Charlie', role: 'manager' },
  { name: 'Alice', role: 'developer' }, // Duplicate
];

// Query: (FROM developers) UNION (FROM managers)
const combined = [...developers, ...managers];
const result = [...new Map(combined.map(item => [JSON.stringify(item), item])).values()];

// `result` (without duplicates):
// [
//   { name: 'Alice', role: 'developer' },
//   { name: 'Bob', role: 'developer' },
//   { name: 'Charlie', role: 'manager' },
// ]

// Query: (FROM developers) UNION ALL (FROM managers)
const resultAll = [...developers, ...managers];
// `resultAll` (with duplicates):
// [
//   { name: 'Alice', role: 'developer' },
//   { name: 'Bob', role: 'developer' },
//   { name: 'Charlie', role: 'manager' },
//   { name: 'Alice', role: 'developer' },
// ]
```

-   **Implementation Details:**
    -   The implementation will first execute the two subqueries independently.
    -   It will then concatenate the two result arrays.
    -   If `UNION ALL` is not used, it will then perform a `DISTINCT` operation on the combined result.
    -   The two datasets must have the same number of columns and compatible data types.

#### `EXCEPT`

The `EXCEPT` operator returns the rows from the first query that are not present in the second query.

-   **Syntax:** `( <query1> ) EXCEPT ( <query2> )`
-   **Functionality:** Returns the set difference between two datasets.
-   **Input:** Two arrays of JSON objects.
-   **Output:** An array of JSON objects containing only the rows from the first dataset that are not in the second.

**Pseudo-code Example:**

```typescript
const all_employees = [
  { name: 'Alice' },
  { name: 'Bob' },
  { name: 'Charlie' },
];

const developers = [
  { name: 'Alice' },
  { name: 'Bob' },
];

// Query: (FROM all_employees) EXCEPT (FROM developers)
const developerNames = new Set(developers.map(dev => JSON.stringify(dev)));
const result = all_employees.filter(emp => !developerNames.has(JSON.stringify(emp)));

// `result` would be:
// [
//   { name: 'Charlie' },
// ]
```

-   **Implementation Details:**
    -   Execute the two subqueries.
    -   Create a `Set` of the stringified objects from the second result for efficient lookup.
    -   Filter the first result array, keeping only the rows that are not in the `Set`.

### User-Defined Functions (UDFs) and Table-Valued Functions (TVFs)

To provide maximum flexibility, the library will support user-defined functions (UDFs) and table-valued functions (TVFs). These functions can be registered with the query processor ahead of time or defined temporarily within the query itself.

#### 1. Programmatic Registration

Users can define functions in TypeScript and register them when the query processor is created. This is the recommended approach for complex or frequently used logic.

**UDF (User-Defined Function):** A function that takes one or more scalar values and returns a single scalar value. Note that UDFs cannot take a table as a parameter.

**`FunctionRegistry` Interface:**

```typescript
interface FunctionRegistry {
  [functionName: string]: (...args: any[]) => any;
}

interface QueryProcessorOptions {
  dataProvider?: DataProvider;
  functions?: FunctionRegistry;
}
```

**Pseudo-code Example (UDF):**

```typescript
// Define a UDF to format a user's name
const formatName = (firstName: string, lastName: string): string => {
  return `${lastName}, ${firstName}`;
};

// Register the UDF with the processor
const processor = createQueryProcessor(
  `FROM users |> SELECT formatName(firstName, lastName) AS fullName`,
  {
    functions: {
      formatName,
    },
  }
);

const dataContext = {
  users: [
    { firstName: 'Alice', lastName: 'Smith' },
    { firstName: 'Bob', lastName: 'Johnson' },
  ],
};

const result = await processor(dataContext);

// result would be:
// [
//   { fullName: 'Smith, Alice' },
//   { fullName: 'Johnson, Bob' },
// ]
```

#### 2. Temporary Functions in Queries

For functions that are specific to a single query, users can define them directly in the query string using `CREATE TEMP FUNCTION`.

-   **Syntax (UDF):** `CREATE TEMP FUNCTION <name>(<args>) AS (<expression>); <query>`
-   **Syntax (TVF):** `CREATE TEMP TABLE FUNCTION <name>(<args>) AS (<subquery>); <query>`

**Pseudo-code Example (Temporary UDF):**

```typescript
const query = `
  CREATE TEMP FUNCTION add(x, y) AS (x + y);
  FROM numbers
  |> SELECT add(a, b) AS sum
`;

const dataContext = {
  numbers: [
    { a: 1, b: 2 },
    { a: 5, b: 10 },
  ],
};

const processor = createQueryProcessor(query);
const result = await processor(dataContext);

// result would be:
// [
//   { sum: 3 },
//   { sum: 15 },
// ]
```

**Pseudo-code Example (Temporary TVF):**

```typescript
const query = `
  CREATE TEMP TABLE FUNCTION get_senior_users(users_table) AS (
    FROM users_table |> WHERE age >= 30
  );
  FROM get_senior_users(users)
`;

const dataContext = {
  users: [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
    { name: 'Charlie', age: 35 },
  ],
};

const processor = createQueryProcessor(query);
const result = await processor(dataContext);

// result would be:
// [
//   { name: 'Alice', age: 30 },
//   { name: 'Charlie', age: 35 },
// ]
```

#### Implementation Details

-   **Parser:**
    -   The parser must be updated to recognize the `CREATE TEMP FUNCTION` syntax.
    -   It should parse the function name, arguments, and body (either an expression for UDFs or a subquery for TVFs).
    -   The parsed function definitions should be stored in a separate part of the AST.
-   **Interpreter:**
    -   Before executing the main query, the interpreter will process any temporary function definitions from the AST.
    -   It will create executable functions from the parsed bodies and add them to a temporary function registry for the current query execution.
    -   When evaluating expressions, the interpreter will look up function names in both the temporary and the programmatically registered function registries, with temporary functions taking precedence.
    -   The `CALL` operator implementation will need to be aware of TVFs.

### Phase 4: Public API

The public API is the entry point for executing queries. It is designed to be flexible, supporting both static in-memory data and dynamic data providers.

1.  **Main Function (`index.ts`):**
    -   Expose a main function, `createQueryProcessor`, which takes the pipe query string and an optional configuration object.
    -   This function parses the query and returns a processor function.
    -   The processor function takes the data context (if no data provider is used) and executes the query.

    ```typescript
    interface QueryProcessorOptions {
      dataProvider?: DataProvider;
    }

    function createQueryProcessor(query: string, options?: QueryProcessorOptions): (dataContext?: object) => Promise<any[]>;
    ```

##### **Example 1: Using a Static Data Context**

This is the simplest way to use the library, where the data is provided as a plain JavaScript object.

```typescript
import { createQueryProcessor } from 'pipe-query-library';

const query = `
  FROM users
  |> WHERE age >= 30
  |> SELECT name
`;

// Create the processor once
const processor = createQueryProcessor(query);

// Provide the data context when executing the query
const dataContext = {
  users: [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
    { name: 'Charlie', age: 35 },
  ],
};

const result = await processor(dataContext);

// result would be:
// [
//   { name: 'Alice' },
//   { name: 'Charlie' },
// ]
```

##### **Example 2: Using a Data Provider**

When working with dynamic or large datasets, you can pass a `dataProvider` at creation time.

```typescript
import { createQueryProcessor } from 'pipe-query-library';

const query = `
  FROM products
  |> WHERE price > 100
  |> ORDER BY price DESC
`;

// Define a data provider that fetches data from an API
const myDataProvider: DataProvider = async (tableName) => {
  if (tableName === 'products') {
    return fetch('/api/products').then(res => res.json());
  }
  throw new Error(`Unknown table: ${tableName}`);
};

// Create the processor with the data provider
const processor = createQueryProcessor(query, { dataProvider: myDataProvider });

// Execute the query (no need to pass data here, as the provider has it)
const result = await processor();

// `result` would contain products with a price greater than 100
```

### Phase 5: Testing

-   Write comprehensive unit tests for the lexer, parser, and each of the operators.
-   Use property-based testing where applicable to ensure robustness.

## 4. Sources of Information

-   **Pipe Query Syntax Documentation:**
    -   [Google Cloud BigQuery Pipe Syntax](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/pipe-syntax)
    -   [ZetaSQL Pipe Syntax on GitHub](https://github.com/google/zetasql/blob/master/docs/pipe-syntax.md)
-   **BigQuery Standard SQL Reference:**
    -   [Data Types](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/data-types)
    -   [Lexical Structure and Syntax](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/lexical)
    -   [Conversion Rules](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/conversion_rules)
    -   [Format Elements](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/format-elements)
    -   [Operators](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/operators)
    -   [Conditional Expressions](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/conditional_expressions)
    -   [Subqueries](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/subqueries)
-   **Research Paper:**
    -   ["SQL Has Problems. We Can Fix Them: Pipe Syntax In SQL"](https://research.google/pubs/sql-has-problems-we-can-fix-them-pipe-syntax-in-sql/)
-   **Parser and Compiler Theory:**
    -   For inspiration on building parsers and interpreters, resources like Crafting Interpreters by Robert Nystrom or the Dragon Book can be valuable.

## 5. Language Features

This section details the specific data types, functions, and expressions that the query language will support, aligning with the conventions of ZetaSQL where applicable.

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

### Lexical Structure

A query is composed of a series of tokens, including identifiers, literals, keywords, and operators, separated by whitespace or comments.

#### Identifiers
Identifiers are names used for columns, tables, and other objects. They can be quoted with backticks (`) to include special characters or reserved keywords.

- **Unquoted Identifiers:** Must start with a letter or underscore, followed by letters, numbers, or underscores.
- **Quoted Identifiers:** Enclosed in backticks (\`), can contain any character.

**TS Pseudo-code Example:**
```typescript
// Unquoted identifier
const query1 = `FROM users`;

// Quoted identifier for a reserved keyword
const query2 = `FROM \`GROUP\``;

// Quoted identifier with special characters
const query3 = `FROM \`my-table\``;
```

#### Literals
Literals represent constant values of a specific data type.

- **String Literals:** Enclosed in single (`'`) or double (`"`) quotes.
- **Integer Literals:** A sequence of digits, optionally prefixed with `+` or `-`.
- **Floating-Point Literals:** Numbers with a decimal point or an exponent marker (`e` or `E`).
- **Boolean Literals:** `TRUE` or `FALSE`.
- **Array Literals:** Comma-separated elements in square brackets (`[]`).
- **Struct Literals:** Comma-separated field definitions in parentheses (`()`).

**TS Pseudo-code Example:**
```typescript
const query = `
  SELECT
    'hello' AS string_literal,
    123 AS integer_literal,
    1.23e4 AS float_literal,
    TRUE AS bool_literal,
    [1, 2, 3] AS array_literal,
    (1, 'a') AS struct_literal
`;
```

#### Comments
Comments are ignored by the parser and can be single-line or multi-line.

- **Single-line comments:** Start with `--` or `#`.
- **Multi-line comments:** Enclosed in `/*` and `*/`.

**TS Pseudo-code Example:**
```typescript
const query = `
  -- This is a single-line comment
  SELECT name -- an inline comment
  FROM users # another single-line comment
  /*
    This is a
    multi-line comment
  */
`;
```

### Data Model

The underlying data model for the query processor is based on tables (arrays of objects) where each object represents a row.

-   **Rows and Columns:** A row is a JSON object. A column is a property within that object.
-   **Nested Data:** Nested objects and arrays are supported, and their fields can be accessed using dot notation (e.g., `user.address.city`).

### Conversion Rules

The library will support both explicit and implicit type conversions to provide flexibility and convenience.

#### Explicit Conversion (Casting)
Explicit conversion is performed using the `CAST` and `SAFE_CAST` functions.

- **`CAST(expression AS type)`:** Converts the expression to the specified type. If the conversion is not possible, it will result in an error.
- **`SAFE_CAST(expression AS type)`:** Similar to `CAST`, but returns `NULL` if the conversion fails instead of throwing an error.

**TS Pseudo-code Example:**
```typescript
// Query: SELECT CAST('123' AS INTEGER) as int_val, SAFE_CAST('abc' AS INTEGER) as safe_int_val
const result = { int_val: 123, safe_int_val: null };
```

#### Implicit Conversion (Coercion)
Implicit conversion, or coercion, is performed automatically when an expression of one data type is used in a context that expects a different data type.

**TS Pseudo-code Example:**
```typescript
// In the expression `1 + '2'`, the string '2' will be coerced to an integer.
// Query: SELECT 1 + '2' as result
const result = { result: 3 };
```

### Built-in Functions

The library will provide a rich set of built-in functions, categorized for clarity.

#### Conditional Expressions

-   `CASE WHEN <condition> THEN <result> ... ELSE <default> END`: A standard `CASE` expression.
-   `IF(<condition>, <true_result>, <false_result>)`: A simpler conditional function.
-   `COALESCE(<expr1>, <expr2>, ...)`: Returns the first non-null expression in the list.

#### String Functions

-   `CONCAT(str1, str2, ...)`
-   `LOWER(str)`
-   `UPPER(str)`
-   `LENGTH(str)`
-   `SUBSTR(str, position, length)`
-   `TRIM(str)`
-   `REPLACE(str, search, replacement)`

#### Date and Time Functions

-   `CURRENT_DATE()`: Returns the current date.
-   `CURRENT_TIMESTAMP()`: Returns the current timestamp.
-   `DATE_ADD(date, INTERVAL value unit)`: Adds a time interval to a date.
-   `DATE_DIFF(date1, date2, unit)`: Returns the difference between two dates.
-   `EXTRACT(part FROM date)`: Extracts a part of a date (e.g., `YEAR`, `MONTH`, `DAY`).
-   `FORMAT_DATE(format_string, date)`: Formats a date as a string.

#### Format Functions
Format functions are used to convert dates, times, timestamps, and other data types into human-readable strings. These functions use a format string that specifies the desired output format, following conventions from standard SQL.

- **Reference:** [Format Elements in BigQuery](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/format-elements)

-   `FORMAT_DATE(format_string, date_expression)`: Formats a `DATE` object.
-   `FORMAT_TIME(format_string, time_expression)`: Formats a `TIME` object.
-   `FORMAT_DATETIME(format_string, datetime_expression)`: Formats a `DATETIME` object.
-   `FORMAT_TIMESTAMP(format_string, timestamp_expression)`: Formats a `TIMESTAMP` object.

**Implementation Note on Date/Time Formatting:**
Implementing a comprehensive date and time formatting engine from scratch is complex. It is highly recommended to use a robust, well-tested library like **`luxon`** to handle the parsing of format strings and the application of formatting rules. This will ensure consistency and correctness in handling various date and time format elements.

**TS Pseudo-code Example:**

```typescript
import { DateTime } from 'luxon'; // Example using luxon

const inputTimestamp = new Date('2023-10-26T10:00:00Z');

// Query: |> SELECT FORMAT_TIMESTAMP('%Y-%m-%d %H:%M:%S', event_time) AS formatted_time
const formatString = '%Y-%m-%d %H:%M:%S';

// The library's implementation would delegate to luxon
// Note: Luxon uses a different format string syntax ('yyyy-MM-dd HH:mm:ss'),
// so a mapping from SQL format specifiers to luxon's format specifiers will be needed.
const luxonDateTime = DateTime.fromJSDate(inputTimestamp);
const formatted_time = luxonDateTime.toFormat('yyyy-MM-dd HH:mm:ss');

const result = { formatted_time: '2023-10-26 10:00:00' };
```

#### Array Functions

-   `ARRAY_LENGTH(array)`: Returns the number of elements in an array.
-   `ARRAY_TO_STRING(array, delimiter)`: Joins array elements into a string.
-   `ARRAY_CONCAT(array1, array2)`: Concatenates two arrays.
-   `array[OFFSET(index)]`: Accesses an array element by its zero-based index.

#### Aggregate Functions

These functions are used with the `AGGREGATE` operator.

-   `COUNT(column | *)`: Counts the number of rows.
-   `SUM(column)`: Calculates the sum of values.
-   `AVG(column)`: Calculates the average of values.
-   `MIN(column)`: Finds the minimum value.
-   `MAX(column)`: Finds the maximum value.
-   `ARRAY_AGG(column)`: Aggregates values into an array.

### Operators in Expressions

Operators are special characters or keywords that perform operations on one or more values (operands). The library will support a variety of operators, categorized as follows.

- **Reference:** [Operators in BigQuery](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/operators)

#### Arithmetic Operators
These operators perform mathematical calculations.

- `+` (Addition), `-` (Subtraction), `*` (Multiplication), `/` (Division)
- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT price * 1.07 AS price_with_tax
  const result = { price_with_tax: 100 * 1.07 }; // 107
  ```

#### Logical Operators
These operators perform boolean logic.

- `AND`, `OR`, `NOT`
- **TS Pseudo-code Example:**
  ```typescript
  // Query: WHERE age > 18 AND country == 'USA'
  const isMatch = (row.age > 18) && (row.country === 'USA');
  ```

#### Comparison Operators
These operators compare two values.

- `=`, `!=`, `<>`, `<`, `>`, `<=`, `>=`
- `[NOT] LIKE`: String matching with wildcards (`%`, `_`).
- `[NOT] BETWEEN`: Checks if a value is within a range.
- `[NOT] IN`: Checks if a value is in a list of values.
- `IS [NOT] NULL`: Checks for null values.
- `IS [NOT] TRUE`/`IS [NOT] FALSE`: Checks for boolean values.

- **TS Pseudo-code Example:**
  ```typescript
  // Query: WHERE age BETWEEN 18 AND 65
  const isInRange = row.age >= 18 && row.age <= 65;
  ```

#### Bitwise Operators
These operators perform bit-level operations on integers.

- `&` (AND), `|` (OR), `^` (XOR), `~` (NOT), `<<` (Left Shift), `>>` (Right Shift)
- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT 5 & 3 AS result
  const result = { result: 5 & 3 }; // 1
  ```

#### Concatenation Operator
This operator combines strings, bytes, or arrays.

- `||`
- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT firstName || ' ' || lastName AS full_name
  const result = { full_name: 'John' + ' ' + 'Doe' };
  ```

### Conditional Expressions

Conditional expressions allow for logic to be embedded directly into queries, enabling powerful transformations and data handling.

- **Reference:** [Conditional Expressions in BigQuery](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/conditional_expressions)

#### `CASE`
The `CASE` expression is a versatile conditional statement that returns a value based on one or more conditions.

- **Syntax:**
  ```sql
  CASE
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
    ...
    ELSE else_result
  END
  ```

- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT CASE WHEN score > 90 THEN 'A' WHEN score > 80 THEN 'B' ELSE 'C' END AS grade
  let grade;
  if (row.score > 90) {
    grade = 'A';
  } else if (row.score > 80) {
    grade = 'B';
  } else {
    grade = 'C';
  }
  const result = { grade };
  ```

#### `IF`
The `IF` function is a simpler conditional expression that returns one of two values based on a boolean condition.

- **Syntax:** `IF(condition, true_result, else_result)`

- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT IF(is_member, 'Member', 'Non-Member') AS member_status
  const member_status = row.is_member ? 'Member' : 'Non-Member';
  const result = { member_status };
  ```

#### `COALESCE`
The `COALESCE` function returns the first non-null value from a list of expressions. This is particularly useful for providing default values for nullable columns.

- **Syntax:** `COALESCE(expr1, expr2, ...)`

- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT COALESCE(nickname, firstName, 'Guest') AS display_name
  const display_name = row.nickname || row.firstName || 'Guest';
  const result = { display_name };
  ```

-   **Implementation Details:**
    -   Each built-in function will be implemented as a TypeScript function and registered in a global function registry within the interpreter.
    -   The expression evaluator will look up function names in this registry.
    -   The implementation should handle type checking for function arguments to ensure correctness.

### Subqueries

A subquery is a query nested inside another query. Subqueries are a powerful tool for performing complex data manipulations and are supported in various clauses, including `SELECT`, `FROM`, and `WHERE`.

- **Reference:** [Subqueries in BigQuery](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/subqueries)

#### Scalar Subqueries
A scalar subquery is a subquery that returns a single value (one row with one column). It can be used anywhere a literal value is expected.

- **TS Pseudo-code Example:**
  ```typescript
  // Query: SELECT name, (SELECT AVG(age) FROM users) AS avg_age FROM users
  const allUsers = dataContext.users;
  const avg_age = allUsers.reduce((sum, user) => sum + user.age, 0) / allUsers.length;
  const result = allUsers.map(user => ({
    name: user.name,
    avg_age,
  }));
  ```

#### Multi-row Subqueries (IN, EXISTS)
Subqueries that return multiple rows are typically used with operators like `IN` or `EXISTS` to check for membership or existence.

- **`IN` Subquery:** Checks if a value is present in the result set of the subquery.
- **`EXISTS` Subquery:** Checks if the subquery returns any rows.

- **TS Pseudo-code Example (`IN`):**
  ```typescript
  // Query: FROM users WHERE id IN (SELECT userId FROM orders WHERE amount > 100)
  const expensiveOrderUserIds = new Set(
    dataContext.orders
      .filter(order => order.amount > 100)
      .map(order => order.userId)
  );
  const result = dataContext.users.filter(user => expensiveOrderUserIds.has(user.id));
  ```

#### Correlated Subqueries
A correlated subquery is a subquery that depends on the outer query for its values. The subquery is re-evaluated for each row processed by the outer query.

- **TS Pseudo-code Example:**
  ```typescript
  // Find users whose age is higher than the average age of users in their own country
  // Query: FROM users u1 WHERE age > (SELECT AVG(age) FROM users u2 WHERE u2.country == u1.country)
  const countryAvgs = {}; // Cache for average ages per country
  const result = dataContext.users.filter(u1 => {
    if (!countryAvgs[u1.country]) {
      const countryUsers = dataContext.users.filter(u => u.country === u1.country);
      countryAvgs[u1.country] = countryUsers.reduce((sum, u) => sum + u.age, 0) / countryUsers.length;
    }
    return u1.age > countryAvgs[u1.country];
  });
  ```
