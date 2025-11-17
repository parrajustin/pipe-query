import { Token } from './lexer';

// =============================================================================
// Expressions
// =============================================================================

export interface ExprVisitor<R> {
  visitAssignExpr(expr: Assign, row?: any): R;
  visitBinaryExpr(expr: Binary, row?: any): R;
  visitCallExpr(expr: Call, row?: any): R;
  visitGroupingExpr(expr: Grouping, row?: any): R;
  visitLiteralExpr(expr: Literal, row?: any): R;
  visitLogicalExpr(expr: Logical, row?: any): R;
  visitUnaryExpr(expr: Unary, row?: any): R;
  visitVariableExpr(expr: Variable, row?: any): R;
}

export abstract class Expr {
  abstract accept<R>(visitor: ExprVisitor<R>, row?: any): R;
}

export class Assign extends Expr {
  constructor(public readonly name: Token, public readonly value: Expr) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>, row?: any): R {
    return visitor.visitAssignExpr(this, row);
  }
}

export class Binary extends Expr {
  constructor(
    public readonly left: Expr,
    public readonly operator: Token,
    public readonly right: Expr
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>, row?: any): R {
    return visitor.visitBinaryExpr(this, row);
  }
}

export class Call extends Expr {
  constructor(
    public readonly callee: Expr,
    public readonly paren: Token,
    public readonly args: Expr[]
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>, row?: any): R {
    return visitor.visitCallExpr(this, row);
  }
}

export class Grouping extends Expr {
  constructor(public readonly expression: Expr) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>, row?: any): R {
    return visitor.visitGroupingExpr(this, row);
  }
}

export class Literal extends Expr {
  constructor(public readonly value: any) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>, row?: any): R {
    return visitor.visitLiteralExpr(this, row);
  }
}

export class Logical extends Expr {
  constructor(
    public readonly left: Expr,
    public readonly operator: Token,
    public readonly right: Expr
  ) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>, row?: any): R {
    return visitor.visitLogicalExpr(this, row);
  }
}

export class Unary extends Expr {
  constructor(public readonly operator: Token, public readonly right: Expr) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>, row?: any): R {
    return visitor.visitUnaryExpr(this, row);
  }
}

export class Variable extends Expr {
  constructor(public readonly name: Token) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>, row?: any): R {
    return visitor.visitVariableExpr(this, row);
  }
}

// =============================================================================
// Statements
// =============================================================================

export interface SelectColumn {
    expression: Expr;
    alias: Token | null;
}

export interface StmtVisitor<R> {
  visitExpressionStmt(stmt: ExpressionStmt): R;
  visitFromStmt(stmt: FromStmt): R;
  visitQueryStmt(stmt: QueryStmt): R;
  visitSelectStmt(stmt: SelectStmt): R;
  visitWhereStmt(stmt: WhereStmt): R;
  visitAggregateStmt(stmt: AggregateStmt): R;
}

export abstract class Stmt {
    abstract accept<R>(visitor: StmtVisitor<R>): R;
}

export class ExpressionStmt extends Stmt {
    constructor(public readonly expression: Expr) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitExpressionStmt(this);
    }
}

export class FromStmt extends Stmt {
    constructor(public readonly table: Token) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitFromStmt(this);
    }
}

export abstract class PipeOperatorStmt extends Stmt {}

export class SelectStmt extends PipeOperatorStmt {
    constructor(public readonly columns: SelectColumn[]) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitSelectStmt(this);
    }
}

export class WhereStmt extends PipeOperatorStmt {
    constructor(public readonly condition: Expr) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitWhereStmt(this);
    }
}

export interface AggregateColumn {
    expression: Call;
    alias: Token;
}

export class AggregateStmt extends PipeOperatorStmt {
    constructor(
        public readonly columns: AggregateColumn[],
        public readonly groupBy: Variable[]
    ) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitAggregateStmt(this);
    }
}

export class QueryStmt extends Stmt {
    constructor(public readonly statements: Stmt[]) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitQueryStmt(this);
    }
}
