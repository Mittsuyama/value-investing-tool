import { memo, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { produce } from 'immer';
import { useAtom, useAtomValue } from 'jotai';
import { useAsyncEffect, useDebounceFn, useMemoizedFn } from 'ahooks';
import { Breadcrumb, Button, Space, Divider, Input } from 'antd';
import type { ItemType } from 'antd/lib/breadcrumb/Breadcrumb';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import { db } from '@renderer/api/db';
import { fetchTreeFinancialReportsData } from '@renderer/api/service/financialReportsData';
import { useToggoleFavoriteStockList } from '@renderer/api/localstorage';
import type { FinancialReportData, ReportIndicator } from '@renderer/types';
import { findMenu } from '@renderer/routers/menus';
import { BalanceItemDistribution, SheetType } from '@renderer/components/BalanceItemDistribution/BalanceItemDsitribution';
import { IndicatorTable } from '@renderer/components/IndicatorTable';
import { IndicatorGraph } from '@renderer/components/IndicatorGraph';
import { FRIGroupsAtom, followedFRIMapAtom } from '@renderer/models';
import { computeFinancialReportData } from './computeFinancialReportData';
import { formatFinancialNumber } from '@renderer/utils';
import { fetchFRDwithCache } from '@renderer/api/helpers';

const distributionGraph: Array<Array<{ type: SheetType, title: string }>> = [
  [
    { title: '流动资产', type: 'current-asset' },
    { title: '流动负债', type: 'current-debt' },
  ],
  [
    { title: '非流动资产', type: 'non-currnet-asset' },
    { title: '非流动负债', type: 'non-current-debt' },
  ],
];

export const FRIDetail = memo(() => {
  const { search } = useLocation();
  const history = useHistory();

  const FRIGruops = useAtomValue(FRIGroupsAtom);
  const [followedFRIMap, setFollowedFRIMap] = useAtom(followedFRIMapAtom);
  const [reports, setReports] = useState<Array<FinancialReportData>>([]);
  const [graph, setGraph] = useState(false);
  const [stockName, setStockName] = useState('');

  const { id: stockId, code, exchange, from } = useMemo(
    () => {
      const params = new URLSearchParams(search);
      const id = params.get('id') || '';
      const [codeFromSplit, exchangeFromSplit] = id.split('.');
      return {
        id,
        code: codeFromSplit,
        exchange: exchangeFromSplit,
        from: params.get('from') || undefined,
      };
    },
    [search],
  );

  const { has: inFavoriteList, toggle: toggleFavorite } = useToggoleFavoriteStockList(stockId);

  useAsyncEffect(
    async () => {
      if (!stockId) {
        return;
      }
      const [data] = await fetchFRDwithCache([stockId], { years: 6 });
      setStockName(data.name);
      setReports(data.financialReportData);
    },
    [stockId],
  );

  const breadItems = useMemo(
    () => {
      const res: ItemType[] = [];
      if (from) {
        const menu = findMenu(from);
        res.push({
          className: 'hover:bg-gray-100 px-2 py-1 cursor-pointer rounded',
          onClick: () => menu && history.push(menu.key),
          title: menu?.label,
        });
      }
      res.push({ title: `${stockName || '加载中'} (${stockId})` });
      return res;
    },
    [stockId, from, stockName],
  );

  const { list: followedFRIList, map: reasonMap } = useMemo(
    () => {
      const ids = followedFRIMap[stockId];
      if (!ids || !ids.length) {
        return {
          list: [] as ReportIndicator[],
          map: new Map(),
        };
      }
      const indicatorsMap = new Map(
        FRIGruops
          .map((group) => group.indicators.map<[string, ReportIndicator]>((ind) => [ind.id, ind]))
          .flat(),
      );
      const list = ids
        .map((item) => indicatorsMap.get(item.id))
        .filter((item): item is ReportIndicator => Boolean(item));
      return {
        list,
        map: new Map(ids.map((item) => [item.id, item.reason])),
      };
    },
    [followedFRIMap],
  );

  const onFollowChange = useMemoizedFn((id: string, isFollowed: boolean) => {
    if (isFollowed) {
      setFollowedFRIMap(produce(followedFRIMap, (draft) => {
        draft[stockId]
          ? (draft[stockId].push({ id, reason: '' }))
          : (draft[stockId] = [{ id, reason: '' }]);
      }));
    } else {
      setFollowedFRIMap(produce(followedFRIMap, (draft) => {
        if (draft[stockId]) {
          draft[stockId] = draft[stockId].filter((item) => item.id !== id);
        }
      }));
    }
  });

  const { run: onReasonChange } = useDebounceFn(
    useMemoizedFn((id: string, reason: string) => {
      const res = produce(followedFRIMap, (draft) => {
        const ind = draft[stockId]?.find((item) => item.id === id);
        if (ind) {
          ind.reason = reason;
        }
      });
      setFollowedFRIMap(res);
    }),
    { wait: 500 },
  );

  const onExportFollowTable = useMemoizedFn(() => {
    const header = `|指标|${reports.map((report) => `${report['REPORT_YEAR']} 年`).join('|')}|关注原因|`;
    const gap = `|${reports.map(() => '-').join('|')}|`;
    const cells = followedFRIList.map(({ id, title, RPN, unit }) => {
      const valueText = reports.map((_, index) => {
        if (!RPN) {
          return 0;
        }
        const value = computeFinancialReportData(
          RPN,
          reports,
          index,
        );
        return formatFinancialNumber(value, { unit });
      }).join('|');
      return `|${title}|${valueText}|${reasonMap.get(id) || ' '}|`;
    }).join('\n');
    navigator.clipboard.writeText(`${header}\n${gap}\n${cells}`);
  });

  return (
    <div className="w-full h-full overflow-auto p-6 text-base font-sans box-border">
      <div className="text-lg mb-4 bold ml-[-8px]">
        <Breadcrumb items={breadItems} />
      </div>
      <Space size={16} className="mb-4">
        <Button onClick={() => setGraph(!graph)} type="primary">
          {graph ? '切换为表格 (可编辑)' : '切换为图 (只读)'}
        </Button>
        <Button onClick={toggleFavorite}>
          <Space size={8}>
            {
              inFavoriteList
                ? <StarFilled style={{ color: 'orange' }} />
                : <StarOutlined />
            }
            <div>收藏个股</div>
          </Space>
        </Button>
        <Divider type="vertical" />
        <div>
          内容参考
        </div>
        <Button onClick={() => window.open(`https://emweb.securities.eastmoney.com/pc_hsf10/pages/index.html?type=web&code=${exchange}${code}#/cwfx`)}>
          东方财富 - 财务分析
        </Button>
        <Button onClick={() => window.open(`https://data.eastmoney.com/notices/stock/${code}.html`)}>
          东方财富 - 公告
        </Button>
      </Space>
      <div className="mb-4 text-base w-full">
        <IndicatorTable
          sortable
          setIndicators={(inds) => {
            setFollowedFRIMap(produce(followedFRIMap, (draft) => {
              draft[stockId] = inds.map((item) => ({
                id: item.id,
                reason: reasonMap.get(item.id) || ''
              }));
            }));
          }}
          indicators={followedFRIList}
          reports={reports}
          title={(
            <div className="flex items-center gap-2">
              <div className="pl-[2px] text-base font-bold">特别关注</div>
              <Button type="link" onClick={onExportFollowTable}>导出到 MD 表格</Button>
            </div>
          )}
          getIsFolllowed={() => true}
          onFollowChange={(id) => onFollowChange(id, false)}
          columns={[
            {
              title: '关注原因',
              render: (_, { id: indicatorId }) => (
                <div>
                  <Input.TextArea
                    autoSize
                    defaultValue={reasonMap.get(indicatorId)}
                    placeholder="输入关注原因"
                    onChange={(e) => onReasonChange(indicatorId, e.target.value)}
                  />
                </div>
              ),
            }
          ]}
        />
      </div>
      <div className="mb-4 text-base w-full">
        <div className="mb-4 font-bold">资产负债表项目占比</div>
        {
          distributionGraph.map((line) => (
            <div
              className="mb-4 w-full flex items-stretch gap-8"
              key={line.map((item) => item.title).join(',')}
            >
              {
                line.map(({ title, type }) => (
                  <div className="flex-1 overflow-hidden" key={title}>
                    <div className="text-sm mb-4">{title}</div>
                    <BalanceItemDistribution reports={reports} type={type} />
                  </div>
                ))
              }
            </div>
          ))
        }
      </div>
      {
        graph
          ? FRIGruops.map(({ indicators, title, id: groupId }) => (
            <IndicatorGraph
              title={title}
              key={groupId}
              reports={reports}
              indicators={indicators}
            />
          ))
          : FRIGruops.map(({ indicators, title, id: groupId }) => (
            <IndicatorTable
              getIsFolllowed={(id) => reasonMap.has(id)}
              title={title}
              key={groupId}
              reports={reports}
              indicators={indicators}
              onFollowChange={onFollowChange}
            />
          ))
      }
    </div>
  );
});

FRIDetail.displayName = 'FRIDetail';

/**
 * 财务公告列表
 * https://np-anotice-stock.eastmoney.com
 * /api
 * /security
 * /ann
 * ?page_size=999
 * &page_index=1
 * &ann_type=A
 * &client_source=web
 * &stock_list=002223
 */

/**
 * * 财报 pdf 下载地址
 * https://np-cnotice-stock.eastmoney.com
 * /api
 * /content
 * /ann
 * ?cb=jQuery112308377658519684115_1702105455419
 * &art_code=AN202310241602915742
 * &client_source=web
 * &page_index=1
 * &_=1702105455420
 */
