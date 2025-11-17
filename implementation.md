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

The `FROM` clause is the starting point of any query. It specifies the initial dataset to be processed. In this library, the `FROM` clause will reference a key in a provided JSON object that contains arrays of data.

-   **Syntax:** `FROM <data_source>`
-   **Functionality:** Initializes the data pipeline with the specified dataset.
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

// `initialData` would be:
// [
//   { id: 1, name: 'Alice', age: 30 },
//   { id: 2, name: 'Bob', age: 25 },
// ]
```

-   **Implementation Details:**
    -   The `FROM` clause will be the first part of the AST.
    -   The interpreter will use the identifier from the `FROM` clause to look up the corresponding data array in the input data context.

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

### Phase 4: Public API

The public API will be the entry point for users of the library.

1.  **Main Function (`index.ts`):**
    -   Expose a main function, e.g., `createQueryProcessor`, which takes a pipe query string.
    -   This function will parse the query and return a "processor" function.
    -   The processor function will take the data (e.g., a JSON array) and return the result.

    ```typescript
    import { createQueryProcessor } from 'pipe-query-library';

    const query = `
      FROM myData
      |> WHERE category == 'fruit'
      |> AGGREGATE COUNT(*) AS count GROUP BY item
      |> ORDER BY count DESC
    `;

    const processor = createQueryProcessor(query);

    const myData = [
      { item: 'apples', sales: 2, category: 'fruit' },
      { item: 'carrots', sales: 8, category: 'vegetable' },
      { item: 'apples', sales: 7, category: 'fruit' },
      { item: 'bananas', sales: 5, category: 'fruit' },
    ];

    const result = processor(myData);
    // result would be:
    // [
    //   { item: 'apples', count: 2 },
    //   { item: 'bananas', count: 1 },
    // ]
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
