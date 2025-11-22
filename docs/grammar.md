# Grammar-Well Grammar Rules

Grammar-Well's grammar definition is inspired by EBNF (Extended Backus-Naur Form) and provides additional syntax for output generation. This document outlines the core components of defining grammar rules for LLMs.

## 1. Grammar Block

The grammar rules are defined within a `grammar` block in your grammar file.

```
grammar {
  # Your grammar rules go here
}
```

## 2. Rules

A rule defines a production in the grammar, specifying how a non-terminal symbol can be expanded into a sequence of other symbols (terminals or non-terminals).

### Syntax

A rule is defined by a `[Rule Name]` followed by one or more production rules, separated by `|`.

```
[RuleName]:
    | ProductionRule1
    | ProductionRule2
    ;
```

### Example

```
grammar {
  [Start]:
      |  HelloGoodbye __ Target

  [HelloGoodbye]:
      | "Hello"
      | "Goodbye"

  [Target]:
      | "World"
      | r:{[a-zA-Z]+}

  [__]:
      | <ws>
}
```

In this example:
- `Start`, `HelloGoodbye`, `Target`, and `__` are **Non-Terminals**.
- `"Hello"`, `"Goodbye"`, `"World"`, `r:{[a-zA-Z]+}` and `<ws>` are **Terminals**.

## 3. Symbols

Symbols are the basic building blocks of grammar rules.

### Non-Terminals

-   References to other production rules.
-   Represented by an unquoted identifier (word).
-   **Example**: In `[Expression] | Term "+" Expression`, `Term` and `Expression` are non-terminals.

### Terminals

Terminals are the actual tokens or literal values that the lexer recognizes.

-   **Literals**:
    -   Double-quoted strings (e.g., `"Hello"`).
    -   Case-sensitive by default.
    -   Can be made case-insensitive by prepending `i::` (e.g., `i:"Hello"`).

-   **Regular Expressions**:
    -   Defined using JavaScript's regex syntax within `r:{...}` (e.g., `r:{[a-zA-Z]+}`).
    -   Regex flags are not supported.

-   **Token Tags**:
    -   References to lexer-defined tokens.
    -   Wrapped in angled brackets (e.g., `<ws>` for whitespace).

## 4. Sub-Expressions

Symbols can be grouped using parentheses `()` to create inline sub-expressions. Options within sub-expressions are separated by `|`. This is an alternative to defining a separate rule for a small set of choices.

-   **Example**:
    `("Hello" | "Goodbye") "World"` is equivalent to:
    ```
    [Greeting]:
        | "Hello"
        | "Goodbye"
    [Start]:
        | Greeting "World"
    ```

## 5. Quantifiers

Similar to regular expressions, quantifiers can be appended to symbols or grouped sub-expressions to specify their occurrence count.

-   `?`: Zero or one occurrence.
    -   **Example**: `[Symbol]?`
-   `*`: Zero or more occurrences.
    -   **Example**: `[Symbol]*`
-   `+`: One or more occurrences.
    -   **Example**: `[Symbol]+`

For complex expressions, use parentheses for grouping before applying a quantifier (e.g., `([SymbolA] [SymbolB])+`).

## 6. Post-Processors

Post-processors are used to transform or evaluate the values matched by a production rule. They allow you to define how the parsed data should be structured or processed.

### Types of Post-Processors

1.  **JavaScript Array Syntax**:
    -   Example: `-> [ $0, $3.value ]`
    -   Directly constructs a JavaScript array from the matched components.

2.  **JavaScript Expressions (wrapped in parentheses)**:
    -   Example: `-> ( JSON.parse($0.value) )`
    -   Evaluates a single JavaScript expression.

3.  **JavaScript Function Body Syntax**:
    -   Example: `-> { return JSON.parse($0.value) }`
    -   Allows for more complex logic within a function body.

4.  **Interpolated Content (via `on:import` functions)**:
    -   Example: `-> ${ ({data}) => JSON.parse(data[0].value) }`
    -   References functions defined in an `on:import` block. The entire content within `${}` is interpolated into the parser as an invokable entity.

### Positioning

Post-processors can be applied in two ways:

-   **Default Post-processor for a Rule**: Placed immediately after the rule name to apply to all its production rules if not overridden.
    ```
    [RuleName] -> { /* default processing */ }:
        | ProductionRule1 -> { /* specific processing */ }
        | ProductionRule2
    ```
-   **Specific Post-processor for a Production Rule**: Placed after an individual production rule. This overrides any default post-processor.

### References within Post-processors

-   **Ordinal References**:
    -   `$0`, `$1`, `$2`, ... refer to `data[0]`, `data[1]`, `data[2]`, ... respectively, within the JavaScript context of the post-processor. `data` is an array containing the matched symbols for the current production.

-   **Aliased References**:
    -   A symbol can be suffixed with `@word` (e.g., `"Hello"@greeting`).
    -   This allows the aliased name (`greeting` in this case) to be used as a property in the `data` object passed to the post-processor (e.g., `$greeting.value`).

## 7. Comments

Comments can be added to your grammar file using `#`.

-   **Example**:
    ```
    # This is a comment
    [Rule]:
        | "token" # This comments a specific production
    ```
