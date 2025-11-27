import { BetweenExpr, Binary, BinaryOperator, CaseExpr, CreateFunctionStmt, FunctionParam, InExpr, IsBoolExpr, IsNullExpr, LikeExpr, Literal, LiteralKind, SimpleType, SimpleTypeKind, Unary, UnaryOperator, Variable } from "../src/parser/ast";
// Generated automatically by Grammar-Well, version 2.0.7 
// https://github.com/0x6563/grammar-well
// @ts-nocheck



class grammar {
    state = {};
    artifacts = {
        grammar: {
            rules: {
                AdditiveExpression: [
                    { name: "AdditiveExpression", postprocess: ({data}) => { return (data[0]); }, symbols: [ "MultiplicativeExpression" ] },
                    { name: "AdditiveExpression", postprocess: ({data}) => { return (new Binary(data[0], BinaryOperator.PLUS, data[4])); }, symbols: [ "AdditiveExpression", "__", { literal: "+" }, "__", "MultiplicativeExpression" ] },
                    { name: "AdditiveExpression", postprocess: ({data}) => { return (new Binary(data[0], BinaryOperator.MINUS, data[4])); }, symbols: [ "AdditiveExpression", "__", { literal: "-" }, "__", "MultiplicativeExpression" ] }
                ],
                AndExpression: [
                    { name: "AndExpression", postprocess: ({data}) => { return (data[0]); }, symbols: [ "NotExpression" ] },
                    { name: "AndExpression", postprocess: ({data}) => { return (new Binary(data[0], BinaryOperator.AND, data[4])); }, symbols: [ "AndExpression", "__", { literal: "AND" }, "__", "NotExpression" ] }
                ],
                BitwiseAndExpression: [
                    { name: "BitwiseAndExpression", postprocess: ({data}) => { return (data[0]); }, symbols: [ "BitwiseShiftExpression" ] },
                    { name: "BitwiseAndExpression", postprocess: ({data}) => { return (new Binary(data[0], BinaryOperator.BITWISE_AND, data[4])); }, symbols: [ "BitwiseAndExpression", "__", { literal: "&" }, "__", "BitwiseShiftExpression" ] }
                ],
                BitwiseOrExpression: [
                    { name: "BitwiseOrExpression", postprocess: ({data}) => { return (data[0]); }, symbols: [ "BitwiseXorExpression" ] },
                    { name: "BitwiseOrExpression", postprocess: ({data}) => { return (new Binary(data[0], BinaryOperator.BITWISE_OR, data[4])); }, symbols: [ "BitwiseOrExpression", "__", { literal: "|" }, "__", "BitwiseXorExpression" ] }
                ],
                BitwiseShiftExpression: [
                    { name: "BitwiseShiftExpression", postprocess: ({data}) => { return (data[0]); }, symbols: [ "AdditiveExpression" ] },
                    { name: "BitwiseShiftExpression", postprocess: ({data}) => { return (new Binary(data[0], BinaryOperator.BITWISE_LEFT_SHIFT, data[4])); }, symbols: [ "BitwiseShiftExpression", "__", { literal: "<<" }, "__", "AdditiveExpression" ] },
                    { name: "BitwiseShiftExpression", postprocess: ({data}) => { return (new Binary(data[0], BinaryOperator.BITWISE_RIGHT_SHIFT, data[4])); }, symbols: [ "BitwiseShiftExpression", "__", { literal: ">>" }, "__", "AdditiveExpression" ] }
                ],
                BitwiseXorExpression: [
                    { name: "BitwiseXorExpression", postprocess: ({data}) => { return (data[0]); }, symbols: [ "BitwiseAndExpression" ] },
                    { name: "BitwiseXorExpression", postprocess: ({data}) => { return (new Binary(data[0], BinaryOperator.BITWISE_XOR, data[4])); }, symbols: [ "BitwiseXorExpression", "__", { literal: "^" }, "__", "BitwiseAndExpression" ] }
                ],
                CaseWhenClauses: [
                    { name: "CaseWhenClauses", postprocess: ({data}) => { return ([{ condition: data[2], result: data[6] }]); }, symbols: [ { literal: "WHEN" }, "_", "Expression", "_", { literal: "THEN" }, "_", "Expression" ] },
                    { name: "CaseWhenClauses", postprocess: ({data}) => { return (data[0].concat([{ condition: data[4], result: data[8] }])); }, symbols: [ "CaseWhenClauses", "_", { literal: "WHEN" }, "_", "Expression", "_", { literal: "THEN" }, "_", "Expression" ] }
                ],
                ComparisonExpression: [
                    { name: "ComparisonExpression", postprocess: ({data}) => { return (data[0]); }, symbols: [ "BitwiseOrExpression" ] },
                    { name: "ComparisonExpression", postprocess: ({data}) => { return (new Binary(data[0], data[2], data[4])); }, symbols: [ "BitwiseOrExpression", "__", "ComparisonOp", "__", "BitwiseOrExpression" ] },
                    { name: "ComparisonExpression", postprocess: ({data}) => { return (new IsNullExpr(data[0], !!data[4])); }, symbols: [ "BitwiseOrExpression", "__", { literal: "IS" }, "__", "ComparisonExpression.RPT01x1", { literal: "NULL" } ] },
                    { name: "ComparisonExpression", postprocess: ({data}) => { return (new IsBoolExpr(data[0], !!data[4], true)); }, symbols: [ "BitwiseOrExpression", "__", { literal: "IS" }, "__", "ComparisonExpression.RPT01x2", { literal: "TRUE" } ] },
                    { name: "ComparisonExpression", postprocess: ({data}) => { return (new IsBoolExpr(data[0], !!data[4], false)); }, symbols: [ "BitwiseOrExpression", "__", { literal: "IS" }, "__", "ComparisonExpression.RPT01x3", { literal: "FALSE" } ] },
                    { name: "ComparisonExpression", postprocess: ({data}) => { return (new InExpr(data[0], !!data[2], data[7])); }, symbols: [ "BitwiseOrExpression", "_", "ComparisonExpression.RPT01x4", { literal: "IN" }, "_", { literal: "(" }, "_", "ExpressionList", "_", { literal: ")" } ] },
                    { name: "ComparisonExpression", postprocess: ({data}) => { return (new LikeExpr(data[0], !!data[2], data[5])); }, symbols: [ "BitwiseOrExpression", "__", "ComparisonExpression.RPT01x5", { literal: "LIKE" }, "__", "BitwiseOrExpression" ] },
                    { name: "ComparisonExpression", postprocess: ({data}) => { return (new BetweenExpr(data[0], !!data[2], data[5], data[9])); }, symbols: [ "BitwiseOrExpression", "__", "ComparisonExpression.RPT01x6", { literal: "BETWEEN" }, "__", "BitwiseOrExpression", "__", { literal: "AND" }, "__", "BitwiseOrExpression" ] }
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
                    { name: "ComparisonExpression.RPT01x4.SUBx1", symbols: [ { literal: "NOT" }, "_" ] }
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
                    { name: "ComparisonOp", postprocess: ({data}) => { return (BinaryOperator.EQUALS); }, symbols: [ { literal: "=" } ] },
                    { name: "ComparisonOp", postprocess: ({data}) => { return (BinaryOperator.NOT_EQUALS); }, symbols: [ { literal: "!=" } ] },
                    { name: "ComparisonOp", postprocess: ({data}) => { return (BinaryOperator.NOT_EQUALS); }, symbols: [ { literal: "<>" } ] },
                    { name: "ComparisonOp", postprocess: ({data}) => { return (BinaryOperator.LESS_THAN); }, symbols: [ { literal: "<" } ] },
                    { name: "ComparisonOp", postprocess: ({data}) => { return (BinaryOperator.LESS_THAN_OR_EQUAL); }, symbols: [ { literal: "<=" } ] },
                    { name: "ComparisonOp", postprocess: ({data}) => { return (BinaryOperator.GREATER_THAN); }, symbols: [ { literal: ">" } ] },
                    { name: "ComparisonOp", postprocess: ({data}) => { return (BinaryOperator.GREATER_THAN_OR_EQUAL); }, symbols: [ { literal: ">=" } ] }
                ],
                DataType: [
                    { name: "DataType", symbols: [ { literal: "ARRAY" }, "__", { literal: "<" }, "__", "DataType", "__", { literal: ">" } ] },
                    { name: "DataType", symbols: [ { literal: "STRUCT" }, "__", { literal: "<" }, "__", "StructFields", "__", { literal: ">" } ] },
                    { name: "DataType", symbols: [ { literal: "STRING" }, "__", { literal: "(" }, "__", { token: "digits" }, "__", { literal: ")" } ] },
                    { name: "DataType", symbols: [ { literal: "BYTES" }, "__", { literal: "(" }, "__", { token: "digits" }, "__", { literal: ")" } ] },
                    { name: "DataType", symbols: [ { literal: "NUMERIC" }, "__", { literal: "(" }, "__", { token: "digits" }, "__", "DataType.RPT01x1", "__", { literal: ")" } ] },
                    { name: "DataType", symbols: [ { literal: "BIGNUMERIC" }, "__", { literal: "(" }, "__", { token: "digits" }, "__", "DataType.RPT01x2", "__", { literal: ")" } ] },
                    { name: "DataType", postprocess: ({data}) => { return (new SimpleType(SimpleTypeKind.BOOL)); }, symbols: [ { literal: "BOOL" } ] },
                    { name: "DataType", postprocess: ({data}) => { return (new SimpleType(SimpleTypeKind.DATE)); }, symbols: [ { literal: "DATE" } ] },
                    { name: "DataType", postprocess: ({data}) => { return (new SimpleType(SimpleTypeKind.DATETIME)); }, symbols: [ { literal: "DATETIME" } ] },
                    { name: "DataType", postprocess: ({data}) => { return (new SimpleType(SimpleTypeKind.FLOAT64)); }, symbols: [ { literal: "FLOAT64" } ] },
                    { name: "DataType", postprocess: ({data}) => { return (new SimpleType(SimpleTypeKind.GEOGRAPHY)); }, symbols: [ { literal: "GEOGRAPHY" } ] },
                    { name: "DataType", postprocess: ({data}) => { return (new SimpleType(SimpleTypeKind.INT64)); }, symbols: [ { literal: "INT64" } ] },
                    { name: "DataType", postprocess: ({data}) => { return (new SimpleType(SimpleTypeKind.INTERVAL)); }, symbols: [ { literal: "INTERVAL" } ] },
                    { name: "DataType", postprocess: ({data}) => { return (new SimpleType(SimpleTypeKind.JSON)); }, symbols: [ { literal: "JSON" } ] },
                    { name: "DataType", postprocess: ({data}) => { return (new SimpleType(SimpleTypeKind.NUMERIC)); }, symbols: [ { literal: "NUMERIC" } ] },
                    { name: "DataType", symbols: [ { literal: "RANGE" } ] },
                    { name: "DataType", postprocess: ({data}) => { return (new SimpleType(SimpleTypeKind.STRING)); }, symbols: [ { literal: "STRING" } ] },
                    { name: "DataType", symbols: [ { literal: "STRUCT" } ] },
                    { name: "DataType", postprocess: ({data}) => { return (new SimpleType(SimpleTypeKind.TIME)); }, symbols: [ { literal: "TIME" } ] },
                    { name: "DataType", postprocess: ({data}) => { return (new SimpleType(SimpleTypeKind.TIMESTAMP)); }, symbols: [ { literal: "TIMESTAMP" } ] }
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
                    { name: "Expression", postprocess: ({data}) => { return (data[0]); }, symbols: [ "OrExpression" ] }
                ],
                ExpressionList: [
                    { name: "ExpressionList", postprocess: ({data}) => { return ([data[0]]); }, symbols: [ "Expression" ] },
                    { name: "ExpressionList", postprocess: ({data}) => { return (data[0].concat([data[4]])); }, symbols: [ "ExpressionList", "_", { literal: "," }, "_", "Expression" ] }
                ],
                FunctionParam: [
                    { name: "FunctionParam", postprocess: ({data}) => { return (new FunctionParam(data[0].value, data[2])); }, symbols: [ { token: "word" }, "__", "DataType" ] }
                ],
                FunctionParams: [
                    { name: "FunctionParams", postprocess: ({data}) => { return ([data[0]]); }, symbols: [ "FunctionParam" ] },
                    { name: "FunctionParams", postprocess: ({data}) => { return (data[0].concat([data[3]])); }, symbols: [ "FunctionParams", { literal: "," }, "__", "FunctionParam" ] }
                ],
                Identifier: [
                    { name: "Identifier", postprocess: ({data}) => { return (new Variable(data[0].value)); }, symbols: [ { token: "word" } ] }
                ],
                Literal: [
                    { name: "Literal", postprocess: ({data}) => { return (new Literal(LiteralKind.INT, data[0].value)); }, symbols: [ { token: "digits" } ] },
                    { name: "Literal", postprocess: ({data}) => { return (new Literal(LiteralKind.STRING, data[0].value)); }, symbols: [ { token: "string" } ] }
                ],
                MultiplicativeExpression: [
                    { name: "MultiplicativeExpression", postprocess: ({data}) => { return (data[0]); }, symbols: [ "UnaryExpression" ] },
                    { name: "MultiplicativeExpression", postprocess: ({data}) => { return (new Binary(data[0], BinaryOperator.MULTIPLY, data[4])); }, symbols: [ "MultiplicativeExpression", "__", { literal: "*" }, "__", "UnaryExpression" ] },
                    { name: "MultiplicativeExpression", postprocess: ({data}) => { return (new Binary(data[0], BinaryOperator.DIVIDE, data[4])); }, symbols: [ "MultiplicativeExpression", "__", { literal: "/" }, "__", "UnaryExpression" ] },
                    { name: "MultiplicativeExpression", postprocess: ({data}) => { return (new Binary(data[0], BinaryOperator.CONCAT, data[4])); }, symbols: [ "MultiplicativeExpression", "__", { literal: "||" }, "__", "UnaryExpression" ] }
                ],
                NotExpression: [
                    { name: "NotExpression", postprocess: ({data}) => { return (new Unary(UnaryOperator.NOT, data[2])); }, symbols: [ { literal: "NOT" }, "__", "NotExpression" ] },
                    { name: "NotExpression", postprocess: ({data}) => { return (data[0]); }, symbols: [ "ComparisonExpression" ] }
                ],
                OrExpression: [
                    { name: "OrExpression", postprocess: ({data}) => { return (data[0]); }, symbols: [ "AndExpression" ] },
                    { name: "OrExpression", postprocess: ({data}) => { return (new Binary(data[0], BinaryOperator.OR, data[4])); }, symbols: [ "OrExpression", "__", { literal: "OR" }, "__", "AndExpression" ] }
                ],
                PostfixExpression: [
                    { name: "PostfixExpression", postprocess: ({data}) => { return (data[0]); }, symbols: [ "PrimaryExpression" ] },
                    { name: "PostfixExpression", symbols: [ "PostfixExpression", { literal: "." }, { token: "word" } ] },
                    { name: "PostfixExpression", symbols: [ "PostfixExpression", { literal: "[" }, "__", "Expression", "__", { literal: "]" } ] },
                    { name: "PostfixExpression", symbols: [ "PostfixExpression", { literal: "[" }, "__", { literal: "OFFSET" }, { literal: "(" }, "__", "Expression", "__", { literal: ")" }, "__", { literal: "]" } ] },
                    { name: "PostfixExpression", symbols: [ "PostfixExpression", { literal: "[" }, "__", { literal: "ORDINAL" }, { literal: "(" }, "__", "Expression", "__", { literal: ")" }, "__", { literal: "]" } ] }
                ],
                PrimaryExpression: [
                    { name: "PrimaryExpression", postprocess: ({data}) => { return (data[0]); }, symbols: [ "Literal" ] },
                    { name: "PrimaryExpression", postprocess: ({data}) => { return (data[0]); }, symbols: [ "Identifier" ] },
                    { name: "PrimaryExpression", postprocess: ({data}) => { return (data[2]); }, symbols: [ { literal: "(" }, "_", "Expression", "_", { literal: ")" } ] },
                    { name: "PrimaryExpression", symbols: [ { literal: "CAST" }, { literal: "(" }, "__", "Expression", "__", { literal: "AS" }, "__", "DataType", "__", { literal: ")" } ] },
                    { name: "PrimaryExpression", postprocess: ({data}) => { return (new CaseExpr(
				data[4],
				data[6] ? data[6][2] : null
			)); }, symbols: [ { literal: "CASE" }, "_", "Expression", "_", "CaseWhenClauses", "_", "PrimaryExpression.RPT01x1", "_", { literal: "END" } ] }
                ],
                "PrimaryExpression.RPT01x1": [
                    { name: "PrimaryExpression.RPT01x1", postprocess: ({data}) => data[0], symbols: [ "PrimaryExpression.RPT01x1.SUBx1" ] },
                    { name: "PrimaryExpression.RPT01x1", postprocess: () => null, symbols: [ ] }
                ],
                "PrimaryExpression.RPT01x1.SUBx1": [
                    { name: "PrimaryExpression.RPT01x1.SUBx1", symbols: [ { literal: "ELSE" }, "_", "Expression" ] }
                ],
                PrivateScalarFunction: [
                    { name: "PrivateScalarFunction", postprocess: ({data}) => { return (new CreateFunctionStmt(
                data[2][0].value === "PRIVATE",
                [data[2][0].value],
                data[6].value,
                data[8] || [],
                data[13],
                null, // determinism
                null, // language
                [],   // options
                data[19]
            )); }, symbols: [ { literal: "CREATE" }, "_", "PrivateScalarFunction.SUBx1", "_", { literal: "FUNCTION" }, "_", { token: "word" }, { literal: "(" }, "PrivateScalarFunction.RPT01x1", { literal: ")" }, "_", { literal: "RETURNS" }, "_", "DataType", "_", { literal: "AS" }, "_", { literal: "(" }, "_", "Expression", "_", { literal: ")" }, { literal: ";" } ] }
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
                    { name: "PublicScalarFunction", postprocess: ({data}) => { return (new CreateFunctionStmt(
                false,
                ["PUBLIC"],
                data[6].value,
                data[8] || [],
                data[13],
                null, // determinism
                null, // language
                [],   // options
                data[19]
            )); }, symbols: [ { literal: "CREATE" }, "_", { literal: "PUBLIC" }, "_", { literal: "FUNCTION" }, "_", { token: "word" }, { literal: "(" }, "PublicScalarFunction.RPT01x1", { literal: ")" }, "_", { literal: "RETURNS" }, "_", "DataType", "_", { literal: "AS" }, "_", { literal: "(" }, "_", "Expression", "_", { literal: ")" }, { literal: ";" } ] }
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
                    { name: "UnaryExpression", postprocess: ({data}) => { return (new Unary(UnaryOperator.PLUS, data[2])); }, symbols: [ { literal: "+" }, "_", "UnaryExpression" ] },
                    { name: "UnaryExpression", postprocess: ({data}) => { return (new Unary(UnaryOperator.MINUS, data[2])); }, symbols: [ { literal: "-" }, "_", "UnaryExpression" ] },
                    { name: "UnaryExpression", postprocess: ({data}) => { return (new Unary(UnaryOperator.BITWISE_NOT, data[2])); }, symbols: [ { literal: "~" }, "_", "UnaryExpression" ] },
                    { name: "UnaryExpression", postprocess: ({data}) => { return (data[0]); }, symbols: [ "PostfixExpression" ] }
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
                    { name: "section", postprocess: ({data}) => { return (data[0]); }, symbols: [ "PrivateScalarFunction" ] },
                    { name: "section", postprocess: ({data}) => { return (data[0]); }, symbols: [ "PublicScalarFunction" ] }
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
                    regex: /(?:(?:(--[^\n]*))|(?:(\/\*[\s\S]*?\*\/))|(?:(\n))|(?:(var\b))|(?:(function\b))|(?:(true\b))|(?:(false\b))|(?:(null\b))|(?:(and\b))|(?:(or\b))|(?:(on\b))|(?:(if\b))|(?:(in\b))|(?:(each\b))|(?:(else\b))|(?:(for\b))|(?:(not\b))|(?:(while\b))|(?:(IS\b))|(?:(IN\b))|(?:(LIKE\b))|(?:(BETWEEN\b))|(?:(AND\b))|(?:(OR\b))|(?:(NOT\b))|(?:(TRUE\b))|(?:(FALSE\b))|(?:(NULL\b))|(?:(CASE\b))|(?:(WHEN\b))|(?:(THEN\b))|(?:(ELSE\b))|(?:(END\b))|(?:(IF\b))|(?:(COALESCE\b))|(?:(NULLIF\b))|(?:(STRUCT\b))|(?:(ARRAY\b))|(?:(EXTRACT\b))|(?:(CAST\b))|(?:(\d+))|(?:("(?:\\["bfnrt\/\\]|\\u[a-fA-F0-9]{4}|[^"\\])*"))|(?:(\/(?:[^\/\\\r\n]|\\.)+\/[gmiy]*))|(?:([_a-zA-Z][_a-zA-Z\d]*))|(?:((?:==)))|(?:((?:>=)))|(?:((?:<=)))|(?:((?:=)))|(?:((?:>)))|(?:((?:<)))|(?:((?:\+)))|(?:((?:\-)))|(?:((?:\/)))|(?:((?:%)))|(?:((?:\*)))|(?:((?:\^)))|(?:((?:;)))|(?:((?::)))|(?:((?:!)))|(?:((?:&)))|(?:((?:\|\|)))|(?:((?:\|)))|(?:((?:\.)))|(?:((?:,)))|(?:((?:\$)))|(?:((?:\()))|(?:((?:\))))|(?:((?:\{)))|(?:((?:\})))|(?:((?:\[)))|(?:((?:\])))|(?:([ \t\r]+)))/ym,
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
                        { highlight: "keyword", tag: ["l_bor"], when: "||" },
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