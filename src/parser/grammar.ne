@{%
const moo = require("moo");
const { FromStmt, QueryStmt, SelectStmt, Variable } = require("./ast");

const lexer = moo.compile({
  WS: /[ \t]+/,
  NL: { match: /\n/, lineBreaks: true },
  PIPE_GREATER: '|>',
  COMMA: ',',
  FROM: "FROM",
  SELECT: "SELECT",
  AS: "AS",
  IDENTIFIER: /[a-zA-Z_][a-zA-Z0-9_]*/,
});
%}

@lexer lexer

Main -> _ PipedQuery _ {% data => data[1] %}

PipedQuery -> FromStatement (_ PipeStatement):* {%
    (data) => {
        const [from, rest] = data;
        let statements = [from];
        if (rest) {
            rest.forEach(item => statements.push(item[1]));
        }
        return new QueryStmt(statements);
    }
%}

FromStatement -> %FROM _ %IDENTIFIER {% (d) => new FromStmt(d[2]) %}

PipeStatement -> %PIPE_GREATER _ SelectStatement {% (d) => d[2] %}

SelectStatement -> %SELECT _ SelectColumns {% (d) => new SelectStmt(d[2]) %}

SelectColumns -> SelectColumn (_ %COMMA _ SelectColumn):* {%
    (data) => {
        const [first, rest] = data;
        const result = [first];
        if (rest) {
            rest.forEach(item => result.push(item[3]));
        }
        return result;
    }
%}

SelectColumn -> Identifier (_ %AS _ Identifier):? {%
    (data) => {
        const [expression, rest] = data;
        return { expression, alias: rest ? rest[3] : null };
    }
%}

Identifier -> %IDENTIFIER {% (d) => new Variable(d[0]) %}

_ -> (%WS | %NL):* {% () => null %}
