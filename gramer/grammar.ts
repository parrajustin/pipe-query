// Generated automatically by Grammar-Well, version 2.0.7 
// https://github.com/0x6563/grammar-well
// @ts-nocheck



class grammar {
    state = {};
    artifacts = {
        grammar: {
            rules: {
                AdditiveExpression: [
                    { name: "AdditiveExpression", symbols: [ "MultiplicativeExpression" ] },
                    { name: "AdditiveExpression", symbols: [ "AdditiveExpression", "__", { literal: "+" }, "__", "MultiplicativeExpression" ] },
                    { name: "AdditiveExpression", symbols: [ "AdditiveExpression", "__", { literal: "-" }, "__", "MultiplicativeExpression" ] }
                ],
                AndExpression: [
                    { name: "AndExpression", symbols: [ "NotExpression" ] },
                    { name: "AndExpression", symbols: [ "AndExpression", "__", { literal: "AND" }, "__", "NotExpression" ] }
                ],
                BitwiseAndExpression: [
                    { name: "BitwiseAndExpression", symbols: [ "BitwiseShiftExpression" ] },
                    { name: "BitwiseAndExpression", symbols: [ "BitwiseAndExpression", "__", { literal: "&" }, "__", "BitwiseShiftExpression" ] }
                ],
                BitwiseOrExpression: [
                    { name: "BitwiseOrExpression", symbols: [ "BitwiseXorExpression" ] },
                    { name: "BitwiseOrExpression", symbols: [ "BitwiseOrExpression", "__", { literal: "|" }, "__", "BitwiseXorExpression" ] }
                ],
                BitwiseShiftExpression: [
                    { name: "BitwiseShiftExpression", symbols: [ "AdditiveExpression" ] },
                    { name: "BitwiseShiftExpression", symbols: [ "BitwiseShiftExpression", "__", { literal: "<<" }, "__", "AdditiveExpression" ] },
                    { name: "BitwiseShiftExpression", symbols: [ "BitwiseShiftExpression", "__", { literal: ">>" }, "__", "AdditiveExpression" ] }
                ],
                BitwiseXorExpression: [
                    { name: "BitwiseXorExpression", symbols: [ "BitwiseAndExpression" ] },
                    { name: "BitwiseXorExpression", symbols: [ "BitwiseXorExpression", "__", { literal: "^" }, "__", "BitwiseAndExpression" ] }
                ],
                ComparisonExpression: [
                    { name: "ComparisonExpression", symbols: [ "BitwiseOrExpression" ] },
                    { name: "ComparisonExpression", symbols: [ "BitwiseOrExpression", "__", "ComparisonOp", "__", "BitwiseOrExpression" ] },
                    { name: "ComparisonExpression", symbols: [ "BitwiseOrExpression", "__", { literal: "IS" }, "__", "ComparisonExpression.RPT01x1", { literal: "NULL" } ] },
                    { name: "ComparisonExpression", symbols: [ "BitwiseOrExpression", "__", { literal: "IS" }, "__", "ComparisonExpression.RPT01x2", { literal: "TRUE" } ] },
                    { name: "ComparisonExpression", symbols: [ "BitwiseOrExpression", "__", { literal: "IS" }, "__", "ComparisonExpression.RPT01x3", { literal: "FALSE" } ] },
                    { name: "ComparisonExpression", symbols: [ "BitwiseOrExpression", "__", "ComparisonExpression.RPT01x4", { literal: "IN" }, "__", { literal: "(" }, "__", "ExpressionList", "__", { literal: ")" } ] },
                    { name: "ComparisonExpression", symbols: [ "BitwiseOrExpression", "__", "ComparisonExpression.RPT01x5", { literal: "LIKE" }, "__", "BitwiseOrExpression" ] },
                    { name: "ComparisonExpression", symbols: [ "BitwiseOrExpression", "__", "ComparisonExpression.RPT01x6", { literal: "BETWEEN" }, "__", "BitwiseOrExpression", "__", { literal: "AND" }, "__", "BitwiseOrExpression" ] }
                ],
                "ComparisonExpression.RPT01x1": [
                    { name: "ComparisonExpression.RPT01x1", postprocess: ({data}) => data[0], symbols: [ "ComparisonExpression.RPT01x1.SUBx1" ] },
                    { name: "ComparisonExpression.RPT01x1", postprocess: () => null, symbols: [ ] }
                ],
                "ComparisonExpression.RPT01x1.SUBx1": [
                    { name: "ComparisonExpression.RPT01x1.SUBx1", symbols: [ { literal: "NOT" }, "__" ] }
                ],
                "ComparisonExpression.RPT01x2": [
                    { name: "ComparisonExpression.RPT01x2", postprocess: ({data}) => data[0], symbols: [ "ComparisonExpression.RPT01x2.SUBx1" ] },
                    { name: "ComparisonExpression.RPT01x2", postprocess: () => null, symbols: [ ] }
                ],
                "ComparisonExpression.RPT01x2.SUBx1": [
                    { name: "ComparisonExpression.RPT01x2.SUBx1", symbols: [ { literal: "NOT" }, "__" ] }
                ],
                "ComparisonExpression.RPT01x3": [
                    { name: "ComparisonExpression.RPT01x3", postprocess: ({data}) => data[0], symbols: [ "ComparisonExpression.RPT01x3.SUBx1" ] },
                    { name: "ComparisonExpression.RPT01x3", postprocess: () => null, symbols: [ ] }
                ],
                "ComparisonExpression.RPT01x3.SUBx1": [
                    { name: "ComparisonExpression.RPT01x3.SUBx1", symbols: [ { literal: "NOT" }, "__" ] }
                ],
                "ComparisonExpression.RPT01x4": [
                    { name: "ComparisonExpression.RPT01x4", postprocess: ({data}) => data[0], symbols: [ "ComparisonExpression.RPT01x4.SUBx1" ] },
                    { name: "ComparisonExpression.RPT01x4", postprocess: () => null, symbols: [ ] }
                ],
                "ComparisonExpression.RPT01x4.SUBx1": [
                    { name: "ComparisonExpression.RPT01x4.SUBx1", symbols: [ { literal: "NOT" }, "__" ] }
                ],
                "ComparisonExpression.RPT01x5": [
                    { name: "ComparisonExpression.RPT01x5", postprocess: ({data}) => data[0], symbols: [ "ComparisonExpression.RPT01x5.SUBx1" ] },
                    { name: "ComparisonExpression.RPT01x5", postprocess: () => null, symbols: [ ] }
                ],
                "ComparisonExpression.RPT01x5.SUBx1": [
                    { name: "ComparisonExpression.RPT01x5.SUBx1", symbols: [ { literal: "NOT" }, "__" ] }
                ],
                "ComparisonExpression.RPT01x6": [
                    { name: "ComparisonExpression.RPT01x6", postprocess: ({data}) => data[0], symbols: [ "ComparisonExpression.RPT01x6.SUBx1" ] },
                    { name: "ComparisonExpression.RPT01x6", postprocess: () => null, symbols: [ ] }
                ],
                "ComparisonExpression.RPT01x6.SUBx1": [
                    { name: "ComparisonExpression.RPT01x6.SUBx1", symbols: [ { literal: "NOT" }, "__" ] }
                ],
                ComparisonOp: [
                    { name: "ComparisonOp", symbols: [ { literal: "=" } ] },
                    { name: "ComparisonOp", symbols: [ { literal: "!=" } ] },
                    { name: "ComparisonOp", symbols: [ { literal: "<>" } ] },
                    { name: "ComparisonOp", symbols: [ { literal: "<" } ] },
                    { name: "ComparisonOp", symbols: [ { literal: "<=" } ] },
                    { name: "ComparisonOp", symbols: [ { literal: ">" } ] },
                    { name: "ComparisonOp", symbols: [ { literal: ">=" } ] }
                ],
                DataType: [
                    { name: "DataType", symbols: [ { literal: "ARRAY" }, "__", { literal: "<" }, "__", "DataType", "__", { literal: ">" } ] },
                    { name: "DataType", symbols: [ { literal: "STRUCT" }, "__", { literal: "<" }, "__", "StructFields", "__", { literal: ">" } ] },
                    { name: "DataType", symbols: [ { literal: "STRING" }, "__", { literal: "(" }, "__", { token: "digits" }, "__", { literal: ")" } ] },
                    { name: "DataType", symbols: [ { literal: "BYTES" }, "__", { literal: "(" }, "__", { token: "digits" }, "__", { literal: ")" } ] },
                    { name: "DataType", symbols: [ { literal: "NUMERIC" }, "__", { literal: "(" }, "__", { token: "digits" }, "__", "DataType.RPT01x1", "__", { literal: ")" } ] },
                    { name: "DataType", symbols: [ { literal: "BIGNUMERIC" }, "__", { literal: "(" }, "__", { token: "digits" }, "__", "DataType.RPT01x2", "__", { literal: ")" } ] },
                    { name: "DataType", symbols: [ { literal: "BOOL" } ] },
                    { name: "DataType", symbols: [ { literal: "DATE" } ] },
                    { name: "DataType", symbols: [ { literal: "DATETIME" } ] },
                    { name: "DataType", symbols: [ { literal: "FLOAT64" } ] },
                    { name: "DataType", symbols: [ { literal: "GEOGRAPHY" } ] },
                    { name: "DataType", symbols: [ { literal: "INT64" } ] },
                    { name: "DataType", symbols: [ { literal: "INTERVAL" } ] },
                    { name: "DataType", symbols: [ { literal: "JSON" } ] },
                    { name: "DataType", symbols: [ { literal: "NUMERIC" } ] },
                    { name: "DataType", symbols: [ { literal: "RANGE" } ] },
                    { name: "DataType", symbols: [ { literal: "STRING" } ] },
                    { name: "DataType", symbols: [ { literal: "STRUCT" } ] },
                    { name: "DataType", symbols: [ { literal: "TIME" } ] },
                    { name: "DataType", symbols: [ { literal: "TIMESTAMP" } ] }
                ],
                "DataType.RPT01x1": [
                    { name: "DataType.RPT01x1", postprocess: ({data}) => data[0], symbols: [ "DataType.RPT01x1.SUBx1" ] },
                    { name: "DataType.RPT01x1", postprocess: () => null, symbols: [ ] }
                ],
                "DataType.RPT01x1.SUBx1": [
                    { name: "DataType.RPT01x1.SUBx1", symbols: [ { literal: "," }, "__", { token: "digits" } ] }
                ],
                "DataType.RPT01x2": [
                    { name: "DataType.RPT01x2", postprocess: ({data}) => data[0], symbols: [ "DataType.RPT01x2.SUBx1" ] },
                    { name: "DataType.RPT01x2", postprocess: () => null, symbols: [ ] }
                ],
                "DataType.RPT01x2.SUBx1": [
                    { name: "DataType.RPT01x2.SUBx1", symbols: [ { literal: "," }, "__", { token: "digits" } ] }
                ],
                Expression: [
                    { name: "Expression", symbols: [ "OrExpression" ] }
                ],
                ExpressionList: [
                    { name: "ExpressionList", symbols: [ "Expression", "ExpressionList.RPT0Nx1" ] }
                ],
                "ExpressionList.RPT0Nx1": [
                    { name: "ExpressionList.RPT0Nx1", symbols: [ ] },
                    { name: "ExpressionList.RPT0Nx1", postprocess: ({data}) => data[0].concat([data[1]]), symbols: [ "ExpressionList.RPT0Nx1", "ExpressionList.RPT0Nx1.SUBx1" ] }
                ],
                "ExpressionList.RPT0Nx1.SUBx1": [
                    { name: "ExpressionList.RPT0Nx1.SUBx1", symbols: [ { literal: "," }, "__", "Expression" ] }
                ],
                FunctionParam: [
                    { name: "FunctionParam", symbols: [ { token: "word" }, "__", "DataType" ] }
                ],
                FunctionParams: [
                    { name: "FunctionParams", symbols: [ "FunctionParam" ] },
                    { name: "FunctionParams", symbols: [ "FunctionParams", { literal: "," }, "__", "FunctionParam" ] }
                ],
                Identifier: [
                    { name: "Identifier", symbols: [ { token: "word" } ] }
                ],
                Literal: [
                    { name: "Literal", symbols: [ { token: "digits" } ] },
                    { name: "Literal", symbols: [ { token: "string" } ] }
                ],
                MultiplicativeExpression: [
                    { name: "MultiplicativeExpression", symbols: [ "UnaryExpression" ] },
                    { name: "MultiplicativeExpression", symbols: [ "MultiplicativeExpression", "__", { literal: "*" }, "__", "UnaryExpression" ] },
                    { name: "MultiplicativeExpression", symbols: [ "MultiplicativeExpression", "__", { literal: "/" }, "__", "UnaryExpression" ] },
                    { name: "MultiplicativeExpression", symbols: [ "MultiplicativeExpression", "__", { literal: "||" }, "__", "UnaryExpression" ] }
                ],
                NotExpression: [
                    { name: "NotExpression", symbols: [ { literal: "NOT" }, "__", "NotExpression" ] },
                    { name: "NotExpression", symbols: [ "ComparisonExpression" ] }
                ],
                OrExpression: [
                    { name: "OrExpression", symbols: [ "AndExpression" ] },
                    { name: "OrExpression", symbols: [ "OrExpression", "__", { literal: "OR" }, "__", "AndExpression" ] }
                ],
                PostfixExpression: [
                    { name: "PostfixExpression", symbols: [ "PrimaryExpression" ] },
                    { name: "PostfixExpression", symbols: [ "PostfixExpression", { literal: "." }, { token: "word" } ] },
                    { name: "PostfixExpression", symbols: [ "PostfixExpression", { literal: "[" }, "__", "Expression", "__", { literal: "]" } ] },
                    { name: "PostfixExpression", symbols: [ "PostfixExpression", { literal: "[" }, "__", { literal: "OFFSET" }, { literal: "(" }, "__", "Expression", "__", { literal: ")" }, "__", { literal: "]" } ] },
                    { name: "PostfixExpression", symbols: [ "PostfixExpression", { literal: "[" }, "__", { literal: "ORDINAL" }, { literal: "(" }, "__", "Expression", "__", { literal: ")" }, "__", { literal: "]" } ] }
                ],
                PrimaryExpression: [
                    { name: "PrimaryExpression", symbols: [ "Literal" ] },
                    { name: "PrimaryExpression", symbols: [ "Identifier" ] },
                    { name: "PrimaryExpression", symbols: [ { literal: "(" }, "_", "Expression", "_", { literal: ")" } ] },
                    { name: "PrimaryExpression", symbols: [ { literal: "CAST" }, { literal: "(" }, "__", "Expression", "__", { literal: "AS" }, "__", "DataType", "__", { literal: ")" } ] }
                ],
                PrivateScalarFunction: [
                    { name: "PrivateScalarFunction", symbols: [ { literal: "CREATE" }, "_", "PrivateScalarFunction.SUBx1", "_", { literal: "FUNCTION" }, "_", { token: "word" }, { literal: "(" }, "PrivateScalarFunction.RPT01x1", { literal: ")" }, "_", { literal: "RETURNS" }, "_", "DataType", "_", { literal: "AS" }, "_", { literal: "(" }, "_", "Expression", "_", { literal: ")" }, { literal: ";" } ] }
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
                    { name: "PublicScalarFunction", symbols: [ { literal: "CREATE" }, "_", { literal: "PUBLIC" }, "_", { literal: "FUNCTION" }, "_", { token: "word" }, { literal: "(" }, "PublicScalarFunction.RPT01x1", { literal: ")" }, "_", { literal: "RETURNS" }, "_", "DataType", "_", { literal: "AS" }, "_", { literal: "(" }, { literal: ")" }, { literal: ";" } ] }
                ],
                "PublicScalarFunction.RPT01x1": [
                    { name: "PublicScalarFunction.RPT01x1", postprocess: ({data}) => data[0], symbols: [ "FunctionParams" ] },
                    { name: "PublicScalarFunction.RPT01x1", postprocess: () => null, symbols: [ ] }
                ],
                StructField: [
                    { name: "StructField", symbols: [ { token: "word" }, "__", "DataType" ] },
                    { name: "StructField", symbols: [ "DataType" ] }
                ],
                StructFields: [
                    { name: "StructFields", symbols: [ "StructField", "StructFields.RPT0Nx1" ] }
                ],
                "StructFields.RPT0Nx1": [
                    { name: "StructFields.RPT0Nx1", symbols: [ ] },
                    { name: "StructFields.RPT0Nx1", postprocess: ({data}) => data[0].concat([data[1]]), symbols: [ "StructFields.RPT0Nx1", "StructFields.RPT0Nx1.SUBx1" ] }
                ],
                "StructFields.RPT0Nx1.SUBx1": [
                    { name: "StructFields.RPT0Nx1.SUBx1", symbols: [ { literal: "," }, "__", "StructField" ] }
                ],
                UnaryExpression: [
                    { name: "UnaryExpression", symbols: [ { literal: "+" }, "__", "UnaryExpression" ] },
                    { name: "UnaryExpression", symbols: [ { literal: "-" }, "__", "UnaryExpression" ] },
                    { name: "UnaryExpression", symbols: [ { literal: "~" }, "__", "UnaryExpression" ] },
                    { name: "UnaryExpression", symbols: [ "PostfixExpression" ] }
                ],
                _: [
                    { name: "_", symbols: [ "_.RPT0Nx1" ] }
                ],
                "_.RPT0Nx1": [
                    { name: "_.RPT0Nx1", symbols: [ ] },
                    { name: "_.RPT0Nx1", postprocess: ({data}) => data[0].concat([data[1]]), symbols: [ "_.RPT0Nx1", "_.RPT0Nx1.SUBx1" ] }
                ],
                "_.RPT0Nx1.SUBx1": [
                    { name: "_.RPT0Nx1.SUBx1", symbols: [ "__" ] },
                    { name: "_.RPT0Nx1.SUBx1", symbols: [ { token: "comment" } ] },
                    { name: "_.RPT0Nx1.SUBx1", symbols: [ { token: "newline" } ] }
                ],
                __: [
                    { name: "__", postprocess: ({data}) => { return (null); }, symbols: [ { token: "ws" } ] }
                ],
                dummy: [
                    { name: "dummy", symbols: [ { literal: "dummy" } ] }
                ],
                main: [
                    { name: "main", postprocess: ({data}) => { return (data[1]); }, symbols: [ "_", "section_list", "_" ] }
                ],
                section: [
                    { name: "section", symbols: [ "PrivateScalarFunction" ] },
                    { name: "section", symbols: [ "PublicScalarFunction" ] }
                ],
                section_list: [
                    { name: "section_list", postprocess: ({data}) => { return ([data[0]]); }, symbols: [ "section" ] },
                    { name: "section_list", postprocess: ({data}) => { return (data[0].concat(data[2])); }, symbols: [ "section_list", "separator", "section" ] }
                ],
                separator: [
                    { name: "separator", symbols: [ "separator.RPT1Nx1" ] }
                ],
                "separator.RPT1Nx1": [
                    { name: "separator.RPT1Nx1", symbols: [ "separator.RPT1Nx1.SUBx1" ] },
                    { name: "separator.RPT1Nx1", postprocess: ({data}) => data[0].concat([data[1]]), symbols: [ "separator.RPT1Nx1", "separator.RPT1Nx1.SUBx2" ] }
                ],
                "separator.RPT1Nx1.SUBx1": [
                    { name: "separator.RPT1Nx1.SUBx1", symbols: [ "__" ] },
                    { name: "separator.RPT1Nx1.SUBx1", symbols: [ { token: "comment" } ] },
                    { name: "separator.RPT1Nx1.SUBx1", symbols: [ { token: "newline" } ] }
                ],
                "separator.RPT1Nx1.SUBx2": [
                    { name: "separator.RPT1Nx1.SUBx2", symbols: [ "__" ] },
                    { name: "separator.RPT1Nx1.SUBx2", symbols: [ { token: "comment" } ] },
                    { name: "separator.RPT1Nx1.SUBx2", symbols: [ { token: "newline" } ] }
                ]
            },
            start: "main"
        },
        lexer: {
            start: "root",
            states: {
                keywords: {
                    regex: /(?:(?:(var\b))|(?:(function\b))|(?:(true\b))|(?:(false\b))|(?:(null\b))|(?:(and\b))|(?:(or\b))|(?:(on\b))|(?:(if\b))|(?:(in\b))|(?:(each\b))|(?:(else\b))|(?:(for\b))|(?:(not\b))|(?:(while\b))|(?:(IS\b))|(?:(IN\b))|(?:(LIKE\b))|(?:(BETWEEN\b))|(?:(AND\b))|(?:(OR\b))|(?:(NOT\b))|(?:(TRUE\b))|(?:(FALSE\b))|(?:(NULL\b))|(?:(CASE\b))|(?:(WHEN\b))|(?:(THEN\b))|(?:(ELSE\b))|(?:(END\b))|(?:(IF\b))|(?:(COALESCE\b))|(?:(NULLIF\b))|(?:(STRUCT\b))|(?:(ARRAY\b))|(?:(EXTRACT\b))|(?:(CAST\b)))/ym,
                    rules: [
                        { highlight: "keyword", tag: ["keyword"], when: /var\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /function\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /true\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /false\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /null\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /and\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /or\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /on\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /if\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /in\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /each\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /else\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /for\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /not\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /while\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /IS\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /IN\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /LIKE\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /BETWEEN\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /AND\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /OR\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /NOT\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /TRUE\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /FALSE\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /NULL\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /CASE\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /WHEN\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /THEN\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /ELSE\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /END\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /IF\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /COALESCE\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /NULLIF\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /STRUCT\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /ARRAY\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /EXTRACT\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /CAST\b/ }
                    ]
                },
                root: {
                    regex: /(?:(?:(--[^\n]*))|(?:(\/\*[\s\S]*?\*\/))|(?:(\n))|(?:(var\b))|(?:(function\b))|(?:(true\b))|(?:(false\b))|(?:(null\b))|(?:(and\b))|(?:(or\b))|(?:(on\b))|(?:(if\b))|(?:(in\b))|(?:(each\b))|(?:(else\b))|(?:(for\b))|(?:(not\b))|(?:(while\b))|(?:(IS\b))|(?:(IN\b))|(?:(LIKE\b))|(?:(BETWEEN\b))|(?:(AND\b))|(?:(OR\b))|(?:(NOT\b))|(?:(TRUE\b))|(?:(FALSE\b))|(?:(NULL\b))|(?:(CASE\b))|(?:(WHEN\b))|(?:(THEN\b))|(?:(ELSE\b))|(?:(END\b))|(?:(IF\b))|(?:(COALESCE\b))|(?:(NULLIF\b))|(?:(STRUCT\b))|(?:(ARRAY\b))|(?:(EXTRACT\b))|(?:(CAST\b))|(?:(\d+))|(?:("(?:\\["bfnrt\/\\]|\\u[a-fA-F0-9]{4}|[^"\\])*"))|(?:(\/(?:[^\/\\\r\n]|\\.)+\/[gmiy]*))|(?:([_a-zA-Z][_a-zA-Z\d]*))|(?:((?:==)))|(?:((?:>=)))|(?:((?:<=)))|(?:((?:=)))|(?:((?:>)))|(?:((?:<)))|(?:((?:\+)))|(?:((?:\-)))|(?:((?:\/)))|(?:((?:%)))|(?:((?:\*)))|(?:((?:\^)))|(?:((?:;)))|(?:((?::)))|(?:((?:!)))|(?:((?:&)))|(?:((?:\|)))|(?:((?:\.)))|(?:((?:,)))|(?:((?:\$)))|(?:((?:\()))|(?:((?:\))))|(?:((?:\{)))|(?:((?:\})))|(?:((?:\[)))|(?:((?:\])))|(?:([ \t\r]+)))/ym,
                    rules: [
                        { highlight: "comment", tag: ["comment"], when: /--[^\n]*/ },
                        { highlight: "comment", tag: ["comment"], when: /\/\*[\s\S]*?\*\// },
                        { tag: ["newline"], when: /\n/ },
                        { highlight: "keyword", tag: ["keyword"], when: /var\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /function\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /true\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /false\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /null\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /and\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /or\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /on\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /if\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /in\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /each\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /else\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /for\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /not\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /while\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /IS\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /IN\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /LIKE\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /BETWEEN\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /AND\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /OR\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /NOT\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /TRUE\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /FALSE\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /NULL\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /CASE\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /WHEN\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /THEN\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /ELSE\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /END\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /IF\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /COALESCE\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /NULLIF\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /STRUCT\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /ARRAY\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /EXTRACT\b/ },
                        { highlight: "keyword", tag: ["keyword"], when: /CAST\b/ },
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
                        { highlight: "keyword", tag: ["l_band"], when: "&" },
                        { highlight: "keyword", tag: ["l_bor"], when: "|" },
                        { tag: ["l_dot"], when: "." },
                        { highlight: "delimiter", tag: ["l_comma"], when: "," },
                        { highlight: "keyword", tag: ["l_m"], when: "$" },
                        { highlight: "delimiter", tag: ["l_lparen"], when: "(" },
                        { highlight: "delimiter", tag: ["l_rparen"], when: ")" },
                        { highlight: "delimiter", tag: ["l_lcurly"], when: "{" },
                        { highlight: "delimiter", tag: ["l_rcurly"], when: "}" },
                        { highlight: "delimiter", tag: ["l_lbrack"], when: "[" },
                        { highlight: "delimiter", tag: ["l_rbrack"], when: "]" },
                        { tag: ["ws"], when: /[ \t\r]+/ }
                    ]
                }
            }
        }
    }
    constructor(){}
}

export default grammar;