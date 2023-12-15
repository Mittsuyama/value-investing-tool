import { memo } from 'react';
import { Button, Space, Spin, Table, Divider, Input } from 'antd';
import { useAtomValue } from 'jotai';
import { useLiveQuery } from 'dexie-react-hooks';
import { NameColumn } from '@renderer/components/TableColumn';
import { db } from '@renderer/api/db';
import { favoriteStockIdListAtom } from '@renderer/api/localstorage';

const PAGE_SIZE = 20;

export const MyFavorite = memo(() => {
  const favoriteList = useAtomValue(favoriteStockIdListAtom);

  const list = useLiveQuery(
    async () => {
      const collect = await db.stockBaseInfoList.toArray();
      return collect.filter((item) => {
        return Boolean(favoriteList.find((id) => id === item.id));
      });
    },
    [favoriteList],
  );

  return (
    <div className="w-full h-full overflow-auto p-6 text-base font-sans box-border">
      <div className="text-lg mb-4 bold">
        我的收藏
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

MyFavorite.displayName = 'MyFavorite';

