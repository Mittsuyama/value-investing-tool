export interface BaseStockInfo {
  /** 股票代码 */
  code: string;

  /** 证交所 */
  stockExchangeName: string;

  /** 股票中文名 */
  name: string;

  /** ROE_WEIGHT */
  roe: number;

  /** 总市值 */
  totalMarketCap: number;

  /** 滚动市盈率 */
  ttmPe: number;
}

export interface StockInfoInStore extends BaseStockInfo {
  hasReports?: number[];
}

