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

export function join(
    left: DataTable,
    right: DataTable,
    on: Expr,
    evaluate: Evaluator
): DataTable {
    const result: DataTable = [];
    left.forEach(leftRow => {
        right.forEach(rightRow => {
            if (evaluate(on, { ...leftRow, ...rightRow })) {
                result.push({ ...leftRow, ...rightRow });
            }
        });
    });
    return result;
}

export function union(
    left: DataTable,
    right: DataTable
): DataTable {
    return [...left, ...right];
}

export function except(
    left: DataTable,
    right: DataTable
): DataTable {
    const rightKeys = new Set(right.map(row => JSON.stringify(row)));
    return left.filter(row => !rightKeys.has(JSON.stringify(row)));
}

export function orderBy(
    table: DataTable,
    columns: { expression: Expr; direction: Token | null }[],
    evaluate: Evaluator
): DataTable {
    const sorted = [...table];
    sorted.sort((a, b) => {
        for (const col of columns) {
            const aValue = evaluate(col.expression, a);
            const bValue = evaluate(col.expression, b);
            const direction = col.direction?.lexeme.toLowerCase() === 'desc' ? -1 : 1;
            if (aValue < bValue) {
                return -1 * direction;
            }
            if (aValue > bValue) {
                return 1 * direction;
            }
        }
        return 0;
    });
    return sorted;
}

export function limit(
    table: DataTable,
    count: number,
    offset: number | null
): DataTable {
    const start = offset || 0;
    return table.slice(start, start + count);
}

export function distinct(
    table: DataTable
): DataTable {
    const unique = new Map<string, DataRow>();
    table.forEach(row => {
        const key = JSON.stringify(row);
        if (!unique.has(key)) {
            unique.set(key, row);
        }
    });
    return Array.from(unique.values());
}

export function extend(
    table: DataTable,
    columns: { expression: Expr; alias: Token | null }[],
    evaluate: Evaluator
): DataTable {
    return table.map(row => {
        const newRow = { ...row };
        columns.forEach(col => {
            const value = evaluate(col.expression, row);
            const name = col.alias ? col.alias.lexeme : 'computed';
            newRow[name] = value;
        });
        return newRow;
    });
}

export function rename(
    table: DataTable,
    renames: { from: Token; to: Token }[]
): DataTable {
    return table.map(row => {
        const newRow = { ...row };
        renames.forEach(r => {
            newRow[r.to.lexeme] = newRow[r.from.lexeme];
            delete newRow[r.from.lexeme];
        });
        return newRow;
    });
}
