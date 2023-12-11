import type { Report } from '@renderer/types';
import { get } from './utils';

const YEAR_REPORT_DATE = "-12-31";
const CURRENT_YEAR = (new Date()).getFullYear();
const CURRENT_MONTH = (new Date()).getMonth();
export const LATEST_YEAR = CURRENT_MONTH > 3 ? CURRENT_YEAR - 1 : CURRENT_YEAR - 2;

export type ReportParams = {
  /** 4 */
  companyType: number;
  /** 0 */
  reportDateType: number;
  /** 2 */
  reportType: number;
  dates: string[];
  code: string;
};

interface FetchRerpotParams {
  code: string;
  cType: number;
  hostname: string;
  path: string;
  years: number;
}

export const fetchReport = async (params: FetchRerpotParams) => {
  const { code, cType, hostname, path, years } = params;

  const requestYears = Array.from({ length: years }, (_, index) => LATEST_YEAR - index).sort();
  const dates = requestYears.map((year) => `${year}${YEAR_REPORT_DATE}`);

  const body: Omit<ReportParams, 'dates'> = {
    companyType: cType,
    reportDateType: 0,
    reportType: 1,
    code,
  };

  // 一次只能请求 5 年的数据
  const batch = 5;
  const batchResponse = await Promise.all(Array.from({ length: Math.ceil(dates.length / batch) }).map(async (_, index) => {
    return await get(
      `${hostname}${path}`,
      {
        ...body,
        dates: dates.slice(index * batch, Math.min((index + 1) * batch, dates.length)),
      },
    );
  }));

  const resList: Report[] = batchResponse.reduce((pre, cur) => {
    return pre.concat(cur.data);
  }, []);

  resList.sort((a, b) => {
    const a_year = Number(a['REPORT_DATE']?.toString()?.split?.('-')?.[0]);
    const b_year = Number(b['REPORT_DATE']?.toString()?.split?.('-')?.[0]);
    return b_year - a_year;
  });

  return resList;
};

interface BundleRequestParams {
  stockIds: string[];
}

export const bundleRequest = async (params: BundleRequestParams & Pick<FetchRerpotParams, 'hostname' | 'path' | 'years'>) => {
  const { stockIds, hostname, path, years } = params;

  const reports = await Promise.all(
    stockIds
      .map((id) => {
        const [code, exchange] = id.split('.');
        return `${exchange.toUpperCase()}${code}`;
      })
      .map(async (code) => {
        // 开始获取
        for (let j = 4; j > 0; j--) {
          const data = await fetchReport({
            hostname,
            path,
            code,
            cType: j,
            years,
          });
          if (!data.length) {
            continue;
          }
          return data;
        }
        return [];
      })
  );

  return reports;
};

export const fetchTreeFinancialReportsData = async (stockIds: string[], years: number): Promise<Report[][]> => {
  const [
    zcfz,
    lr,
    xjll,
  ] = await Promise.all([
    bundleRequest({
      stockIds,
      years,
      hostname: 'https://emweb.securities.eastmoney.com',
      path: '/PC_HSF10/NewFinanceAnalysis/zcfzbAjaxNew',
    }),
    bundleRequest({
      stockIds,
      years,
      hostname: 'https://emweb.securities.eastmoney.com',
      path: '/PC_HSF10/NewFinanceAnalysis/lrbAjaxNew',
    }),
    bundleRequest({
      stockIds,
      years,
      hostname: 'https://emweb.securities.eastmoney.com',
      path: '/PC_HSF10/NewFinanceAnalysis/xjllbAjaxNew',
    }),
  ]);

  return zcfz.map((reports, index) => {
    return reports.map((report, j) => {
      return {
        ...report,
        ...lr[index][j],
        ...xjll[index][j],
      };
    })
  });
};
