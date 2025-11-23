
// =============================================================================
// Enums
// =============================================================================

export enum SimpleTypeKind {
    INT64 = 'INT64',
    FLOAT64 = 'FLOAT64',
    STRING = 'STRING',
    BOOL = 'BOOL',
    BYTES = 'BYTES',
    DATE = 'DATE',
    DATETIME = 'DATETIME',
    TIME = 'TIME',
    TIMESTAMP = 'TIMESTAMP',
    GEOGRAPHY = 'GEOGRAPHY',
    INTERVAL = 'INTERVAL',
    JSON = 'JSON',
    NUMERIC = 'NUMERIC',
    BIGNUMERIC = 'BIGNUMERIC'
}

export enum BinaryOperator {
    PLUS = '+',
    MINUS = '-',
    MULTIPLY = '*',
    DIVIDE = '/',
    CONCAT = '||',
    EQUALS = '=',
    NOT_EQUALS = '!=',
    LESS_THAN = '<',
    LESS_THAN_OR_EQUAL = '<=',
    GREATER_THAN = '>',
    GREATER_THAN_OR_EQUAL = '>=',
    AND = 'AND',
    OR = 'OR',
    IS = 'IS',
    IN = 'IN',
    LIKE = 'LIKE',
    BITWISE_OR = '|',
    BITWISE_XOR = '^',
    BITWISE_AND = '&',
    BITWISE_LEFT_SHIFT = '<<',
    BITWISE_RIGHT_SHIFT = '>>'
}

export enum UnaryOperator {
    PLUS = '+',
    MINUS = '-',
    NOT = 'NOT',
    BITWISE_NOT = '~'
}

export enum LiteralKind {
    INT = 'INT',
    FLOAT = 'FLOAT',
    STRING = 'STRING',
    BOOL = 'BOOL',
    NULL = 'NULL'
}

export enum JoinType {
    INNER = 'INNER',
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
    FULL = 'FULL',
    CROSS = 'CROSS'
}

export enum SetOperator {
    UNION = 'UNION',
    INTERSECT = 'INTERSECT',
    EXCEPT = 'EXCEPT'
}

export enum OrderByDirection {
    ASC = 'ASC',
    DESC = 'DESC'
}

// =============================================================================
// Base Interfaces
// =============================================================================

export interface Token {
    value: string;
    line: number;
    column: number;
}

// =============================================================================
// Types
// =============================================================================

export interface TypeVisitor<R> {
    visitSimpleType(type: SimpleType): R;
    visitArrayType(type: ArrayType): R;
    visitStructType(type: StructType): R;
    visitTableType(type: TableType): R;
    visitAnyType(type: AnyType): R;
    visitAnyTableType(type: AnyTableType): R;
}

export abstract class Type {
    abstract accept<R>(visitor: TypeVisitor<R>): R;
}

export class SimpleType extends Type {
    constructor(public readonly kind: SimpleTypeKind) {
        super();
    }

    accept<R>(visitor: TypeVisitor<R>): R {
        return visitor.visitSimpleType(this);
    }
}

export class ArrayType extends Type {
    constructor(public readonly elementType: Type) {
        super();
    }

    accept<R>(visitor: TypeVisitor<R>): R {
        return visitor.visitArrayType(this);
    }
}

export class StructType extends Type {
    constructor(public readonly fields: { name: string; type: Type }[]) {
        super();
    }

    accept<R>(visitor: TypeVisitor<R>): R {
        return visitor.visitStructType(this);
    }
}

export class TableType extends Type {
    constructor(public readonly columns: { name: string; type: Type }[]) {
        super();
    }

    accept<R>(visitor: TypeVisitor<R>): R {
        return visitor.visitTableType(this);
    }
}

export class AnyType extends Type {
    constructor() {
        super();
    }

    accept<R>(visitor: TypeVisitor<R>): R {
        return visitor.visitAnyType(this);
    }
}

export class AnyTableType extends Type {
    constructor() {
        super();
    }

    accept<R>(visitor: TypeVisitor<R>): R {
        return visitor.visitAnyTableType(this);
    }
}

// =============================================================================
// Expressions
// =============================================================================

export interface ExprVisitor<R> {
    visitAssignExpr(expr: Assign, context?: any): R;
    visitBinaryExpr(expr: Binary, context?: any): R;
    visitCallExpr(expr: Call, context?: any): R;
    visitGroupingExpr(expr: Grouping, context?: any): R;
    visitLiteralExpr(expr: Literal, context?: any): R;
    visitLogicalExpr(expr: Logical, context?: any): R;
    visitUnaryExpr(expr: Unary, context?: any): R;
    visitVariableExpr(expr: Variable, context?: any): R;
    visitGetExpr(expr: Get, context?: any): R;
    visitCaseExpr(expr: CaseExpr, context?: any): R;
}

export abstract class Expr {
    abstract accept<R>(visitor: ExprVisitor<R>, context?: any): R;
}

export class CaseExpr extends Expr {
    constructor(
        public readonly cases: { condition: Expr; result: Expr }[],
        public readonly elseBranch: Expr | null
    ) {
        super();
    }

    accept<R>(visitor: ExprVisitor<R>, context?: any): R {
        return visitor.visitCaseExpr(this, context);
    }
}

export class Assign extends Expr {
    constructor(public readonly name: string, public readonly value: Expr) {
        super();
    }

    accept<R>(visitor: ExprVisitor<R>, context?: any): R {
        return visitor.visitAssignExpr(this, context);
    }
}

export class Binary extends Expr {
    constructor(
        public readonly left: Expr,
        public readonly operator: BinaryOperator,
        public readonly right: Expr
    ) {
        super();
    }

    accept<R>(visitor: ExprVisitor<R>, context?: any): R {
        return visitor.visitBinaryExpr(this, context);
    }
}

export class Call extends Expr {
    constructor(
        public readonly callee: Expr,
        public readonly args: Expr[]
    ) {
        super();
    }

    accept<R>(visitor: ExprVisitor<R>, context?: any): R {
        return visitor.visitCallExpr(this, context);
    }
}

export class Grouping extends Expr {
    constructor(public readonly expression: Expr) {
        super();
    }

    accept<R>(visitor: ExprVisitor<R>, context?: any): R {
        return visitor.visitGroupingExpr(this, context);
    }
}

export class Literal extends Expr {
    constructor(
        public readonly kind: LiteralKind,
        public readonly value: string | number | boolean | null
    ) {
        super();
    }

    accept<R>(visitor: ExprVisitor<R>, context?: any): R {
        return visitor.visitLiteralExpr(this, context);
    }
}

export class Logical extends Expr {
    constructor(
        public readonly left: Expr,
        public readonly operator: BinaryOperator, // AND, OR are binary operators
        public readonly right: Expr
    ) {
        super();
    }

    accept<R>(visitor: ExprVisitor<R>, context?: any): R {
        return visitor.visitLogicalExpr(this, context);
    }
}

export class Unary extends Expr {
    constructor(public readonly operator: UnaryOperator, public readonly right: Expr) {
        super();
    }

    accept<R>(visitor: ExprVisitor<R>, context?: any): R {
        return visitor.visitUnaryExpr(this, context);
    }
}

export class Variable extends Expr {
    constructor(public readonly name: string) {
        super();
    }

    accept<R>(visitor: ExprVisitor<R>, context?: any): R {
        return visitor.visitVariableExpr(this, context);
    }
}

export class Get extends Expr {
    constructor(public readonly object: Expr, public readonly name: string) {
        super();
    }

    accept<R>(visitor: ExprVisitor<R>, context?: any): R {
        return visitor.visitGetExpr(this, context);
    }
}


// =============================================================================
// Statements
// =============================================================================

export interface SelectColumn {
    expression: Expr;
    alias: string | null;
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
    visitSetStmt(stmt: SetStmt): R;
    visitAsStmt(stmt: AsStmt): R;
    visitCallStmt(stmt: CallStmt): R;
    visitCreateFunctionStmt(stmt: CreateFunctionStmt): R;
    visitCreateTableFunctionStmt(stmt: CreateTableFunctionStmt): R;
}

export abstract class Stmt {
    abstract accept<R>(visitor: StmtVisitor<R>): R;
}

export class FunctionParam {
    constructor(
        public readonly name: string,
        public readonly type: Type,
        public readonly defaultValue: Expr | null = null
    ) { }
}

export class CreateFunctionStmt extends Stmt {
    constructor(
        public readonly modifiers: string[], // TEMP, PUBLIC, PRIVATE
        public readonly name: string,
        public readonly params: FunctionParam[],
        public readonly returnType: Type | null,
        public readonly determinism: string | null, // DETERMINISTIC
        public readonly language: string | null, // js
        public readonly options: { key: string; value: Expr }[],
        public readonly body: Expr | string, // Expr for SQL, string for JS
    ) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitCreateFunctionStmt(this);
    }
}

export class CreateTableFunctionStmt extends Stmt {
    constructor(
        public readonly modifiers: string[], // TEMP, PUBLIC, PRIVATE
        public readonly name: string,
        public readonly params: FunctionParam[],
        public readonly returnSchema: TableType | null,
        public readonly body: Stmt, // The query body
    ) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitCreateTableFunctionStmt(this);
    }
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
    constructor(public readonly table: string) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitFromStmt(this);
    }
}

export abstract class PipeOperatorStmt extends Stmt { }

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
    alias: string;
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
    constructor(public readonly renames: { from: string; to: string }[]) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitRenameStmt(this);
    }
}

export class OrderByStmt extends PipeOperatorStmt {
    constructor(public readonly columns: { expression: Expr; direction: OrderByDirection }[]) {
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
    constructor(
        public readonly table: string,
        public readonly on: Expr,
        public readonly type: JoinType = JoinType.INNER
    ) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitJoinStmt(this);
    }
}

export class SetStmt extends PipeOperatorStmt {
    constructor(
        public readonly operator: SetOperator,
        public readonly query: QueryStmt,
        public readonly distinct: boolean = false
    ) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitSetStmt(this);
    }
}

export class AsStmt extends PipeOperatorStmt {
    constructor(public readonly name: string) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitAsStmt(this);
    }
}

export class CallStmt extends PipeOperatorStmt {
    constructor(public readonly name: string, public readonly args: Expr[]) {
        super();
    }

    accept<R>(visitor: StmtVisitor<R>): R {
        return visitor.visitCallStmt(this);
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
