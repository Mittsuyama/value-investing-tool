import { ZCFZ_ITEM_TO_KEY, XJLL_ITEM_TO_KEY, LR_ITEM_TO_KEY } from '@renderer/constants/accounting-item';

type ItemName = keyof typeof LR_ITEM_TO_KEY | keyof typeof ZCFZ_ITEM_TO_KEY | keyof typeof XJLL_ITEM_TO_KEY;

type FinancialData = Record<ItemName, string | number | undefined>;

/** 财报数据结构：financial-data[code][month][year][zcfz|xjll|lr] */
export interface StockFinancialData {
  /** 股票代码 */
  code: string;

  /** 公司名称 */
  name: string;

  /** 某年 年报 */
  annualFinancialData: Record<number, FinancialData>;
}
