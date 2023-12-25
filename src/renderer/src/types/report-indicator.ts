import { RPNExpression } from './filter-schema';

export type ReportIndicatorUnit = '%' | 'none';

export interface ReportIndicator {
  /** 筛选标识符 id */
  id: string;

  /** 筛选项名称 */
  title?: string;

  /** 中缀表达式 */
  expression?: string;

  /** 逆波兰表达式 */
  RPN?: RPNExpression;

  /** 单位 */
  unit?: ReportIndicatorUnit;
}

export interface ReportIndicatorGroup {
  id: string;
  title: string;
  indicators: ReportIndicator[];
}
