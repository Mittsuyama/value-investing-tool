import {RemoteError} from '@renderer/api/RemoteError';
import { get } from '@renderer/api/utils';

const url = 'https://datacenter.eastmoney.com/securities/api/data/v1/get';

interface FetchLeadingIndicatorsParams {
  yearCount: number;
  code: string;
  exchangeName: string;
}

export const fetchLeadingIndicators = async (params: FetchLeadingIndicatorsParams) => {
  let filter = '(SEASON_LABEL="四季度")';
  filter += `(SECUCODE="${params.code}.${params.exchangeName}")`;

  const res = await get(url, {
    reportName: 'RPT_F10_QTR_MAINFINADATA',
    columns: 'ALL',
    filter,
    pageNumber: 1,
    pageSize: params.yearCount,
    sortTypes: -1,
    sortColumns: 'REPORT_DATE',
    source: 'HSF10',
    client: 'PC',
  });

  if (!res.result.data) {
    throw new RemoteError(500, 'fetch leading indicators failed');
  }

  return res.result.data;
};
