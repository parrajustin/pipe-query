import { Lexer } from './parser/lexer';
import { Parser } from './parser/parser';
import { Interpreter } from './processor/interpreter';
import { DataContext, DataTable } from './processor/operators';

export class QueryParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'QueryParseError';
    }
}

export interface DataProvider {
    (dataSourceName: string): Promise<DataTable> | AsyncIterable<any>;
}

export interface QueryProcessorOptions {
  dataProvider?: DataProvider;
}

export function createQueryProcessor(
  query: string,
  options?: QueryProcessorOptions
): (dataContext?: DataContext) => Promise<DataTable> {
  const lexer = new Lexer(query);
  const tokens = lexer.scanTokens();
  const parser = new Parser(tokens);
  const ast = parser.parse();

  if (!ast) {
    throw new QueryParseError('Failed to parse query.');
  }

  return async (dataContext?: DataContext): Promise<DataTable> => {
    const interpreter = new Interpreter();
    if (options?.dataProvider) {
        // Data provider logic will be implemented later
        return Promise.resolve([]);
    } else if (dataContext) {
        return interpreter.interpret(ast, dataContext);
    } else {
        throw new Error('Either a data context or a data provider must be provided.');
    }
  };
}
