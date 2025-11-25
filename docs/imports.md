# Grammar-Well Imports

## Summary of Grammar-Well

Grammar-Well is a cross-platform compiler, parser, and interpreter written in TypeScript. It began as a port of the Nearley library and has since expanded to include features like a built-in lexer and support for various parsing algorithms (LR0, CKY). It is designed to be easy to use and provides a number of quality-of-life features.

## Imports

Grammar-Well supports importing external grammar and lexer rules. This allows for modularity and reuse of common grammar components.

### Syntax

The basic syntax for importing is:

```
import <rules> from <source>;
```

- `<rules>`: The specific rules to import. Use `*` to import all rules.
- `<source>`: The path to the file containing the rules to import. For user-defined modules, the source path should be a double-quoted string (e.g., "my_module.well").

### Example

This example demonstrates importing a whitespace lexer and using it in a grammar to parse JSON:

```
import * from whitespace;

on:import {
  extractObject(key, _, value, __) {
    return [key, value];
  },

  extractArray(value, _) {
    return value;
  },
}

lexer {
  string: /"(?:\\"|\\b|\\f|\\n|\\r|\\t|\\/|\\u[a-fA-F0-9]{4}|[^"\\])*"/,
  number: /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/,
  "{": "{",
  "}": "}",
  "[": "[",
  "]": "]",
  ",": ",",
  ":": ":",
  true: "true",
  false: "false",
  null: "null",
}

grammar {
  json:
    | value                       -> id

  value:
    | object                      -> id
    | array                       -> id
    | %string                     -> (d) => JSON.parse(d[0].value)
    | %number                     -> (d) => parseFloat(d[0].value)
    | %true                       -> () => true
    | %false                      -> () => false
    | %null                       -> () => null

  object:
    | "{" __ "}"                   -> () => ({})
    | "{" __ kv_list __ "}"         -> (d) => Object.fromEntries(d[2])

  kv_list:
    | pair                        -> (d) => [d[0]]
    | kv_list __ "," __ pair      -> (d) => [...d[0], d[4]]

  pair:
    | %string __ ":" __ value     -> ${ extractObject }

  array:
    | "[" __ "]"                   -> () => []
    | "[" __ value_list __ "]"     -> (d) => d[2]

  value_list:
    | value                       -> (d) => [d[0]]
    | value_list __ "," __ value  -> ${ extractArray }

  # I am a comment
  _i:
    | %whitespace {% (d) => d[0].value %}

  __: 
    | _i?
}
```

In this example:

- `import * from whitespace;` imports all rules from the `whitespace` grammar.
- The `on:import` block defines JavaScript functions that can be used within the grammar rules.
- `__` is a rule that uses the imported `whitespace` rule to handle optional whitespace.

This allows for the separation of concerns, where the core JSON grammar doesn't need to be concerned with the specifics of how whitespace is handled.
