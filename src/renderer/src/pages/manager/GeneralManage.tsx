import { memo, useState } from 'react';
import { useMemoizedFn, useMount } from 'ahooks';
import { Table, Spin, Button } from 'antd';
import { useLocation } from 'react-router-dom';
import type { BaseStockInfo } from '@renderer/types';
import {
  getAllStocks,
  setAllStocks,
  fetchStocksByFilter,
} from '@renderer/api';

export const GeneralManage = memo(() => {
  const { pathname } = useLocation();
  console.log('pathname', pathname);

  const [list, setList] = useState<BaseStockInfo[]>([]);
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
                render: (value) => Number(value).toFixed(2),
              },
              {
                title: 'ROE',
                key: 'roe',
                dataIndex: 'roe',
                render: (value) => Number(value).toFixed(2),
              },
              {
                title: '市值',
                key: 'totalMarketCap',
                dataIndex: 'totalMarketCap',
                render: (value) => `${(Number(value) / 1_0000_0000).toFixed(2)} 亿`,
              },
            ]}
          />
        </Spin>
      </div>
    </div>
  )
});

GeneralManage.displayName = 'GeneralManage';

