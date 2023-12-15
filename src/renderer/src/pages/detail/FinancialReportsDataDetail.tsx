import { memo, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAsyncEffect, useMap, useMemoizedFn } from 'ahooks';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import { Breadcrumb, Button, Input, Space, Table, Mentions, Divider, Select, Tooltip } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { ItemType } from 'antd/lib/breadcrumb/Breadcrumb';
import { Line } from '@ant-design/charts';
import { db } from '@renderer/api/db';
import { fetchTreeFinancialReportsData } from '@renderer/api/service/financialReportsData';
import {
  getFinancialReportDataIndicatorGroups,
  setFinancialReportDataIndicatorGroups,
  useToggoleFavoriteStockList,
} from '@renderer/api/localstorage';
import { ACCOUNT_ITEM, LEADING_INDICAOTR_ITEMS } from '@renderer/constants';
import type { Report, ReportIndicator, ReportIndicatorGroup } from '@renderer/types';
import { findMenu } from '@renderer/routers/menus';
import { transferToRPN, formatFinancialNumber } from '@renderer/utils';
import { computeFinancialReportData } from './computeFinancialReportData';
import { BalanceItemDistribution } from '@renderer/components/BalanceItemDistribution/BalanceItemDsitribution';

export const FinancialReportsDataDetail = memo(() => {
  const { search } = useLocation();
  const history = useHistory();

  const [graph, setGraph] = useState(false);

  const [reports, setReports] = useState<Array<Report>>([]);
  const [indicatorGroups, setIndicatorGroups] = useState(getFinancialReportDataIndicatorGroups());
  const [newGroupTile, setNewGoupTitle] = useState('');

  const [, { get: getIndicatorTitle, set: setIndicatorTitle }] = useMap<string, string>([]);
  const [, { get: getExpression, set: setExpression }] = useMap<string, string>([]);
  const [, { get: getErrorMessage, set: setErrorMessage }] = useMap<string, string>([]);
  const [, { get: getUnit, set: setUnit }] = useMap<string, '%' | null>([]);

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

  useAsyncEffect(
    async () => {
      if (!stockId) {
        return;
      }
      const [
        [res],
        [stock],
      ] = await Promise.all([
        fetchTreeFinancialReportsData([stockId], 11),
        db.stockWithLeadingIndicatorsList.where('id').equals(stockId).toArray(),
      ]);

      setStockName(res?.[0]?.['SECURITY_NAME_ABBR']?.toString() || '');
      setReports(res.map((r, index) => {
        return {
          ...r,
          ...stock.indicators[index],
        };
      }));
    },
    [stockId],
  );

  const onNewGroupAdd = useMemoizedFn(() => {
    const groups: ReportIndicatorGroup[] = [
      ...indicatorGroups,
      {
        id: `${Date.now()}-${Math.random().toString().slice(2, 10)}`,
        title: newGroupTile,
        indicators: [],
      },
    ];
    setIndicatorGroups(groups);
    setFinancialReportDataIndicatorGroups(groups);
    setNewGoupTitle('');
  });

  const onGroupRemove = useMemoizedFn((groupId: string) => {
    const groups = indicatorGroups.filter((item) => item.id !== groupId);
    setIndicatorGroups(groups);
    setFinancialReportDataIndicatorGroups(groups);
  });

  const onNewIndicatorAdd = useMemoizedFn((groupId: string) => {
    const group = indicatorGroups.find((item) => item.id === groupId);
    const groupIndex = indicatorGroups.findIndex((item) => item.id === groupId);
    if (!group) {
      return;
    }
    const indicators: ReportIndicator[] = [
      ...group.indicators,
      {
        id: `${Date.now()}-${Math.random().toString().slice(2, 10)}`,
        title: getIndicatorTitle(groupId),
        expression: getExpression(groupId),
        RPN: transferToRPN(getExpression(groupId) || ''),
        unit: getUnit(groupId) || null,
      },
    ];
    const newGroup: ReportIndicatorGroup = {
      ...group,
      indicators,
    };
    const groups = indicatorGroups.filter((item) => item.id !== groupId);
    groups.splice(groupIndex, 0, newGroup);
    setExpression(groupId, '');
    setIndicatorTitle(groupId, '');
    setUnit(groupId, null);
    setIndicatorGroups(groups);
    setFinancialReportDataIndicatorGroups(groups);
  });

  const onIndicatorDelete = useMemoizedFn((groupId: string, indicatorId: string) => {
    const group = indicatorGroups.find((item) => item.id === groupId);
    const groupIndex = indicatorGroups.findIndex((item) => item.id === groupId);
    if (!group) {
      return;
    }
    const indicators = group.indicators.filter((item) => item.id !== indicatorId);
    const newGroup: ReportIndicatorGroup = {
      ...group,
      indicators,
    };
    const groups = indicatorGroups.filter((item) => item.id !== groupId);
    groups.splice(groupIndex, 0, newGroup);
    setIndicatorGroups(groups);
    setFinancialReportDataIndicatorGroups(groups);
  });

  return (
    <div className="w-full h-full overflow-auto p-6 text-base font-sans box-border">
      <div className="text-lg mb-4 bold ml-[-8px]">
        <Breadcrumb items={breadItems} />
      </div>
      <Space size={16} className="mb-8">
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
      <div className="mb-4 text-base font-bold w-full">
        <div className="mb-3">资产负债表项目占比</div>
        <div className="mb-3 w-full flex items-stretch gap-8">
          <div className="flex-1">
            <div className="text-sm">流动资产</div>
            <BalanceItemDistribution reports={reports} type="current-asset" />
          </div>
          <div className="flex-1">
            <div className="text-sm">流动负债</div>
            <BalanceItemDistribution reports={reports} type="current-debt" />
          </div>
        </div>
        <div className="mb-3 w-full flex items-stretch gap-8">
          <div className="flex-1">
            <div className="text-sm">非流动资产</div>
            <BalanceItemDistribution reports={reports} type="non-currnet-asset" />
          </div>
          <div className="flex-1">
            <div className="text-sm">非流动负债</div>
            <BalanceItemDistribution reports={reports} type="non-current-debt" />
          </div>
        </div>
      </div>
      {
        graph
          ? indicatorGroups.map(({ indicators, title, id: groupId }) => (
              <div key={groupId} className="mb-8">
                <div className="pl-[2px] text-base font-bold mb-4">
                  {title}
                </div>
                <div className="flex flex-wrap gap-8">
                  {
                    indicators.map(({ id: indicatorId, title, RPN, unit }) => {
                      const data = reports.map((_, index) => {
                        // 倒着计算
                        const cur = reports.length - index - 1;
                        let value = 0;
                        if (RPN) {
                          value = computeFinancialReportData(RPN, reports, cur) || 0;
                        }
                        return {
                          year: String(reports[cur]['REPORT_YEAR']),
                          value,
                        };
                      });

                      return (
                        <div key={indicatorId} className="flex-none w-[calc(50%-20px)]">
                          <div className="mb-4">{title}{unit ? ` (${unit})` : ''}</div>
                          <Line
                            key={indicatorId}
                            data={data}
                            xField="year"
                            yField="value"
                            tooltip={{
                              formatter: (data) => ({
                                name: data.type,
                                value: formatFinancialNumber(data.value),
                              }),
                            }}
                            height={200}
                          />
                        </div>
                      );
                    })
                  }
                </div>
                <Divider />
              </div>
          ))
          : (
            <>
              {
                indicatorGroups.map(({ indicators, title, id: groupId }) => (
                  <div key={title} className="mb-8">
                    <Space className="mb-4" size={16}>
                      <div className="pl-[2px] text-base font-bold">
                        {title}
                      </div>
                      <Button danger onClick={() => onGroupRemove(groupId)}>
                        删除组
                      </Button>
                    </Space>
                    <Table<ReportIndicator>
                      className="mb-4"
                      key={groupId}
                      pagination={false}
                      rowKey="id"
                      dataSource={indicators}
                      columns={[
                        {
                          title: '指标',
                          key: 'title',
                          dataIndex: 'title',
                        },
                        ...Array.from({ length: reports.length }).map<ColumnType<ReportIndicator>>((_, index) => ({
                          title: `${reports[index]['REPORT_YEAR']} 年`,
                          key: String(reports[index]['REPORT_YEAR']),
                          render(_, { RPN, unit }) {
                            if (!RPN) {
                              return 0;
                            }
                            const value = computeFinancialReportData(
                              RPN,
                              reports,
                              index,
                            );
                            return formatFinancialNumber(value, { unit });
                          }
                        })),
                        {
                          title: '操作',
                          key: 'operatioin',
                          render: (_, { id: indicatorId }) => (
                            <div>
                              <Button
                                type="text"
                                danger
                                onClick={() => onIndicatorDelete(groupId, indicatorId)}
                              >
                                删除
                              </Button>
                            </div>
                          ),
                        },
                      ]}
                    />
                    <Space size={16}>
                      <Input
                        value={getIndicatorTitle(groupId)}
                        onChange={(e) => setIndicatorTitle(groupId, e.target.value)}
                        placeholder="输入新指标名称"
                      />
                      <Tooltip title={getErrorMessage(groupId)} open={!!getErrorMessage(groupId)} placement="topLeft">
                        <Mentions
                          autoSize
                          status={getErrorMessage(groupId) ? 'error' : undefined}
                          placeholder="输入指标表达式"
                          style={{ width: 400 }}
                          onChange={(exp) => {
                            try {
                              transferToRPN(exp);
                              setErrorMessage(groupId, '');
                            } catch (e: any) {
                              setErrorMessage(groupId, e.message);
                            }
                            setExpression(groupId, exp);
                          }}
                          value={getExpression(groupId)}
                          options={[
                            ...Object.keys({ ...LEADING_INDICAOTR_ITEMS, ...ACCOUNT_ITEM }).map((key) => ({
                              label: String(key),
                              value: String(key),
                            })),
                          ]}
                        />
                      </Tooltip>
                      <Select
                        className="flex-none w-[84px]"
                        options={[
                          { label: '无单位', value: null },
                          { label: '百分比', value: '%' },
                        ]}
                        value={getUnit(groupId)}
                        onChange={(value) => setUnit(groupId, value)}
                      />
                      <Button
                        disabled={!!getErrorMessage(groupId) || !getIndicatorTitle(groupId)}
                        type="primary"
                        onClick={() => onNewIndicatorAdd(groupId)}
                      >
                        添加指标
                      </Button>
                    </Space>
                    <Divider />
                  </div>
                ))
              }
              <Space size={16}>
                <Input value={newGroupTile} onChange={(e) => setNewGoupTitle(e.target.value)} placeholder="输入新组的标题" />
                <Button disabled={!newGroupTile} type="primary" onClick={onNewGroupAdd}>添加组</Button>
              </Space>
            </>
          )
      }
    </div>
  );
});

FinancialReportsDataDetail.displayName = 'FinancialReportsDataDetail';

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
