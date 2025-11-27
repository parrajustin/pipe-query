const fs = require("fs");
const path = require("path");
const { Generate } = require("grammar-well");

const INPUT_FILE = './gramer/pipe_query.well';
const OUTPUT_FILE = './gramer/grammar.ts';

(async () => {
    try {
        await compile(INPUT_FILE, OUTPUT_FILE);
        console.log(`Successfully compiled ${INPUT_FILE} to ${OUTPUT_FILE}`);
    } catch (e) {
        console.error("Failed to compile grammar:", e);
        process.exit(1);
    }
})();

async function compile(inputPath: string, outputPath: string) {
    const fullInputPath = path.resolve(process.cwd(), inputPath);
    const fullOutputPath = path.resolve(process.cwd(), outputPath);
    const baseDir = path.dirname(fullInputPath);

    const source = fs.readFileSync(fullInputPath, 'utf-8');

    // Ensure output directory exists
    fs.mkdirSync(path.dirname(fullOutputPath), { recursive: true });

    const resolver = {
        path: (p: string) => {
            if (p === 'lexer' || p === 'grammar') return p;
            return path.resolve(baseDir, p.endsWith('.well') ? p : p + '.well');
        },
        body: async (p: string) => {
            if (p === 'lexer') {
                return 'lexer { start: "dummy" [dummy] - when "dummy" }';
            }
            if (p === 'grammar') {
                return 'grammar { [dummy] | "dummy" }';
            }
            return fs.readFileSync(p, 'utf-8');
        }
    };

    const ts = await Generate(source, {
        resolver,
        output: {
            name: 'grammar',
            format: 'typescript',
            artifacts: {
                grammar: true,
                lexer: true
            }
        }
    });

    if (typeof ts === 'string') {
        const imports = `import { BetweenExpr, Binary, BinaryOperator, CaseExpr, CreateFunctionStmt, FunctionParam, InExpr, IsBoolExpr, IsNullExpr, LikeExpr, Literal, LiteralKind, SimpleType, SimpleTypeKind, Unary, UnaryOperator, Variable } from "../src/parser/ast";\n`;
        fs.writeFileSync(fullOutputPath, imports + ts, 'utf8');
    } else {
        console.warn("Unexpected output format from Generate, attempting to write as JSON if object");
        fs.writeFileSync(fullOutputPath, JSON.stringify(ts, null, 2), 'utf8');
    }
}
