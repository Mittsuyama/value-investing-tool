import type { StockInfoInStore } from '@renderer/types';
import { getStore, setStore } from './utils';

export const getAllStocks = async (): Promise<Array<StockInfoInStore>> => {
  const stocks = await getStore('all-stocks') || [];
  return stocks;
};

export const setAllStocks = async (stocks: Array<StockInfoInStore>) => {
  return await setStore('all-stocks', stocks);
};

