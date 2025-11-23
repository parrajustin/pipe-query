import * as fs from 'fs';
import * as path from 'path';
import { Parse } from "grammar-well";
import Grammar from "../gramer/grammar";

const TEST_DATA_DIR = path.join(__dirname, 'testdata');

describe("Parser Failures", () => {
    const parseFile = (filename: string) => {
        const filePath = path.join(TEST_DATA_DIR, filename);
        const content = fs.readFileSync(filePath, 'utf-8');
        const grammar = new Grammar();
        try {
            const result = Parse(grammar, content);
            expect(result).toBeDefined();
        } catch (e) {
            throw e;
        }
    };

    it("should parse array_functions.sql", () => {
        parseFile("array_functions.sql");
    });

    it("should parse js_udf.sql", () => {
        parseFile("js_udf.sql");
    });

    it("should parse operator_precedence.sql", () => {
        parseFile("operator_precedence.sql");
    });

    it("should parse script.sql", () => {
        parseFile("script.sql");
    });

    it("should parse tvf.sql", () => {
        parseFile("tvf.sql");
    });

    it("should parse tvf_basic.sql", () => {
        parseFile("tvf_basic.sql");
    });

    it("should parse tvf_complex.sql", () => {
        parseFile("tvf_complex.sql");
    });

    it("should parse tvf_edge_cases.sql", () => {
        parseFile("tvf_edge_cases.sql");
    });

    it("should parse tvf_params.sql", () => {
        parseFile("tvf_params.sql");
    });

    it("should parse tvf_set_ops.sql", () => {
        parseFile("tvf_set_ops.sql");
    });

    it("should parse udf_dependency.sql", () => {
        parseFile("udf_dependency.sql");
    });
});
