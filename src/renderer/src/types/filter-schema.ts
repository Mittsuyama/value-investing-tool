export type FilterSchemaRelation = 'greater-than' | 'less-than';

export type OperationType = '+' | '-' | '*' | '/';

export type RPNExpression = Array<OperationType | number | string>;

export interface FilterSchema {
  id: string;
  title: string;
  expression: string;
  RPN: RPNExpression;
  limit: [number | null, number | null];
  /** 亿/万 */
  limitUnit: 'y' | 'w' | null;
}
