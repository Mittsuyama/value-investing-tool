import { ZCFZ_ITEM_TO_KEY, XJLL_ITEM_TO_KEY, LR_ITEM_TO_KEY } from '@renderer/constants/accounting-item';

export type ItemName = keyof typeof LR_ITEM_TO_KEY | keyof typeof ZCFZ_ITEM_TO_KEY | keyof typeof XJLL_ITEM_TO_KEY;

export type FinancialReportData = Record<string, string | number | undefined>;

export interface StockWithFinancialReportData {
  id: string;

  /** 股票代码 */
  code: string;

  /** 公司名称 */
  name: string;

  /** 某年年报 */
  financialReportData: FinancialReportData[];
}
