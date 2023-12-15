import { memo, useState } from 'react';
import { Button, Space, Spin, Table, Divider, message, Input } from 'antd';
import { useMemoizedFn } from 'ahooks';
import { useLiveQuery } from 'dexie-react-hooks';
import { MetaInfo } from '@renderer/types/meta';
import { StoreKeys } from '@renderer/constants';
import { fetchStocksByFilter } from '@renderer/api/service';
import { db } from '@renderer/api/db';
import { NameColumn } from '@renderer/components/TableColumn';
import {
  getMetaInfo,
  setMetaInfo as setLocalstorageMetaInfo,
} from '@renderer/api/localstorage';

const PAGE_SIZE = 10;

export const StockBaseInfoList = memo(() => {
  const [metaInfo, setMetaInfo] = useState(getMetaInfo());
  const [fetching, setFetching] = useState(false);
  const [searchKey, setSearchKey] = useState('');

  const list = useLiveQuery(
    async () => {
      const collect = await db.stockBaseInfoList.toArray();
      if (!searchKey) {
        return collect;
      }
      return collect.filter((item) => {
        return item.code.toLowerCase().indexOf(searchKey.toLowerCase()) >= 0 || item.name.indexOf(searchKey.toLowerCase()) >= 0;
      });
    },
    [searchKey],
  );

  const fetchList = useMemoizedFn(async () => {
    setFetching(true);
    try {
      const res = await fetchStocksByFilter({});
      await db.stockBaseInfoList.clear();
      await db.stockBaseInfoList.bulkAdd(res);
      const newMetaInfo: MetaInfo = {
        ...metaInfo,
        updateTime: {
          ...metaInfo?.updateTime,
          [StoreKeys.ALL_STOCKS_BASE_INFO]: Date.now(),
        },
      };
      setMetaInfo(newMetaInfo);
      setLocalstorageMetaInfo(newMetaInfo);
    } catch (e) {
      console.error(e);
      message.error('获取失败')
    } finally {
      setFetching(false);
    }
  });

  return (
    <div className="w-full h-full overflow-auto p-6 text-base font-sans box-border">
      <div className="text-lg mb-4 bold">
        股票基本信息
      </div>
      <div className="mb-4">
        <Space size={24} wrap split={<Divider type="vertical" />}>
          <Space size={16}>
            {
              list
                ? (
                  <>
                    <div>股票数量:</div>
                    <div>{list.length || 'loading'}</div>
                  </>
                )
                : <Spin />
            }
          </Space>
          <Space size={16}>
            <div>搜索:</div>
            <Input.Search onSearch={(value) => setSearchKey(value)} />
          </Space>
          <Space size={16}>
            {
              list
                ? (
                  <>
                    <div>更新时间:</div>
                    <div>
                      {
                        metaInfo.updateTime?.[StoreKeys.ALL_STOCKS_BASE_INFO]
                          ? (new Date(metaInfo.updateTime?.[StoreKeys.ALL_STOCKS_BASE_INFO])).toLocaleString()
                          : '无数据'
                      }
                    </div>
                  </>
                )
                : <Spin />
            }
          </Space>
          <Space size={16}>
            <Button type="primary" loading={fetching} onClick={fetchList}>
              全量更新数据
            </Button>
            <Button
              onClick={async () => {
                await db.stockBaseInfoList.clear();
                const newMetaInfo: MetaInfo = {
                  ...metaInfo,
                  updateTime: {
                    ...metaInfo?.updateTime,
                    [StoreKeys.ALL_STOCKS_BASE_INFO]: undefined,
                  },
                };
                setMetaInfo(newMetaInfo);
                setLocalstorageMetaInfo(newMetaInfo);
              }}
              danger
            >
              清除数据
            </Button>
          </Space>
        </Space>
      </div>
      <Spin spinning={!list}>
        <Table
          pagination={{
            pageSize: PAGE_SIZE,
            showQuickJumper: true,
          }}
          rowKey="code"
          dataSource={list || []}
          columns={[
            {
              title: '名称',
              key: 'name',
              dataIndex: 'name',
              render: (name: string, record) => {
                return <NameColumn name={name} id={record.id} />;
              },
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
    </div>
  )
});

StockBaseInfoList.displayName = 'settings/StockBaseInfoList';
