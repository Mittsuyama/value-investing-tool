import { memo, useState } from 'react';
import { Button, Space, Spin, Table, Divider, message } from 'antd';
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import { useAsyncEffect, useMemoizedFn } from 'ahooks';
import type { StockBaseInfo } from '@renderer/types';
import { MetaInfo } from '@renderer/types/meta';
import { StoreKeys } from '@renderer/constants';
import { fetchLeadingIndicatorsWithCache } from '@renderer/api/helpers/fetchLeadingIndicatorsWithCache';
import { fetchStocksByFilter } from '@renderer/api/service';
import { db } from '@renderer/api/db';
import { NameColumn } from '@renderer/components/TableColumn';
import {
  getMetaInfo,
  setMetaInfo as setLocalstorageMetaInfo,
} from '@renderer/api/localstorage';
import { StockBaseInfoFilterForm, StockBaseInfoFilterValues } from './StockBaseInfoFilterForm';
import { useLiveQuery } from 'dexie-react-hooks';

const PAGE_SIZE = 20;

const key = 'stock-base-info-filter-values';
const filterFormValuesAtom = atomWithStorage<StockBaseInfoFilterValues>(
  key,
  JSON.parse(localStorage.getItem(key) || '{}'),
);

export const StockBaseInfoList = memo(() => {
  const [metaInfo, setMetaInfo] = useState(getMetaInfo());
  const [fetching, setFetching] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Array<string>>([]);
  const [list, setList] = useState<StockBaseInfo[] | undefined>(undefined);
  const [filters, setFilters] = useAtom(filterFormValuesAtom);

  const listBeforeFilter = useLiveQuery(() => db.stockBaseInfoList.toArray());

  const handleListFilter = useMemoizedFn((values: StockBaseInfoFilterValues, list?: StockBaseInfo[]) => {
    if (!list) {
      return undefined;
    }
    return list.filter((item) => {
      if (values.maxPe && item.ttmPe >  Number(values.maxPe)) {
        return false;
      }
      if (values.minPe && item.ttmPe < Number(values.minPe)) {
        return false;
      }
      if (values.maxROE && item.roe > Number(values.maxROE)) {
        return false;
      }
      if (values.minROE && item.roe < Number(values.minROE)) {
        return false;
      }
      if (
        values.searchKey
          && item.id.toLowerCase().indexOf(values.searchKey) === -1
          && item.name.toLowerCase().indexOf(values.searchKey) === -1
      ) {
        return true;
      }
      return true;
    });
  });

  useAsyncEffect(
    async () => {
      setList(handleListFilter(filters, listBeforeFilter));
    },
    [listBeforeFilter, filters],
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
            {selectedKeys.length
              ? (
                <Button
                  type="primary"
                  onClick={() => fetchLeadingIndicatorsWithCache(selectedKeys, { forceUpdate: true })}
                >
                  获取所选股主要指标
                </Button>
              )
              : (
                <Button
                  type="primary"
                  onClick={() => list && fetchLeadingIndicatorsWithCache(list.map((item) => item.id), { forceUpdate: true })}
                >
                  获取表内所有股主要指标
                </Button>
              )
            }
            <Button loading={fetching} onClick={fetchList}>
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
      <div className="mb-4">
        <StockBaseInfoFilterForm
          initialValues={filters}
          disabled={!list}
          onSubmit={setFilters}
        />
      </div>
      <Spin spinning={!list}>
        <Table
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedKeys,
            onChange: (keys) => setSelectedKeys(keys.map(String)),
          }}
          pagination={{
            pageSize: PAGE_SIZE,
            showQuickJumper: true,
          }}
          rowKey="id"
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
