import type { StockBaseInfo, LeadingIndicators, StockWithLeadingIndicators } from '@renderer/types';
import { RemoteError } from '@renderer/api/service/RemoteError';
import { get } from '@renderer/api/service/utils';

const url = 'https://datacenter.eastmoney.com/securities/api/data/get';

export const fetchLeadingIndicators = async (stock: StockBaseInfo): Promise<StockWithLeadingIndicators> => {
  let filter = `(SECUCODE="${stock.code}.${stock.stockExchangeName}")`;
  filter += '(REPORT_TYPE="年报")';

  const res = await get(url, {
    type: 'RPT_F10_FINANCE_MAINFINADATA',
    sty: 'APP_F10_MAINFINADATA',
    quoteColumns: '',
    filter,
    p: 1,
    ps: 11,
    sr: -1,
    st: 'REPORT_DATE',
    source: 'HSF10',
    client: 'PC',
  });

  if (!res.result.data) {
    throw new RemoteError(500, 'fetch leading indicators failed');
  }

  return {
    ...stock,
    indicators: (res.result.data as any[]).map<LeadingIndicators>((item: any) => ({
      ...item,
      reportYear: Number(item.REPORT_YEAR),
    })),
  };
};
