import type { StockFinancialData } from '@renderer/types';
import { getStore } from '@renderer/api/utils';

export const getAllStocksFinancialDataStatus = async (): Promise<Array<StockFinancialData>> => {
  const stocks = await getStore('financial-data') || [];
  return stocks;
};
