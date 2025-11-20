// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "Main", "symbols": ["_", "PipedQuery", "_"], "postprocess": data => data[1]},
    {"name": "PipedQuery$ebnf$1", "symbols": []},
    {"name": "PipedQuery$ebnf$1$subexpression$1", "symbols": ["_", "PipeStatement"]},
    {"name": "PipedQuery$ebnf$1", "symbols": ["PipedQuery$ebnf$1", "PipedQuery$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "PipedQuery", "symbols": ["FromStatement", "PipedQuery$ebnf$1"], "postprocess":
        (data) => {
            const [from, rest] = data;
            let statements = [from];
            if (rest) {
                rest.forEach(item => statements.push(item[1]));
            }
            return new QueryStmt(statements);
        }
        },
    {"name": "FromStatement", "symbols": [(lexer.has("FROM") ? {type: "FROM"} : FROM), "_", (lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER)], "postprocess": (d) => new FromStmt(d[2])},
    {"name": "PipeStatement", "symbols": [(lexer.has("PIPE_GREATER") ? {type: "PIPE_GREATER"} : PIPE_GREATER), "_", "SelectStatement"], "postprocess": (d) => d[2]},
    {"name": "SelectStatement", "symbols": [(lexer.has("SELECT") ? {type: "SELECT"} : SELECT), "_", "SelectColumns"], "postprocess": (d) => new SelectStmt(d[2])},
    {"name": "SelectColumns$ebnf$1", "symbols": []},
    {"name": "SelectColumns$ebnf$1$subexpression$1", "symbols": ["_", (lexer.has("COMMA") ? {type: "COMMA"} : COMMA), "_", "SelectColumn"]},
    {"name": "SelectColumns$ebnf$1", "symbols": ["SelectColumns$ebnf$1", "SelectColumns$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "SelectColumns", "symbols": ["SelectColumn", "SelectColumns$ebnf$1"], "postprocess":
        (data) => {
            const [first, rest] = data;
            const result = [first];
            if (rest) {
                rest.forEach(item => result.push(item[3]));
            }
            return result;
        }
        },
    {"name": "SelectColumn$ebnf$1$subexpression$1", "symbols": ["_", (lexer.has("AS") ? {type: "AS"} : AS), "_", "Identifier"]},
    {"name": "SelectColumn$ebnf$1", "symbols": ["SelectColumn$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "SelectColumn$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "SelectColumn", "symbols": ["Identifier", "SelectColumn$ebnf$1"], "postprocess":
        (data) => {
            const [expression, rest] = data;
            return { expression, alias: rest ? rest[3] : null };
        }
        },
    {"name": "Identifier", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER)], "postprocess": (d) => new Variable(d[0])},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1$subexpression$1", "symbols": [(lexer.has("WS") ? {type: "WS"} : WS)]},
    {"name": "_$ebnf$1$subexpression$1", "symbols": [(lexer.has("NL") ? {type: "NL"} : NL)]},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "_$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": () => null}
]
  , ParserStart: "Main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
