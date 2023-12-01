import { useMemoizedFn, useMount } from 'ahooks';
import { Table, Spin, Button } from 'antd';
import type { StockInfoInStore } from '@renderer/types';
import {
  getAllStocks,
  setAllStocks,
  fetchStocksByFilter,
} from '@renderer/api';
import { memo, useState } from 'react';

export const Manager = memo(() => {
  const [list, setList] = useState<StockInfoInStore[]>([]);
  const [loading, setLoading] = useState(true);

  useMount(async () => {
    const stocks = await getAllStocks();
    setList(stocks);
    setLoading(false);
  });

  const fetchAllStocks = useMemoizedFn(async () => {
    setLoading(true);
    const stocks = await fetchStocksByFilter({});
    await setAllStocks(stocks);
    setList(stocks);
    setLoading(false);
  });

  return (
    <div className="w-full h-full overflow-auto">
      <div className="w-full px-5">
        <div className="flex py-4 items-center">
          <Button onClick={fetchAllStocks}>
            获取所有股票
          </Button>
        </div>
        <Spin spinning={loading}>
          <Table
            rowKey="code"
            dataSource={list}
            columns={[
              {
                title: '名称',
                key: 'name',
                dataIndex: 'name',
              },
              {
                title: '代码',
                key: 'code',
                dataIndex: 'code',
              },
              {
                title: 'TTM 市盈率',
                key: 'ttm-pe',
                dataIndex: 'ttmPe',
              },
              {
                title: 'ROE',
                key: 'roe',
                dataIndex: 'roe',
              },
              {
                title: '市值',
                key: 'totalMarketCap',
                dataIndex: 'totalMarketCap',
              },
              {
                title: '财报数据状态',
                key: 'totalMarketCap',
                render() {
                  return (
                    <div>
                      未获取
                    </div>
                  );
                },
              },
            ]}
          />
        </Spin>
      </div>
    </div>
  )
});

Manager.displayName = 'Manager';

