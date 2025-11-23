// Generated automatically by Grammar-Well, version 2.0.7 
// https://github.com/0x6563/grammar-well
// @ts-nocheck



class grammar {
    state = {};
    artifacts = {
        grammar: {
            rules: {
                FunctionParam: [
                    { name: "FunctionParam", symbols: [ { token: "word" }, "__", { token: "dataType" } ] }
                ],
                FunctionParams: [
                    { name: "FunctionParams", symbols: [ "FunctionParam" ] },
                    { name: "FunctionParams", symbols: [ "FunctionParams", { literal: "," }, "__", "FunctionParam" ] }
                ],
                PrivateScalarFunction: [
                    { name: "PrivateScalarFunction", symbols: [ { literal: "CREATE" }, "__", "PrivateScalarFunction.SUBx1", "__", { literal: "FUNCTION" }, "__", { token: "word" }, { literal: "(" }, "PrivateScalarFunction.RPT01x1", { literal: ")" }, "__", { literal: "RETURNS" }, "__", { token: "dataType" }, "__", { literal: "AS" }, "_", { literal: "(" }, { literal: ")" }, { literal: ";" } ] }
                ],
                "PrivateScalarFunction.RPT01x1": [
                    { name: "PrivateScalarFunction.RPT01x1", postprocess: ({data}) => data[0], symbols: [ "FunctionParams" ] },
                    { name: "PrivateScalarFunction.RPT01x1", postprocess: () => null, symbols: [ ] }
                ],
                "PrivateScalarFunction.SUBx1": [
                    { name: "PrivateScalarFunction.SUBx1", symbols: [ { literal: "TEMP" } ] },
                    { name: "PrivateScalarFunction.SUBx1", symbols: [ { literal: "PRIVATE" } ] }
                ],
                PublicScalarFunction: [
                    { name: "PublicScalarFunction", symbols: [ { literal: "CREATE" }, "__", { literal: "PUBLIC" }, "__", { literal: "FUNCTION" }, "__", { token: "word" }, { literal: "(" }, "PublicScalarFunction.RPT01x1", { literal: ")" }, "__", { literal: "RETURNS" }, "__", { token: "dataType" }, "__", { literal: "AS" }, "_", { literal: "(" }, { literal: ")" }, { literal: ";" } ] }
                ],
                "PublicScalarFunction.RPT01x1": [
                    { name: "PublicScalarFunction.RPT01x1", postprocess: ({data}) => data[0], symbols: [ "FunctionParams" ] },
                    { name: "PublicScalarFunction.RPT01x1", postprocess: () => null, symbols: [ ] }
                ],
                QueryRoot: [
                    { name: "QueryRoot", symbols: [ "PrivateScalarFunction" ] },
                    { name: "QueryRoot", symbols: [ "PublicScalarFunction" ] }
                ],
                _: [
                    { name: "_", postprocess: ({data}) => { return (null); }, symbols: [ "_.RPT01x1" ] }
                ],
                "_.RPT01x1": [
                    { name: "_.RPT01x1", postprocess: ({data}) => data[0], symbols: [ { token: "ws" } ] },
                    { name: "_.RPT01x1", postprocess: () => null, symbols: [ ] }
                ],
                __: [
                    { name: "__", postprocess: ({data}) => { return (null); }, symbols: [ { token: "ws" } ] }
                ],
                dummy: [
                    { name: "dummy", symbols: [ { literal: "dummy" } ] }
                ]
            },
            start: "QueryRoot"
        },
        lexer: {
            start: "root",
            states: {
                keywords: {
                    regex: /(?:(?:(var(?![a-zA-Z])))|(?:(function(?![a-zA-Z])))|(?:(true(?![a-zA-Z])))|(?:(false(?![a-zA-Z])))|(?:(null(?![a-zA-Z])))|(?:(and(?![a-zA-Z])))|(?:(or(?![a-zA-Z])))|(?:(on(?![a-zA-Z])))|(?:(if(?![a-zA-Z])))|(?:(in(?![a-zA-Z])))|(?:(each(?![a-zA-Z])))|(?:(else(?![a-zA-Z])))|(?:(for(?![a-zA-Z])))|(?:(not(?![a-zA-Z])))|(?:(while(?![a-zA-Z]))))/ym,
                    rules: [
                        { highlight: "keyword", tag: ["keyword"], when: /var(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /function(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /true(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /false(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /null(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /and(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /or(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /on(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /if(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /in(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /each(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /else(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /for(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /not(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /while(?![a-zA-Z])/ }
                    ]
                },
                root: {
                    regex: /(?:(?:(var(?![a-zA-Z])))|(?:(function(?![a-zA-Z])))|(?:(true(?![a-zA-Z])))|(?:(false(?![a-zA-Z])))|(?:(null(?![a-zA-Z])))|(?:(and(?![a-zA-Z])))|(?:(or(?![a-zA-Z])))|(?:(on(?![a-zA-Z])))|(?:(if(?![a-zA-Z])))|(?:(in(?![a-zA-Z])))|(?:(each(?![a-zA-Z])))|(?:(else(?![a-zA-Z])))|(?:(for(?![a-zA-Z])))|(?:(not(?![a-zA-Z])))|(?:(while(?![a-zA-Z])))|(?:((?:ARRAY)))|(?:((?:BIGNUMERIC)))|(?:((?:BOOL)))|(?:((?:BYTES)))|(?:((?:DATE)))|(?:((?:DATETIME)))|(?:((?:FLOAT64)))|(?:((?:GEOGRAPHY)))|(?:((?:INT64)))|(?:((?:INTERVAL)))|(?:((?:JSON)))|(?:((?:NUMERIC)))|(?:((?:RANGE)))|(?:((?:STRING)))|(?:((?:STRUCT)))|(?:((?:TIME)))|(?:((?:TIMESTAMP)))|(?:(\d+))|(?:("(?:\\["bfnrt\/\\]|\\u[a-fA-F0-9]{4}|[^"\\])*"))|(?:(\/(?:[^\/\\\r\n]|\\.)+\/[gmiy]*))|(?:([_a-zA-Z][_a-zA-Z\d]*))|(?:((?:==)))|(?:((?:>=)))|(?:((?:<=)))|(?:((?:=)))|(?:((?:>)))|(?:((?:<)))|(?:((?:\+)))|(?:((?:\-)))|(?:((?:\/)))|(?:((?:%)))|(?:((?:\*)))|(?:((?:\^)))|(?:((?:;)))|(?:((?::)))|(?:((?:!)))|(?:((?:\.)))|(?:((?:,)))|(?:((?:\$)))|(?:((?:\()))|(?:((?:\))))|(?:((?:\{)))|(?:((?:\})))|(?:((?:\[)))|(?:((?:\])))|(?:(\s+)))/ym,
                    rules: [
                        { highlight: "keyword", tag: ["keyword"], when: /var(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /function(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /true(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /false(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /null(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /and(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /or(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /on(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /if(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /in(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /each(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /else(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /for(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /not(?![a-zA-Z])/ },
                        { highlight: "keyword", tag: ["keyword"], when: /while(?![a-zA-Z])/ },
                        { highlight: "array", tag: ["dataType"], when: "ARRAY" },
                        { highlight: "bignumeric", tag: ["dataType"], when: "BIGNUMERIC" },
                        { highlight: "bool", tag: ["dataType"], when: "BOOL" },
                        { highlight: "bytes", tag: ["dataType"], when: "BYTES" },
                        { highlight: "date", tag: ["dataType"], when: "DATE" },
                        { highlight: "datetime", tag: ["dataType"], when: "DATETIME" },
                        { highlight: "float64", tag: ["dataType"], when: "FLOAT64" },
                        { highlight: "geography", tag: ["dataType"], when: "GEOGRAPHY" },
                        { highlight: "int64", tag: ["dataType"], when: "INT64" },
                        { highlight: "interval", tag: ["dataType"], when: "INTERVAL" },
                        { highlight: "json", tag: ["dataType"], when: "JSON" },
                        { highlight: "numeric", tag: ["dataType"], when: "NUMERIC" },
                        { highlight: "range", tag: ["dataType"], when: "RANGE" },
                        { highlight: "string", tag: ["dataType"], when: "STRING" },
                        { highlight: "struct", tag: ["dataType"], when: "STRUCT" },
                        { highlight: "time", tag: ["dataType"], when: "TIME" },
                        { highlight: "timestamp", tag: ["dataType"], when: "TIMESTAMP" },
                        { highlight: "number", tag: ["digits"], when: /\d+/ },
                        { tag: ["string"], when: /"(?:\\["bfnrt\/\\]|\\u[a-fA-F0-9]{4}|[^"\\])*"/ },
                        { highlight: "regexp", tag: ["regex"], when: /\/(?:[^\/\\\r\n]|\\.)+\/[gmiy]*/ },
                        { tag: ["word"], when: /[_a-zA-Z][_a-zA-Z\d]*/ },
                        { highlight: "keyword", tag: ["l_eqeq"], when: "==" },
                        { highlight: "keyword", tag: ["l_gteq"], when: ">=" },
                        { highlight: "keyword", tag: ["l_lteq"], when: "<=" },
                        { tag: ["l_eq"], when: "=" },
                        { highlight: "keyword", tag: ["l_gt"], when: ">" },
                        { highlight: "keyword", tag: ["l_lt"], when: "<" },
                        { highlight: "keyword", tag: ["l_add"], when: "+" },
                        { highlight: "keyword", tag: ["l_sub"], when: "-" },
                        { highlight: "keyword", tag: ["l_div"], when: "/" },
                        { highlight: "keyword", tag: ["l_mod"], when: "%" },
                        { highlight: "keyword", tag: ["l_mul"], when: "*" },
                        { highlight: "keyword", tag: ["l_exp"], when: "^" },
                        { highlight: "keyword", tag: ["l_semi"], when: ";" },
                        { highlight: "keyword", tag: ["l_col"], when: ":" },
                        { highlight: "keyword", tag: ["l_exc"], when: "!" },
                        { tag: ["l_dot"], when: "." },
                        { highlight: "delimiter", tag: ["l_comma"], when: "," },
                        { highlight: "keyword", tag: ["l_m"], when: "$" },
                        { highlight: "delimiter", tag: ["l_lparen"], when: "(" },
                        { highlight: "delimiter", tag: ["l_rparen"], when: ")" },
                        { highlight: "delimiter", tag: ["l_lcurly"], when: "{" },
                        { highlight: "delimiter", tag: ["l_rcurly"], when: "}" },
                        { highlight: "delimiter", tag: ["l_lbrack"], when: "[" },
                        { highlight: "delimiter", tag: ["l_rbrack"], when: "]" },
                        { tag: ["ws"], when: /\s+/ }
                    ]
                }
            }
        }
    }
    constructor(){}
}

export default grammar;