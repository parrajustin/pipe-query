import { Token } from './lexer';

// =============================================================================
// Expressions
// =============================================================================

export interface ExprVisitor<R> {
  visitAssignExpr(expr: Assign, row?: any, dataContext?: any): R;
  visitBinaryExpr(expr: Binary, row?: any, dataContext?: any): R;
  visitCallExpr(expr: Call, row?: any, dataContext?: any): R;
  visitGroupingExpr(expr: Grouping, row?: any, dataContext?: any): R;
  visitLiteralExpr(expr: Literal, row?: any, dataContext?: any): R;
  visitLogicalExpr(expr: Logical, row?: any, dataContext?: any): R;
  visitUnaryExpr(expr: Unary, row?: any, dataContext?: any): R;
  visitVariableExpr(expr: Variable, row?: any, dataContext?: any): R;
  visitGetExpr(expr: Get, row?: any, dataContext?: any): R;
}

export abstract class Expr {
  abstract accept<R>(visitor: ExprVisitor<R>, row?: any, dataContext?: any): R;
}

export class Assign extends Expr {
  constructor(public readonly name: Token, public readonly value: Expr) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>, row?: any, dataContext?: any): R {
    return visitor.visitAssignExpr(this, row, dataContext);
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

  accept<R>(visitor: ExprVisitor<R>, row?: any, dataContext?: any): R {
    return visitor.visitBinaryExpr(this, row, dataContext);
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

  accept<R>(visitor: ExprVisitor<R>, row?: any, dataContext?: any): R {
    return visitor.visitCallExpr(this, row, dataContext);
  }
}

export class Grouping extends Expr {
  constructor(public readonly expression: Expr) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>, row?: any, dataContext?: any): R {
    return visitor.visitGroupingExpr(this, row, dataContext);
  }
}

export class Literal extends Expr {
  constructor(public readonly value: any) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>, row?: any, dataContext?: any): R {
    return visitor.visitLiteralExpr(this, row, dataContext);
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

  accept<R>(visitor: ExprVisitor<R>, row?: any, dataContext?: any): R {
    return visitor.visitLogicalExpr(this, row, dataContext);
  }
}

export class Unary extends Expr {
  constructor(public readonly operator: Token, public readonly right: Expr) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>, row?: any, dataContext?: any): R {
    return visitor.visitUnaryExpr(this, row, dataContext);
  }
}

export class Variable extends Expr {
  constructor(public readonly name: Token) {
    super();
  }

  accept<R>(visitor: ExprVisitor<R>, row?: any, dataContext?: any): R {
    return visitor.visitVariableExpr(this, row, dataContext);
  }
}

export class Get extends Expr {
    constructor(public readonly object: Expr, public readonly name: Token) {
        super();
    }

    accept<R>(visitor: ExprVisitor<R>, row?: any, dataContext?: any): R {
        return visitor.visitGetExpr(this, row, dataContext);
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
  visitExtendStmt(stmt: ExtendStmt): R;
  visitRenameStmt(stmt: RenameStmt): R;
  visitOrderByStmt(stmt: OrderByStmt): R;
  visitLimitStmt(stmt: LimitStmt): R;
  visitDistinctStmt(stmt: DistinctStmt): R;
  visitJoinStmt(stmt: JoinStmt): R;
  visitUnionStmt(stmt: UnionStmt): R;
  visitExceptStmt(stmt: ExceptStmt): R;
  visitAsStmt(stmt: AsStmt): R;
  visitCallStmt(stmt: CallStmt): R;
  visitSetStmt(stmt: SetStmt): R;
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

export class ExtendStmt extends PipeOperatorStmt {
    constructor(public readonly columns: SelectColumn[]) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitExtendStmt(this);
    }
}

export class RenameStmt extends PipeOperatorStmt {
    constructor(public readonly renames: { from: Token; to: Token }[]) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitRenameStmt(this);
    }
}

export class OrderByStmt extends PipeOperatorStmt {
    constructor(public readonly columns: { expression: Expr; direction: Token | null }[]) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitOrderByStmt(this);
    }
}

export class LimitStmt extends PipeOperatorStmt {
    constructor(public readonly count: Expr, public readonly offset: Expr | null) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitLimitStmt(this);
    }
}

export class DistinctStmt extends PipeOperatorStmt {
    constructor() {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitDistinctStmt(this);
    }
}

export class JoinStmt extends PipeOperatorStmt {
    constructor(public readonly table: Token, public readonly on: Expr) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitJoinStmt(this);
    }
}

export class UnionStmt extends PipeOperatorStmt {
    constructor(public readonly table: Token) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitUnionStmt(this);
    }
}

export class ExceptStmt extends PipeOperatorStmt {
    constructor(public readonly table: Token) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitExceptStmt(this);
    }
}

export class AsStmt extends PipeOperatorStmt {
    constructor(public readonly name: Token) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitAsStmt(this);
    }
}

export class SetStmt extends PipeOperatorStmt {
    constructor(public readonly name: Token) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitSetStmt(this);
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
