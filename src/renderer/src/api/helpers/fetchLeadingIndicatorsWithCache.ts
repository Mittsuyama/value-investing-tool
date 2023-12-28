import { db } from '@renderer/api/db';
import { fetchLeadingIndicators } from '@renderer/api/service';
import { StockWithLeadingIndicators } from '@renderer/types';
import { message } from 'antd';

interface FetchLeadingIndicatorsWithCacheOptions {
  forceUpdate?: boolean;
}

export const fetchLeadingIndicatorsWithCache = async (stocks: string[], options?: FetchLeadingIndicatorsWithCacheOptions) => {
  const { forceUpdate } = options || {};

  let cachedList: StockWithLeadingIndicators[];
  if (forceUpdate) {
    cachedList = [];
  } else {
    cachedList = await db.stockWithLeadingIndicatorsList.where('id').anyOf(stocks).toArray();
  }
  const cachedIdSet = new Set(cachedList.map((item) => item.id));

  if (cachedIdSet.size === stocks.length) {
    return cachedList;
  }

  const needFetchIds = stocks.filter((id) => !cachedIdSet.has(id));
  const baseStockList = await db.stockBaseInfoList.where('id').anyOf(needFetchIds).toArray();

  if (baseStockList.length < needFetchIds.length) {
    message.error({
      type: 'error',
      content: '请先获取股票基本信息',
    });
    throw new Error('请先获取股票基本信息');
  }

  const response = await Promise.all(baseStockList.map(async (stock) => await fetchLeadingIndicators(stock)));
  db.stockWithLeadingIndicatorsList.bulkPut(response);

  const  res = [
    ...response,
    ...cachedList,
  ].sort((a, b) => stocks.findIndex((item) => item === a.id) - stocks.findIndex((item) => item === b.id));

  console.log(res);

  return res;
};

