import type { BaseStockInfo } from '@renderer/types';
import { getStore, setStore } from './utils';

export const getAllStocks = async (): Promise<Array<BaseStockInfo>> => {
  const stocks = await getStore('all-stocks') || [];
  return stocks;
};

export const setAllStocks = async (stocks: Array<BaseStockInfo>) => {
  return await setStore('all-stocks', stocks);
};

