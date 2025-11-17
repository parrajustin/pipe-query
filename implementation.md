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
    -   Initial operators to implement:
        -   `FROM`: To specify the input data source.
        -   `SELECT`: To choose and rename columns.
        -   `WHERE`: To filter rows based on a condition.
        -   `EXTEND`: To add new computed columns.
        -   `AGGREGATE` (with `GROUP BY`): To perform aggregations.
        -   `ORDER BY`: To sort the results.
        -   `LIMIT`: To restrict the number of rows returned.
        -   `JOIN`: To combine data from multiple sources.

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
