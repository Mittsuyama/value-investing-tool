import { db } from '@renderer/api/db';
import { fetchTreeFinancialReportsData } from '@renderer/api/service/financialReportsData';
import { StockWithFinancialReportData } from '@renderer/types';
import { fetchLeadingIndicatorsWithCache } from './fetchLeadingIndicatorsWithCache';

interface FetchFRDwithCacheOptions {
  years?: number;
}

export const fetchFRDwithCache = async (stocks: string[], options?: FetchFRDwithCacheOptions): Promise<StockWithFinancialReportData[]> => {
  const {
    years = 6,
  } = options || {};

  const cachedFRDList = await db.stockWithFRD.where('id').anyOf(stocks).toArray();
  const cachedIdSet = new Set(cachedFRDList.map((item) => item.id));

  if (cachedIdSet.size === stocks.length) {
    return cachedFRDList;
  }

  const needFetchIds = stocks.filter((id) => !cachedIdSet.has(id));
  const response = await fetchTreeFinancialReportsData(needFetchIds, years);
  const leadingIndicatorsList = await fetchLeadingIndicatorsWithCache(needFetchIds);

  const toBeCachedList = response.map<StockWithFinancialReportData>((reports, index) => {
    const stockWithLeadingIndicators = leadingIndicatorsList.find((item) => item.id === needFetchIds[index]);
    if (!stockWithLeadingIndicators) {
      throw new Error(`fetchFRDwithCache: not found indicators of ${needFetchIds[index]}`);
    }
    return {
      id: stockWithLeadingIndicators.id,
      name: stockWithLeadingIndicators.name,
      code: stockWithLeadingIndicators.code,
      financialReportData: reports.map((report, index) => ({
        ...report,
        ...stockWithLeadingIndicators.indicators[index],
      })),
    };
  });

  await db.stockWithFRD.bulkPut(toBeCachedList);

  return [
    ...toBeCachedList,
    ...cachedFRDList,
  ].sort((a, b) => stocks.findIndex((item) => item === a.id) - stocks.findIndex((item) => item === b.id));
};

