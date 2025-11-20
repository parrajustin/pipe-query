import { QueryStmt } from './ast';
import * as nearley from 'nearley';
import grammar from './grammar';

export class Parser {
  private readonly parser: nearley.Parser;

  constructor(query: string) {
    this.parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    this.parser.feed(query);
  }

  parse(): QueryStmt | null {
    if (this.parser.results.length > 1) {
      throw new Error('Ambiguous grammar detected');
    }
    return this.parser.results[0] || null;
  }
}
