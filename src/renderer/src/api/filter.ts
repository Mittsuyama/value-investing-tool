import { BaseStockInfo } from '@renderer/types';
import { get } from './utils';

const url = 'https://data.eastmoney.com/dataapi/xuangu/list';

interface FilterConfigs {
  /** PE 不大于 */
  maxPe?: number;

  /** PE 不小于 */
  minPe?: number;

  /** 总市值不低于 */
  minTotalMarketCAP?: number;

  /** ROE 不小于 */
  minROE?: number;

  /** 是否需要要求上市五年 */
  isOverFiveYear?: boolean;
}

export const fetchStocksByFilter = async (params: FilterConfigs): Promise<Array<BaseStockInfo>> => {
  const {
    maxPe,
    minPe,
    minTotalMarketCAP,
    minROE,
    isOverFiveYear,
  } = params;

  let filter = '';
  if (minPe) {
    filter += `(PE9>=${minPe})`;
  }
  if (maxPe) {
    filter += `(PE9<=${maxPe})`;
  }
  if (minTotalMarketCAP) {
    filter += `(TOTAL_MARKET_CAP<=${minTotalMarketCAP})`;
  }
  if (minROE) {
    filter += `(ROE_WEIGHT>=${minROE})`;
  }
  if (isOverFiveYear) {
    filter += '(@LISTING_DATE="OVER5Y")';
  }

  const res = await get(url, {
    st: 'CHANGE_RATE',
    sr: '-1',
    ps: '50',
    p: '1',
    sty: 'SECUCODE,SECURITY_CODE,SECURITY_NAME_ABBR,NEW_PRICE,CHANGE_RATE,VOLUME_RATIO,HIGH_PRICE,LOW_PRICE,PRE_CLOSE_PRICE,VOLUME,DEAL_AMOUNT,TURNOVERRATE,PE9,TOTAL_MARKET_CAP,ROE_WEIGHT,LISTING_DATE,INDUSTRY',
    filter,
    source: 'SELECT_SECURITIES',
    client: 'WEB',
    size: 9999,
  });

  if (!Array.isArray(res?.result?.data)) {
    return [];
  }

  return res.result.data;
};

