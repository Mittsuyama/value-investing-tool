import type { BaseStockInfo } from '@renderer/types';
import { getStore } from './utils';

export const getAllStocks = async (): Promise<BaseStockInfo> => {
  const stocks = await getStore('all-stocks') || [];
  return stocks;
};

