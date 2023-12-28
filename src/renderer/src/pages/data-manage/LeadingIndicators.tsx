import { memo, useState, useRef } from 'react';
import { useMemoizedFn } from 'ahooks';
import { Button, Space, Spin, Table, message, Progress, Divider } from 'antd';
import { useLiveQuery } from 'dexie-react-hooks';
import type { MetaInfo } from '@renderer/types/meta';
import { fetchLeadingIndicators } from '@renderer/api/service';
import { db } from '@renderer/api/db';
import {
  getMetaInfo,
  setMetaInfo as setLocalstorageMetaInfo,
} from '@renderer/api/localstorage';
import { StoreKeys } from '@renderer/constants';
import { ButtonWithThrottle } from '@renderer/components/ButtonWithThrottle';

const PAGE_SIZE = 20;
const FETCH_STOCK_WITH_LEADING_INDICATORS_TOTAL_PAGE = 50;

export const LeadingIndicators = memo(() => {
  const [metaInfo, setMetaInfo] = useState(getMetaInfo());
  const [fetching, setFetching] = useState(false);
  const [current, setCurrent] = useState(1);
  const [fetchingProgress, setFetchProgress] = useState<null | number>(null);

  const stopFetching = useRef(false);

  const total = useLiveQuery(() => db.stockWithLeadingIndicatorsList.count());
  const list = useLiveQuery(
    () => db
      .stockWithLeadingIndicatorsList
      .offset((current - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray(),
    [current],
  );
  const stockBaseInfoList = useLiveQuery(() => db.stockBaseInfoList.toArray());

  const fetchFromPage = useMemoizedFn(async (page: number) => {
    if (stopFetching.current) {
      setFetching(false);
      return;
    }
    if (!stockBaseInfoList || !stockBaseInfoList.length) {
      message.error({
        type: 'error',
        content: '请先获取股票基本信息',
      });
      return;
    }
    setFetching(true);
    setFetchProgress(page);
    const newMetaInfo: MetaInfo = {
      ...metaInfo,
      stocksWithLeadingIndicatorsFetchingPage: page,
    };
    setMetaInfo(newMetaInfo);
    setLocalstorageMetaInfo(newMetaInfo);

    const pageSize = stockBaseInfoList.length / FETCH_STOCK_WITH_LEADING_INDICATORS_TOTAL_PAGE;
    const res = await Promise.all(
      stockBaseInfoList
        .slice(page * pageSize, (page + 1) * pageSize)
        .map(async (stock) => await fetchLeadingIndicators(stock)),
    );

    // 成功获取一页数据
    db.stockWithLeadingIndicatorsList.bulkPut(res);

    // 已全部获取
    if (page === FETCH_STOCK_WITH_LEADING_INDICATORS_TOTAL_PAGE - 1) {
      const newMetaInfo: MetaInfo = {
        ...metaInfo,
        updateTime: {
          ...metaInfo?.updateTime,
          [StoreKeys.ALL_STOCKS_WITH_LEADING_INDICATORS]: Date.now(),
        },
      };
      setMetaInfo(newMetaInfo);
      setLocalstorageMetaInfo(newMetaInfo);
      setFetching(false);
    }

    // 继续获取下一页 (延迟一下，避免拥塞)
    if (page < FETCH_STOCK_WITH_LEADING_INDICATORS_TOTAL_PAGE) {
      setTimeout(() => fetchFromPage(page + 1), 0);
    }
  });

  return (
    <div className="w-full h-full overflow-auto p-6 text-base font-sans box-border">
      <div className="text-lg mb-4 bold">
        主要指标数据
      </div>
      <div className="mb-4">
        <Space size={24} wrap split={<Divider type="vertical" />}>
          <Space size={16}>
            {
              list
                ? (
                  <>
                    <div>已获取指标条数:</div>
                    <div>{total}</div>
                  </>
                )
                : <Spin />
            }
          </Space>
          <Space size={16}>
            {
              metaInfo
                ? (
                  <>
                    <div>更新时间:</div>
                    <div>
                      {
                        metaInfo.updateTime?.[StoreKeys.ALL_STOCKS_WITH_LEADING_INDICATORS]
                          ? (new Date(metaInfo.updateTime?.[StoreKeys.ALL_STOCKS_WITH_LEADING_INDICATORS])).toLocaleString()
                          : '无数据'
                      }
                    </div>
                  </>
                )
                : <Spin />
            }
          </Space>
          <Space size={16}>
            {fetching && (
              <Button onClick={() => stopFetching.current = true}>
                暂停获取
              </Button>
            )}
            {
              !fetching
                && metaInfo?.stocksWithLeadingIndicatorsFetchingPage
                && metaInfo.stocksWithLeadingIndicatorsFetchingPage < FETCH_STOCK_WITH_LEADING_INDICATORS_TOTAL_PAGE - 1
                ? (
                  <Button
                    onClick={() => {
                      stopFetching.current = false;
                      fetchFromPage(metaInfo?.stocksWithLeadingIndicatorsFetchingPage || 0)}
                    }
                  >
                    从断点处继续获取数据
                  </Button>
                )
                : null
            }
            <Button
              loading={fetching}
              onClick={() => fetchFromPage(0)}
            >
              全量更新数据
            </Button>
            <ButtonWithThrottle
              onClick={async () => {
                await db.stockWithLeadingIndicatorsList.clear();
                const newMetaInfo: MetaInfo = {
                  ...metaInfo,
                  updateTime: {
                    ...metaInfo?.updateTime,
                    [StoreKeys.ALL_STOCKS_WITH_LEADING_INDICATORS]: undefined,
                  },
                };
                setMetaInfo(newMetaInfo);
                setLocalstorageMetaInfo(newMetaInfo);
              }}
              danger
            >
              清除数据
            </ButtonWithThrottle>
          </Space>
        </Space>
      </div>
      {
        fetchingProgress !== null
          ? (
            <div className="w-full overflow-hidden flex items-center my-4">
              <div className="mr-4 flex-none">数据获取中</div>
              <Progress
                className="flex-1"
                percent={Math.round(fetchingProgress / FETCH_STOCK_WITH_LEADING_INDICATORS_TOTAL_PAGE * 100)}
              />
            </div>
          )
          : null
      }
      <Spin spinning={!list}>
        <Table
          pagination={{
            pageSize: PAGE_SIZE,
            total,
            current,
            onChange: setCurrent,
            showQuickJumper: true,
          }}
          rowKey="code"
          dataSource={list || []}
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
              title: '最近报表时间',
              key: 'latestReportTime',
              render: (_, record) => {
                return <div>{record.indicators[0].reportYear} 年</div>;
              },
            },
            {
              title: '最早报表时间',
              key: 'earliestReportTime',
              render: (_, record) => {
                return <div>{record.indicators[record.indicators.length - 1].reportYear} 年</div>;
              },
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
  );
});

LeadingIndicators.displayName = 'settings/LeadingIndicators';
