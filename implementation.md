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
    -   The `ON` condition will be parsed to determine the join keys.
    -   For performance, it may be beneficial to create a lookup map (hash table) from the join key to the rows of one of the datasets.

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
-   **Research Paper:**
    -   ["SQL Has Problems. We Can Fix Them: Pipe Syntax In SQL"](https://research.google/pubs/sql-has-problems-we-can-fix-them-pipe-syntax-in-sql/)
-   **Parser and Compiler Theory:**
    -   For inspiration on building parsers and interpreters, resources like Crafting Interpreters by Robert Nystrom or the Dragon Book can be valuable.
