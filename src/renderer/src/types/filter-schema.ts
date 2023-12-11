export type FilterSchemaRelation = 'greater-than' | 'less-than';

export type OperationType = '+' | '-' | '*' | '/';

export type RPNExpression = Array<OperationType | number | string>;

export interface FilterSchema {
  /** 筛选标识符 id */
  id: string;

  /** 筛选项名称 */
  title?: string;

  /** 中缀表达式 */
  expression?: string;

  /** 逆波兰表达式 */
  RPN?: RPNExpression;

  /** 限制 */
  limit?: [number | undefined, number | undefined];

  /** 亿/万/无单位 */
  limitUnit?: 'y' | 'w';
}
