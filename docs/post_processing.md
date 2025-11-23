# Grammar-Well Post-Processors

Post-processors in Grammar-Well are a powerful mechanism to transform the raw parse tree into a more useful structure, such as an Abstract Syntax Tree (AST), or to evaluate expressions immediately during parsing. They allow you to attach JavaScript logic to your grammar rules.

## Core Concept: The `data` Array

When a rule matches, the matched elements (terminals and non-terminals) are collected into an array called `data`.

- `data[0]` corresponds to the first symbol in the rule.
- `data[1]` corresponds to the second symbol, and so on.

Each element in `data` is typically an object representing the matched token or the result of a sub-rule's post-processor.

- For **terminals** (like strings or regex), the object usually has a `value` property containing the matched text, and a `text` property containing the original text (including skipped whitespace if applicable), along with line/column info.
- For **non-terminals**, the object is whatever the sub-rule returned (or the default node structure if no post-processor was defined).

## Syntax Variations

Grammar-Well supports several syntaxes for defining post-processors, indicated by the arrow `=>` (or sometimes `->` in older versions, but `=>` is standard).

### 1. Array Shorthand `=> [...]`

Useful for quickly restructuring the output into an array.

```grammar
[List]:
    | "(" Items ")" => [ $1 ]  # Returns an array containing just the Items
```

### 2. Expression Shorthand `=> (...)`

Evaluates a single JavaScript expression. The result of the expression becomes the result of the rule.

```grammar
[Number]:
    | r:{[0-9]+} => ( parseInt($0.value, 10) )
```

### 3. Function Body `=> { ... }`

Allows for complex logic with multiple statements. You must explicitly `return` a value.

```grammar
[Sum]:
    | Number "+" Number => {
        const left = $0;
        const right = $2;
        return left + right;
    }
```

### 4. Interpolated Function `=> ${ ... }`

Injects a raw JavaScript function. This is useful when you need full control or want to use external functions imported via `on:import`.

```grammar
[Action]:
    | "print" String => ${
        ({data}) => {
            console.log(data[1].value);
            return { type: "Print", value: data[1].value };
        }
    }
```

## Accessing Data

### Ordinal References (`$0`, `$1`, etc.)

You can refer to elements of the `data` array using `$` followed by the index.

- `$0` is equivalent to `data[0]`
- `$1` is equivalent to `data[1]`

**Example:**

```grammar
[Assignment]:
    | Identifier "=" Expression => {
        return {
            type: "Assignment",
            var: $0.value,
            expr: $2
        };
    }
```

### Aliased References (`@name`)

To make your grammar more readable and robust to changes, you can alias symbols using `@name`. You can then reference them as `$name`.

**Example:**

```grammar
[FunctionCall]:
    | Identifier@funcName "(" Arguments@args ")" => {
        return {
            type: "Call",
            callee: $funcName.value,
            arguments: $args
        };
    }
```

## Detailed Examples

### Example 1: Basic Arithmetic Evaluation

This example evaluates the math as it parses.

```grammar
grammar {
    [Expression]:
        | Term

    [Term]:
        | Factor
        | Term "+" Factor => ( $0 + $2 )
        | Term "-" Factor => ( $0 - $2 )

    [Factor]:
        | Number
        | Factor "*" Number => ( $0 * $2 )
        | Factor "/" Number => ( $0 / $2 )

    [Number]:
        | r:{[0-9]+} => ( parseInt($0.value, 10) )
}
```

### Example 2: Building an AST

This example constructs a JSON object representing the code structure.

```grammar
grammar {
    [Statement]:
        | "let" Identifier@id "=" Expression@val ";" => {
            return {
                kind: "VariableDeclaration",
                identifier: $id.value,
                init: $val
            };
        }

    [Expression]:
        | Number
        | String

    [Identifier]:
        | r:{[a-zA-Z_]\w*}

    [Number]:
        | r:{[0-9]+} => ( { kind: "Literal", value: parseInt($0.value) } )

    [String]:
        | s:{"} r:{[^"]*} s:{"} => ( { kind: "Literal", value: $1.value } )
}
```

### Example 3: List Processing

Handling lists often involves recursion. Post-processors can flatten these structures.

```grammar
grammar {
    [List]:
        | "[" Elements "]" => ( $1 )

    [Elements]:
        | Element => ( [$0] )
        | Elements "," Element => {
            $0.push($2);
            return $0;
        }

    [Element]:
        | r:{[a-z]+} => ( $0.value )
}
```

### Example 4: Using `data` directly

Sometimes it's useful to access the raw `data` array, especially in interpolated functions or when iterating.

```grammar
[Items]:
    | Item* => {
        // $0 is the array of all matched Item results because of the * quantifier
        return $0.map(item => item.value);
    }
```

_Note: When using quantifiers like `_`or`+`, the result at that position in `data` is usually an array of the matches.\*

### Example 5: Advanced Object Construction

Using aliases and function bodies for clarity.

```grammar
[ClassDef]:
    | "class" Identifier@name "{" Method*@methods "}" => {
        return {
            type: "Class",
            name: $name.value,
            methods: $methods // $methods is already an array due to *
        };
    }

[Method]:
    | Identifier@name "(" ")" "{" "}" => {
        return {
            type: "Method",
            name: $name.value
        };
    }
```

## Best Practices

1.  **Use Aliases**: `@name` is much safer than `$index` if you change your grammar later (e.g., adding an optional keyword).
2.  **Keep it Simple**: If your post-processor logic is very complex, consider calling a helper function defined in `on:import` or just returning a simple object and processing it later.
3.  **Return Objects**: For ASTs, return consistent objects with a `type` or `kind` field.
4.  **Handle Quantifiers**: Remember that `*` and `+` produce arrays. `$0` will be an array of results.
