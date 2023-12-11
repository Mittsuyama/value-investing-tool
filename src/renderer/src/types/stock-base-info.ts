export interface StockBaseInfo {
  /** 唯一标识符，由 {code}.{stockExchangeNam} 组成 */
  id: string;

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

  /** 行业 */
  INDUSTRY: string;
}
