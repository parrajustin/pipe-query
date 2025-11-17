export type DataRow = { [key: string]: any };
export type DataTable = DataRow[];
export type DataContext = { [key: string]: DataTable };

export function from(dataContext: DataContext, tableName: string): DataTable {
  if (!dataContext[tableName]) {
    throw new Error(`Table not found: ${tableName}`);
  }
  return dataContext[tableName];
}

import { Expr, Variable } from '../parser/ast';
import { Token } from '../parser/lexer';

export type Evaluator = (expression: Expr, row: DataRow) => any;

export function select(
  table: DataTable,
  columns: { expression: Expr; alias: Token | null }[],
  evaluate: Evaluator
): DataTable {
  return table.map(row => {
    const newRow: DataRow = {};
    columns.forEach(col => {
      const value = evaluate(col.expression, row);
      const name = col.alias ? col.alias.lexeme : (col.expression instanceof Variable ? col.expression.name.lexeme : 'computed');
      newRow[name] = value;
    });
    return newRow;
  });
}

export function where(table: DataTable, condition: Expr, evaluate: Evaluator): DataTable {
    return table.filter(row => {
        return evaluate(condition, row);
    });
}

export function aggregate(
  table: DataTable,
  columns: { expression: Expr; alias: Token }[],
  groupBy: Variable[],
  evaluate: Evaluator
): DataTable {
  if (groupBy.length === 0) {
    const newRow: DataRow = {};
    columns.forEach(col => {
        const value = evaluate(col.expression, { table });
        newRow[col.alias.lexeme] = value;
    });
    return [newRow];
  }

  const groups = new Map<string, DataRow[]>();
  table.forEach(row => {
    const key = groupBy.map(gb => row[gb.name.lexeme]).join('-');
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  });

  const result: DataTable = [];
  groups.forEach((rows, key) => {
    const newRow: DataRow = {};
    groupBy.forEach(gb => {
        newRow[gb.name.lexeme] = rows[0][gb.name.lexeme];
    });

    columns.forEach(col => {
      const value = evaluate(col.expression, { table: rows });
      newRow[col.alias.lexeme] = value;
    });
    result.push(newRow);
  });

  return result;
}
