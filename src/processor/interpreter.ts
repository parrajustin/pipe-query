import {
  QueryStmt,
  Stmt,
  FromStmt,
  SelectStmt,
  WhereStmt,
  ExpressionStmt,
  StmtVisitor,
  Expr,
  Literal,
  Variable,
  Unary,
  Binary,
  Grouping,
  ExprVisitor,
  Assign,
  Call,
  Logical,
  AggregateStmt,
  ExtendStmt,
  RenameStmt,
  OrderByStmt,
  LimitStmt,
  DistinctStmt,
  JoinStmt,
  UnionStmt,
  ExceptStmt,
  Get,
  AsStmt,
  CallStmt,
  SetStmt,
} from '../parser/ast';
import { DataContext, DataTable, DataRow, from, select, where, aggregate, extend, rename, orderBy, limit, distinct, join, union, except } from './operators';
import { TokenType } from '../parser/lexer';

export class Interpreter implements StmtVisitor<void>, ExprVisitor<any> {
  private dataContext: DataContext = {};
  private currentTable: DataTable = [];

  interpret(query: QueryStmt, dataContext: DataContext): DataTable {
    this.dataContext = dataContext;
    try {
      for (const statement of query.statements) {
        this.execute(statement);
      }
    } catch (error) {
        console.error(error);
    }
    return this.currentTable;
  }

  private execute(stmt: Stmt): void {
    stmt.accept(this);
  }

  visitQueryStmt(stmt: QueryStmt): void {
    for (const statement of stmt.statements) {
      this.execute(statement);
    }
  }

  visitFromStmt(stmt: FromStmt): void {
    this.currentTable = from(this.dataContext, stmt.table.lexeme);
  }

  visitSelectStmt(stmt: SelectStmt): void {
    const evaluator = (expr: Expr, row: DataRow) => this.evaluate(expr, row, this.dataContext);
    this.currentTable = select(this.currentTable, stmt.columns, evaluator);
  }

  visitWhereStmt(stmt: WhereStmt): void {
    const evaluator = (expr: Expr, row: DataRow) => this.evaluate(expr, row, this.dataContext);
    this.currentTable = where(this.currentTable, stmt.condition, evaluator);
  }

  visitExpressionStmt(stmt: ExpressionStmt): void {
    // For now, we don't do anything with standalone expressions
  }

  visitAggregateStmt(stmt: AggregateStmt): void {
    const evaluator = (expr: Expr, row: DataRow) => this.evaluate(expr, row, this.dataContext);
    this.currentTable = aggregate(
      this.currentTable,
      stmt.columns,
      stmt.groupBy,
      evaluator
    );
  }

  visitExtendStmt(stmt: ExtendStmt): void {
    const evaluator = (expr: Expr, row: DataRow) => this.evaluate(expr, row, this.dataContext);
    this.currentTable = extend(this.currentTable, stmt.columns, evaluator);
  }

  visitRenameStmt(stmt: RenameStmt): void {
    this.currentTable = rename(this.currentTable, stmt.renames);
  }

  visitOrderByStmt(stmt: OrderByStmt): void {
    const evaluator = (expr: Expr, row: DataRow) => this.evaluate(expr, row, this.dataContext);
    this.currentTable = orderBy(this.currentTable, stmt.columns, evaluator);
  }

  visitLimitStmt(stmt: LimitStmt): void {
    const count = this.evaluate(stmt.count, {}, this.dataContext);
    const offset = stmt.offset ? this.evaluate(stmt.offset, {}, this.dataContext) : null;
    this.currentTable = limit(this.currentTable, count, offset);
  }

  visitDistinctStmt(stmt: DistinctStmt): void {
    this.currentTable = distinct(this.currentTable);
  }

  visitJoinStmt(stmt: JoinStmt): void {
    const right = from(this.dataContext, stmt.table.lexeme);
    const evaluator = (expr: Expr, row: DataRow) => this.evaluate(expr, row, this.dataContext);
    this.currentTable = join(this.currentTable, right, stmt.on, evaluator);
  }

  visitUnionStmt(stmt: UnionStmt): void {
    const right = from(this.dataContext, stmt.table.lexeme);
    this.currentTable = union(this.currentTable, right);
  }

  visitExceptStmt(stmt: ExceptStmt): void {
    const right = from(this.dataContext, stmt.table.lexeme);
    this.currentTable = except(this.currentTable, right);
  }

  private evaluate(expr: Expr, row: DataRow, dataContext: DataContext): any {
    return expr.accept(this, row, dataContext);
  }

  visitLiteralExpr(expr: Literal, row?: any): any {
    return expr.value;
  }

  visitVariableExpr(expr: Variable, row?: any, dataContext?: DataContext): any {
    if (row && expr.name.lexeme in row) {
        return row[expr.name.lexeme];
    }
    if (dataContext && expr.name.lexeme in dataContext) {
        return dataContext[expr.name.lexeme];
    }
    return null;
  }

  visitUnaryExpr(expr: Unary, row?: any): any {
    const right = this.evaluate(expr.right, row);
    switch (expr.operator.type) {
      case TokenType.MINUS:
        return -right;
      case TokenType.BANG:
        return !right;
    }
    return null;
  }

  visitBinaryExpr(expr: Binary, row?: any): any {
    const left = this.evaluate(expr.left, row);
    const right = this.evaluate(expr.right, row);

    switch (expr.operator.type) {
        case TokenType.PLUS: return left + right;
        case TokenType.MINUS: return left - right;
        case TokenType.STAR: return left * right;
        case TokenType.SLASH: return left / right;
        case TokenType.GREATER: return left > right;
        case TokenType.GREATER_EQUAL: return left >= right;
        case TokenType.LESS: return left < right;
        case TokenType.LESS_EQUAL: return left <= right;
        case TokenType.EQUAL_EQUAL: return left === right;
        case TokenType.BANG_EQUAL: return left !== right;
    }
    return null;
  }

  visitGroupingExpr(expr: Grouping, row?: any): any {
      return this.evaluate(expr.expression, row);
  }

  visitAssignExpr(expr: Assign, row?: any): any {
      // Not implemented yet
      return null;
  }

  visitCallExpr(expr: Call, row?: any): any {
    const funcName = (expr.callee as Variable).name.lexeme.toLowerCase();
    const table = row.table as DataTable;

    switch(funcName) {
        case 'sum':
            const argName = (expr.args[0] as Variable).name.lexeme;
            return table.reduce((acc, row) => acc + row[argName], 0);
        case 'count':
            return table.length;
        default:
            throw new Error(`Unsupported aggregate function: ${funcName}`);
    }
  }

  visitLogicalExpr(expr: Logical, row?: any): any {
      // Not implemented yet
      return null;
  }

  visitGetExpr(expr: Get, row?: any, dataContext?: any): any {
    const object = this.evaluate(expr.object, row, dataContext);
    if (object && typeof object === 'object' && expr.name.lexeme in object) {
      return object[expr.name.lexeme];
    } else if (row && typeof row === 'object' && expr.name.lexeme in row) {
        return row[expr.name.lexeme];
    }
    return null;
  }

  visitSetStmt(stmt: SetStmt): void {
    const value = this.evaluate(stmt.value, {}, this.dataContext);
    this.dataContext[stmt.name.lexeme] = value;
  }


  visitAsStmt(stmt: AsStmt): void {
    const table = this.interpret(stmt.query, this.dataContext);
    this.dataContext[stmt.name.lexeme] = table;
  }

  visitCallStmt(stmt: CallStmt): void {
    // Not implemented yet
  }

    visitSetStmt(stmt: SetStmt): void {
        this.dataContext[stmt.name.lexeme] = this.currentTable;
    }

    visitAsStmt(stmt: AsStmt): void {
        this.dataContext[stmt.name.lexeme] = this.currentTable;
    }
}
