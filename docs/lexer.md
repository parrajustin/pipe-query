# Grammar-Well Lexer

Grammar-Well includes a powerful, optional, stateful lexer that is highly recommended for building production grammars.

## Lexer Structure

The lexer is defined within a `lexer` block in your grammar file. It is composed of states, which are named collections of rules.

```
lexer {
  # The root state, where the lexer starts by default
  root: {
    # Rules for the root state
  }

  # Other states
  a_state: {
    # Rules for a_state
  }
}
```

## Lexer States

A lexer state is a set of rules that define how to tokenize the input when the lexer is in that particular state. The lexer can be instructed to move between states, allowing you to handle different contexts within your grammar, such as comments, strings, or different embedded languages.

### Configuration

The lexer can have an optional `on:config` section. This section must be at the top of the lexer definition.

- `start`: Specifies the initial state of the lexer. If not provided, it defaults to the `root` state.

```
lexer {
  on:config {
    start: a_state,
  }

  root: {
    # ...
  }
  a_state: {
    # ...
  }
}
```

### Rules

There are two types of rules that can be used within a state:

#### 1. Import Rules

Import rules allow you to reuse rules from other states. This is useful for DRY (Don't Repeat Yourself) principles.

- **Syntax**: `import <state_name_1>, <state_name_2>, ...;`

- **Example**:
  ```
  lexer {
    strings: {
      single_quotes: { ... }
      double_quotes: { ... }
    }
    root: {
      import strings.single_quotes, strings.double_quotes;
    }
  }
  ```

#### 2. Matching Rules

Matching rules define the patterns to match in the input stream. They are evaluated in order from top to bottom.

- **Syntax**: `when <matcher> <directives>;`

- **Matcher**: This can be a regular expression (e.g., `r:{...}`), a string literal (e.g., `s:{...}`), or a character set (e.g., `c:{...}`).

- **Directives**: These control the lexer's behavior when a match is found.

### Directives

Directives are used in matching rules to control the lexer's behavior.

- **`when <matcher>`**: Matches and consumes input. This is a required directive and is mutually exclusive with `before` and `skip`.

- **`before <matcher>`**: Matches but does not consume input. It is used with `goto`, `pop`, or `inset`. This is a required directive and is mutually exclusive with `when` and `skip`.

- **`skip <matcher>`**: Matches and consumes input, but the matched text is ignored and not passed to the grammar. This is a required directive and is mutually exclusive with `when` and `before`.

- **`goto <state_name>`**: Pushes the current state onto the stack and transitions the lexer to the specified state. It is mutually exclusive with `pop`, `inset`, and `stay`.

- **`pop: <number>`**: Pops one or a specified number of states from the stack. It is mutually exclusive with `goto`, `inset`, and `stay`.

- **`inset: <number>`**: Pushes the current state onto the stack one or a specified number of times. It is mutually exclusive with `goto`, `pop`, and `stay`.

- **`stay`**: Prevents the lexer from switching states when used in a span state. It is mutually exclusive with `goto`, `pop`, and `inset`.

- **`tag <tag_name_1>, <tag_name_2>, ...`**: Applies one or more tags to the matched token. These tags can be referenced in the grammar.

- **`highlight <string>`**: A string used to help generate syntax highlighting. It is not used directly by Grammar-Well.

### Spans

Spans are a special type of lexer state used to define a context that has a clear start and end delimiter, such as a string or a block comment. A span has three sections: `start`, `span` (the middle section), and `stop`.

- **Example**: A span for a double-quoted string.

  ```
  lexer {
    double_quoted_string: span {
      start: {
        when s:{"} tag "dquote";
      }
      span: {
        when r:{\\[\\\/bnrft]} tag "escaped_char";
        when r:{[^"\\]+} tag "string_content";
      }
      stop: {
        when s:{"} tag "dquote";
      }
    }
  }
  ```
