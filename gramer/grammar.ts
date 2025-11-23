// Generated automatically by Grammar-Well, version 2.0.7 
// https://github.com/0x6563/grammar-well
// @ts-nocheck



class grammar {
    state = {};
    artifacts = {
        grammar: {
            rules: {
                Array: [
                    { name: "Array", postprocess: ({data}) => { return ({ type:'array', value: data[2] }); }, symbols: [ { literal: "[" }, "_", "ExpList", "_", { literal: "]" } ] },
                    { name: "Array", postprocess: ({data}) => { return ({ type: 'array', value: [] }); }, symbols: [ { literal: "[" }, "_", { literal: "]" } ] }
                ],
                Assignment: [
                    { name: "Assignment", postprocess: ({data}) => { return ({ type: 'assign', target: data[0],  value: data[4] }); }, symbols: [ "Reference", "_", { literal: "=" }, "_", "Exp", "_", { literal: ";" } ] },
                    { name: "Assignment", postprocess: ({data}) => { return ({ type: 'assign', adjust: data[2].value, target: data[0],  value: data[5] }); }, symbols: [ "Reference", "_", { literal: "+" }, { literal: "=" }, "_", "Exp", "_", { literal: ";" } ] },
                    { name: "Assignment", postprocess: ({data}) => { return ({ type: 'assign', adjust: data[2].value, target: data[0],  value: data[5] }); }, symbols: [ "Reference", "_", { literal: "-" }, { literal: "=" }, "_", "Exp", "_", { literal: ";" } ] },
                    { name: "Assignment", postprocess: ({data}) => { return ({ type: 'assign', adjust: data[2].value, target: data[0],  value: data[5] }); }, symbols: [ "Reference", "_", { literal: "/" }, { literal: "=" }, "_", "Exp", "_", { literal: ";" } ] },
                    { name: "Assignment", postprocess: ({data}) => { return ({ type: 'assign', adjust: data[2].value, target: data[0],  value: data[5] }); }, symbols: [ "Reference", "_", { literal: "*" }, { literal: "=" }, "_", "Exp", "_", { literal: ";" } ] },
                    { name: "Assignment", postprocess: ({data}) => { return ({ type: 'assign', adjust: data[2].value, target: data[0],  value: data[5] }); }, symbols: [ "Reference", "_", { literal: "%" }, { literal: "=" }, "_", "Exp", "_", { literal: ";" } ] }
                ],
                Atom: [
                    { name: "Atom", postprocess: ({data}) => { return (data[0]); }, symbols: [ "Number" ] },
                    { name: "Atom", postprocess: ({data}) => { return (data[0]); }, symbols: [ "NegativeNumber" ] },
                    { name: "Atom", postprocess: ({data}) => { return (data[0]); }, symbols: [ "String" ] },
                    { name: "Atom", postprocess: ({data}) => { return (data[0]); }, symbols: [ "Constant" ] },
                    { name: "Atom", postprocess: ({data}) => { return (data[0]); }, symbols: [ "Regex" ] },
                    { name: "Atom", postprocess: ({data}) => { return (data[0]); }, symbols: [ "Reference" ] },
                    { name: "Atom", postprocess: ({data}) => { return (data[0]); }, symbols: [ "Group" ] },
                    { name: "Atom", postprocess: ({data}) => { return (data[0]); }, symbols: [ "FunctionCall" ] },
                    { name: "Atom", postprocess: ({data}) => { return (data[0]); }, symbols: [ "Object" ] },
                    { name: "Atom", postprocess: ({data}) => { return (data[0]); }, symbols: [ "Array" ] }
                ],
                Block: [
                    { name: "Block", postprocess: ({data}) => { return (data[2]); }, symbols: [ { literal: "{" }, "_", "Statements", "_", { literal: "}" } ] },
                    { name: "Block", postprocess: ({data}) => { return ([]); }, symbols: [ { literal: "{" }, "_", { literal: "}" } ] }
                ],
                Chunk: [
                    { name: "Chunk", postprocess: ({data}) => { return ({ statements: data[1] }); }, symbols: [ "_", "Statements", "_" ] }
                ],
                Constant: [
                    { name: "Constant", postprocess: ({data}) => { return (data[0].value); }, symbols: [ { literal: "null" } ] },
                    { name: "Constant", postprocess: ({data}) => { return (data[0].value); }, symbols: [ { literal: "false" } ] },
                    { name: "Constant", postprocess: ({data}) => { return (data[0].value); }, symbols: [ { literal: "true" } ] }
                ],
                DeclareFunction: [
                    { name: "DeclareFunction", postprocess: ({data}) => { return ({ type: "declare", typeof: 'function', name: data[2], args: data[6], block: data[10] }); }, symbols: [ { literal: "function" }, "_", "Word", "_", { literal: "(" }, "_", "WordList", "_", { literal: ")" }, "_", "Block" ] },
                    { name: "DeclareFunction", postprocess: ({data}) => { return ({ type: "declare", typeof: 'function', name: data[2], args: [], block: data[8] }); }, symbols: [ { literal: "function" }, "_", "Word", "_", { literal: "(" }, "_", { literal: ")" }, "_", "Block" ] }
                ],
                DeclareVar: [
                    { name: "DeclareVar", postprocess: ({data}) => { return ({ type: 'declare', typeof: data[0].value, target: data[2], value: data[6] }); }, symbols: [ { literal: "var" }, "__", "Word", "_", { literal: "=" }, "_", "Exp", "_", { literal: ";" } ] }
                ],
                EachBlock: [
                    { name: "EachBlock", postprocess: ({data}) => { return ({ type: 'each', key: data[2], reference: data[6], statements: data[8] }); }, symbols: [ { literal: "each" }, "__", "Word", "__", { literal: "in" }, "_", "Reference", "_", "Block" ] },
                    { name: "EachBlock", postprocess: ({data}) => { return ({ type: 'each', key: data[2], value:data[6], reference: data[10], statements: data[12] }); }, symbols: [ { literal: "each" }, "__", "Word", "_", { literal: "," }, "_", "Word", "__", { literal: "in" }, "_", "Reference", "_", "Block" ] }
                ],
                Exp: [
                    { name: "Exp", postprocess: ({data}) => { return (data[0]); }, symbols: [ "ExpOr" ] }
                ],
                ExpAnd: [
                    { name: "ExpAnd", postprocess: ({data}) => { return ({ type: 'logical', operator: data[2].value, left: data[0], right: data[4] }); }, symbols: [ "ExpAnd", "_", { literal: "and" }, "_", "ExpComparison" ] },
                    { name: "ExpAnd", postprocess: ({data}) => { return (data[0]); }, symbols: [ "ExpComparison" ] }
                ],
                ExpComparison: [
                    { name: "ExpComparison", postprocess: ({data}) => { return ({ type: 'compare', operator: data[2].value, left: data[0], right: data[4] }); }, symbols: [ "ExpComparison", "_", { literal: "<" }, "_", "ExpConcatenation" ] },
                    { name: "ExpComparison", postprocess: ({data}) => { return ({ type: 'compare', operator: data[2].value, left: data[0], right: data[4] }); }, symbols: [ "ExpComparison", "_", { literal: ">" }, "_", "ExpConcatenation" ] },
                    { name: "ExpComparison", postprocess: ({data}) => { return ({ type: 'compare', operator: data[2].value, left: data[0], right: data[4] }); }, symbols: [ "ExpComparison", "_", { literal: "<=" }, "_", "ExpConcatenation" ] },
                    { name: "ExpComparison", postprocess: ({data}) => { return ({ type: 'compare', operator: data[2].value, left: data[0], right: data[4] }); }, symbols: [ "ExpComparison", "_", { literal: ">=" }, "_", "ExpConcatenation" ] },
                    { name: "ExpComparison", postprocess: ({data}) => { return ({ type: 'compare', operator: data[2].value, left: data[0], right: data[4] }); }, symbols: [ "ExpComparison", "_", { literal: "!=" }, "_", "ExpConcatenation" ] },
                    { name: "ExpComparison", postprocess: ({data}) => { return ({ type: 'compare', operator: data[2].value, left: data[0], right: data[4] }); }, symbols: [ "ExpComparison", "_", { literal: "==" }, "_", "ExpConcatenation" ] },
                    { name: "ExpComparison", postprocess: ({data}) => { return (data[0]); }, symbols: [ "ExpConcatenation" ] }
                ],
                ExpConcatenation: [
                    { name: "ExpConcatenation", symbols: [ "ExpSum", "_", { literal: ".." }, "_", "ExpConcatenation" ] },
                    { name: "ExpConcatenation", postprocess: ({data}) => { return (data[0]); }, symbols: [ "ExpSum" ] }
                ],
                ExpList: [
                    { name: "ExpList", postprocess: ({data}) => { return ([ data[0] ]); }, symbols: [ "Exp" ] },
                    { name: "ExpList", postprocess: ({data}) => { return (data[0].concat(data[4])); }, symbols: [ "ExpList", "_", { literal: "," }, "_", "Exp" ] }
                ],
                ExpOr: [
                    { name: "ExpOr", postprocess: ({data}) => { return ({ type: 'logical', operator: data[2].value, left: data[0], right: data[4] }); }, symbols: [ "ExpOr", "_", { literal: "or" }, "_", "ExpAnd" ] },
                    { name: "ExpOr", postprocess: ({data}) => { return (data[0]); }, symbols: [ "ExpAnd" ] }
                ],
                ExpPow: [
                    { name: "ExpPow", postprocess: ({data}) => { return ({ type: 'compare', operator: data[2].value, left: data[0], right: data[4] }); }, symbols: [ "Atom", "_", { literal: "^" }, "_", "ExpPow" ] },
                    { name: "ExpPow", postprocess: ({data}) => { return (data[0]); }, symbols: [ "Atom" ] }
                ],
                ExpProduct: [
                    { name: "ExpProduct", postprocess: ({data}) => { return ({ type: 'math', operator: data[2].value, left: data[0], right: data[4] }); }, symbols: [ "ExpProduct", "_", { literal: "*" }, "_", "ExpUnary" ] },
                    { name: "ExpProduct", postprocess: ({data}) => { return ({ type: 'math', operator: data[2].value, left: data[0], right: data[4] }); }, symbols: [ "ExpProduct", "_", { literal: "/" }, "_", "ExpUnary" ] },
                    { name: "ExpProduct", postprocess: ({data}) => { return ({ type: 'math', operator: data[2].value, left: data[0], right: data[4] }); }, symbols: [ "ExpProduct", "_", { literal: "%" }, "_", "ExpUnary" ] },
                    { name: "ExpProduct", postprocess: ({data}) => { return (data[0]); }, symbols: [ "ExpUnary" ] }
                ],
                ExpSum: [
                    { name: "ExpSum", postprocess: ({data}) => { return ({ type: 'math', operator: data[2].value, left: data[0], right: data[4] }); }, symbols: [ "ExpSum", "_", { literal: "+" }, "_", "ExpProduct" ] },
                    { name: "ExpSum", postprocess: ({data}) => { return ({ type: 'math', operator: data[2].value, left: data[0], right: data[4] }); }, symbols: [ "ExpSum", "_", { literal: "-" }, "_", "ExpProduct" ] },
                    { name: "ExpSum", postprocess: ({data}) => { return (data[0]); }, symbols: [ "ExpProduct" ] }
                ],
                ExpUnary: [
                    { name: "ExpUnary", postprocess: ({data}) => { return ({type:'negate', value: data[2]}); }, symbols: [ { literal: "!" }, "_", "ExpPow" ] },
                    { name: "ExpUnary", postprocess: ({data}) => { return ({type:'negate', value: data[2]}); }, symbols: [ { literal: "not" }, "_", "ExpPow" ] },
                    { name: "ExpUnary", postprocess: ({data}) => { return (data[0]); }, symbols: [ "ExpPow" ] }
                ],
                FunctionCall: [
                    { name: "FunctionCall", postprocess: ({data}) => { return ({ type: 'call', name: data[0], args:data[4] }); }, symbols: [ "Word", "_", { literal: "(" }, "_", "ExpList", "_", { literal: ")" } ] },
                    { name: "FunctionCall", postprocess: ({data}) => { return ({ type: 'call', name: data[0], args: [] }); }, symbols: [ "Word", "_", { literal: "(" }, "_", { literal: ")" } ] }
                ],
                FunctionParam: [
                    { name: "FunctionParam", symbols: [ { token: "word" }, "__", { token: "dataType" } ] }
                ],
                FunctionParams: [
                    { name: "FunctionParams", symbols: [ "FunctionParam" ] },
                    { name: "FunctionParams", symbols: [ "FunctionParams", { literal: "," }, "__", "FunctionParam" ] }
                ],
                Group: [
                    { name: "Group", postprocess: ({data}) => { return ({ type: 'group', expression: data[2] }); }, symbols: [ { literal: "(" }, "_", "Exp", "_", { literal: ")" } ] }
                ],
                IfBlock: [
                    { name: "IfBlock", postprocess: ({data}) => { return ([{ condition: data[2], statements: data[4] }]); }, symbols: [ { literal: "if" }, "_", "Exp", "_", "Block" ] },
                    { name: "IfBlock", postprocess: ({data}) => { return (data[0].concat(data[4])); }, symbols: [ "IfBlock", "_", { literal: "else" }, "_", "IfBlock" ] }
                ],
                KV: [
                    { name: "KV", postprocess: ({data}) => { return ({ type:"kv", key: data[0], value: data[4] }); }, symbols: [ "Word", "_", { literal: ":" }, "_", "Exp" ] },
                    { name: "KV", postprocess: ({data}) => { return ({ type:"kv", key: data[0].value, value: data[4] }); }, symbols: [ "String", "_", { literal: ":" }, "_", "Exp" ] },
                    { name: "KV", postprocess: ({data}) => { return ({ type:"kv", key: data[0], value: data[0] }); }, symbols: [ "Word" ] }
                ],
                KVList: [
                    { name: "KVList", postprocess: ({data}) => { return ([ data[0] ]); }, symbols: [ "KV" ] },
                    { name: "KVList", postprocess: ({data}) => { return (data[0].concat(data[4])); }, symbols: [ "KVList", "_", { literal: "," }, "_", "KV" ] }
                ],
                LoopBlock: [
                    { name: "LoopBlock", postprocess: ({data}) => { return ({ type: 'for', start: data[4], end: data[10], condition: data[6], block: data[14] }); }, symbols: [ { literal: "for" }, "_", { literal: "(" }, "_", "DeclareVar", "_", "Exp", "_", { literal: ";" }, "_", "Assignment", "_", { literal: ")" }, "_", "Block" ] }
                ],
                NegativeNumber: [
                    { name: "NegativeNumber", postprocess: ({data}) => { return ({ type: 'number', value: '-' +data[2].value }); }, symbols: [ { literal: "-" }, "_", "Number" ] }
                ],
                Number: [
                    { name: "Number", postprocess: ({data}) => { return ({ type:'number', value: data[0].value  + "." + data[2].value }); }, symbols: [ { token: "digits" }, { literal: "." }, { token: "digits" } ] },
                    { name: "Number", postprocess: ({data}) => { return ({ type:'number', value: data[0].value }); }, symbols: [ { token: "digits" } ] }
                ],
                Object: [
                    { name: "Object", postprocess: ({data}) => { return ({ type: 'object', value: data[2] }); }, symbols: [ { literal: "{" }, "_", "KVList", "_", { literal: "}" } ] },
                    { name: "Object", postprocess: ({data}) => { return ({ type: 'array', value: [] }); }, symbols: [ { literal: "{" }, "_", { literal: "}" } ] }
                ],
                Path: [
                    { name: "Path", postprocess: ({data}) => { return ([data[0].value]); }, symbols: [ { token: "word" } ] },
                    { name: "Path", postprocess: ({data}) => { return (data[0].concat(data[4].value)); }, symbols: [ "Path", "_", { literal: "." }, "_", { token: "word" } ] },
                    { name: "Path", postprocess: ({data}) => { return (data[0].concat(data[4])); }, symbols: [ "Path", "_", { literal: "[" }, "_", "Exp", "_", { literal: "]" } ] }
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
                Reference: [
                    { name: "Reference", postprocess: ({data}) => { return ({ type: 'reference', path: data[0] }); }, symbols: [ "Path" ] }
                ],
                Regex: [
                    { name: "Regex", postprocess: ({data}) => { return ({ type: 'regex', value: data[0].value }); }, symbols: [ { token: "regex" } ] }
                ],
                ScalarExpression: [
                    { name: "ScalarExpression", symbols: [ { token: "word" } ] }
                ],
                Statement: [
                    { name: "Statement", postprocess: ({data}) => { return (data[0]); }, symbols: [ "Assignment" ] },
                    { name: "Statement", postprocess: ({data}) => { return (data[0]); }, symbols: [ "DeclareVar" ] },
                    { name: "Statement", postprocess: ({data}) => { return (data[0]); }, symbols: [ "DeclareFunction" ] },
                    { name: "Statement", postprocess: ({data}) => { return ({ type: "if", statements: data[0] }); }, symbols: [ "IfBlock" ] },
                    { name: "Statement", postprocess: ({data}) => { return ({ type: "if", statements: data[0].concat([{ condition: null, statements: data[4] }])}); }, symbols: [ "IfBlock", "_", { literal: "else" }, "_", "Block" ] },
                    { name: "Statement", postprocess: ({data}) => { return (data[0]); }, symbols: [ "EachBlock" ] },
                    { name: "Statement", postprocess: ({data}) => { return (data[0]); }, symbols: [ "WhileBlock" ] },
                    { name: "Statement", postprocess: ({data}) => { return (data[0]); }, symbols: [ "LoopBlock" ] },
                    { name: "Statement", postprocess: ({data}) => { return (data[0]); }, symbols: [ "FunctionCall" ] }
                ],
                Statements: [
                    { name: "Statements", postprocess: ({data}) => { return ([data[0]]); }, symbols: [ "Statement" ] },
                    { name: "Statements", postprocess: ({data}) => { return (data[0].concat(data[2])); }, symbols: [ "Statements", "_", "Statement" ] }
                ],
                String: [
                    { name: "String", postprocess: ({data}) => { return ({ type: 'string', value: JSON.parse(data[0].value) }); }, symbols: [ { token: "string" } ] }
                ],
                WhileBlock: [
                    { name: "WhileBlock", postprocess: ({data}) => { return ({ type: 'while', condition: data[2], statements: data[4] }); }, symbols: [ { literal: "while" }, "_", "Exp", "_", "Block" ] }
                ],
                Word: [
                    { name: "Word", postprocess: ({data}) => { return (data[0].value); }, symbols: [ { token: "word" } ] }
                ],
                WordList: [
                    { name: "WordList", postprocess: ({data}) => { return ([ data[0] ]); }, symbols: [ "Word" ] },
                    { name: "WordList", postprocess: ({data}) => { return (data[0].concat(data[4])); }, symbols: [ "WordList", "_", { literal: "," }, "_", "Word" ] }
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