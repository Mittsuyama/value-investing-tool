export type FilterSchemaRelation = 'greater-than' | 'less-than';

export type OperationType = '+' | '-' | '*' | '/';

export type RPNExpression = Array<OperationType | number | string>;

export interface FilterSchema {
  id: string;
  title: string;
  expression: string;
  RPN: RPNExpression;
  relation: FilterSchemaRelation;
  value: number;
}