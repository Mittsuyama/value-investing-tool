import { memo, useState } from 'react';
import { useMemoizedFn, useMount } from 'ahooks';
import { Button, Space, Spin, Table, Popconfirm } from 'antd';
import type { BaseStockInfo, DatabaseInfo } from '@renderer/types';
import {
  getAllStocks,
  setAllStocks as setAllStocksToElectronStore,
  setDatabaseInfo as setDatabaseInfoToElectronStore,
  fetchStocksByFilter,
  getDatabaseInfo,
  getAppUserDataPath,
  openPath
} from '@renderer/api';
import { clearStore } from '@renderer/api/utils';

export const SettingsDatabase = memo(() => {
  const [allStocks, setAllStocks] = useState<BaseStockInfo[] | null>(null)
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null);
  const [appUserDataPath, setAppUserDataPath] = useState<string | null>(null);
  const [fetchAllStocksLoading, setFetchAllStocksLoading] = useState(false);

  const refreshData = useMemoizedFn(async () => {
    setDatabaseInfo(await getDatabaseInfo());
    setAllStocks(await getAllStocks());
    setAppUserDataPath(await getAppUserDataPath());
  });

  useMount(async () => {
    refreshData();
  });

  const fetchAllStocks = useMemoizedFn(async () => {
    setFetchAllStocksLoading(true);
    try {
      const stocks = await fetchStocksByFilter({});
      setAllStocks(stocks);
      setAllStocksToElectronStore(stocks);

      const newDataBaseInfo: DatabaseInfo = {
        ...databaseInfo,
        updateTime: {
          ...databaseInfo?.updateTime,
          'all-stocks': Date.now(),
        },
      };
      setDatabaseInfo(newDataBaseInfo);
      setDatabaseInfoToElectronStore(newDataBaseInfo)
    } finally {
      setFetchAllStocksLoading(false);
    }
  });

  return (
    <div className="w-full h-full overflow-auto p-4 text-base font-sans">
      <div className="text-lg mb-2">
        文件信息
      </div>
      <div className="mb-4">
        <Space size={16} wrap>
          <div>数据存放位置:</div>
          {
            appUserDataPath
              ? (
                <>
                  <div>{appUserDataPath}</div>
                  <Button onClick={() => openPath(appUserDataPath)}>打开文件夹位置</Button>
                  <Popconfirm
                    title="确认清除"
                    description="清除后数据将无法找回"
                    onConfirm={async () => {
                      await clearStore();
                      await refreshData();
                    }}
                    okText="确认"
                    cancelText="取消"
                  >
                    <Button danger>清除所有数据</Button>
                  </Popconfirm>
                </>
              )
              : <Spin />
          }
        </Space>
      </div>
      <div className="text-lg mb-2">
        股票基本信息
      </div>
      <div className="mb-4">
        <Space size={24} wrap>
          <Space size={16}>
            {
              allStocks
                ? (
                  <>
                    <div>股票数量:</div>
                    <div>{allStocks.length}</div>
                  </>
                )
                : <Spin />
            }
          </Space>
          <Space size={16}>
            {
              databaseInfo
                ? (
                  <>
                    <div>更新时间:</div>
                    <div>
                      {
                        databaseInfo.updateTime?.['all-stocks']
                          ? (new Date(databaseInfo.updateTime?.['all-stocks'])).toLocaleString()
                          : '无数据'
                      }
                    </div>
                  </>
                )
                : <Spin />
            }
          </Space>
          <Button loading={fetchAllStocksLoading} onClick={fetchAllStocks}>
            更新数据
          </Button>
        </Space>
      </div>
      <Spin spinning={!allStocks}>
        <Table
          pagination={{
            pageSize: 5,
          }}
          rowKey="code"
          dataSource={allStocks || []}
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
              defaultSortOrder: 'descend',
              sorter: (a, b) => a.totalMarketCap - b.totalMarketCap,
            },
          ]}
        />
      </Spin>
      <div className="text-lg mb-2">
        主要指标数据
      </div>
    </div>
  )
});

SettingsDatabase.displayName = 'SettingsDatabase';
