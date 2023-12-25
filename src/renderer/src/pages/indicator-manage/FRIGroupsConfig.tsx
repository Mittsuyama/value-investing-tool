import { memo, useState } from 'react';
import { useAsyncEffect, useMemoizedFn } from 'ahooks';
import { Button, Input, Space } from 'antd';
import { produce } from 'immer';
import { useAtom } from 'jotai';
import type { FinancialReportData, ReportIndicatorGroup } from '@renderer/types';
import { fetchFRDwithCache } from '@renderer/api/helpers';
import { FRIGroupsAtom } from '@renderer/models';
import { EditableIndicatorTable } from '@renderer/components/EditableIndicatorTable';
import { computeAvg } from '@renderer/utils';
import { SelectPopconfirm } from '@renderer/components/SelectPopconfirm';

/** 测试用企业 id */
const sampleStockList = [
  // 伊利
  '600887.SH',
  // 宁德
  '300750.SZ',
  // 茅台
  '600519.SH',
];

const fetchAverageReports = async () => {
  const reportsList = await fetchFRDwithCache(sampleStockList, { years: 6 });
  const allKeys = Array.from(new Set(
    reportsList
    .map((reports) => {
      return reports.financialReportData.map((report) => Object.keys(report)).flat();
    })
    .flat()
  ));
  const avg = reportsList[0].financialReportData.map((_, i) => {
    return Object.fromEntries(
      allKeys.map((key) => {
        const value = computeAvg(
          reportsList.map((_, j) => Number(reportsList[j].financialReportData[i][key]) || 0,
        ));
        return [
          key,
          value === 0 ? NaN : value,
        ];
      }),
    );
  });
  return avg;
};

export const FRIGroupsConfig = memo(() => {
  const [averageReports, setAverageReports] = useState<Array<FinancialReportData>>([]);

  const [FRIGruops, setFRIGroups] = useAtom(FRIGroupsAtom);
  const [newGroupTile, setNewGoupTitle] = useState('');

  useAsyncEffect(
    async () => {
      setAverageReports(await fetchAverageReports());
    },
    [],
  );

  const onNewGroupAdd = useMemoizedFn(() => {
    const groups: ReportIndicatorGroup[] = [
      ...FRIGruops,
      {
        id: `${Date.now()}-${Math.random().toString().slice(2, 10)}`,
        title: newGroupTile,
        indicators: [],
      },
    ];
    setFRIGroups(groups);
    setNewGoupTitle('');
  });

  const onGroupRemove = useMemoizedFn((groupId: string) => {
    const groups = FRIGruops.filter((item) => item.id !== groupId);
    setFRIGroups(groups);
  });

  const onGroupChange = useMemoizedFn((indicatorId: string, toGroupId: string, currentGroupId: string) => {
    setFRIGroups(produce(FRIGruops, (draft) => {
      const currentGroup = draft.find((item) => item.id === currentGroupId);
      const toGroup = draft.find((item) => item.id === toGroupId);
      const indicator = currentGroup?.indicators?.find((item) => item.id === indicatorId);
      if (!currentGroup || !toGroup || !indicator) {
        return;
      }
      currentGroup.indicators = currentGroup.indicators.filter((item) => item.id !== indicatorId);
      toGroup.indicators = [...toGroup.indicators, indicator];
    }));
  });

  return (
    <div className="w-full h-full overflow-auto p-6 text-base font-sans box-border">
      <div className="text-lg mb-4 bold">
        报表指标
      </div>
      {
        FRIGruops.map(({ indicators, title, id: groupId }) => (
          <EditableIndicatorTable
            title={title}
            key={groupId}
            reports={averageReports}
            indicators={indicators}
            setIndicators={(inds) => {
              setFRIGroups(produce(FRIGruops, (draf) => {
                const index = draf.findIndex((item) => item.id === groupId);
                if (index !== -1) {
                  draf[index].indicators = inds;
                }
              }));
            }}
            onRemove={() => onGroupRemove(groupId)}
            getGroupChangeNode={(indicatorId) => (
              <SelectPopconfirm
                title="选择需要更换的组"
                width={200}
                onConfirm={(value) => onGroupChange(indicatorId, value, groupId)}
                defaultValue={FRIGruops[0].id}
                options={FRIGruops.map((item) => ({
                  value: item.id,
                  label: item.title,
                }))}
              >
                <Button type="link">
                  更换组
                </Button>
              </SelectPopconfirm>
            )}
          />
        ))
      }
      <Space size={16}>
        <Input value={newGroupTile} onChange={(e) => setNewGoupTitle(e.target.value)} placeholder="输入新组的标题" />
        <Button disabled={!newGroupTile} type="primary" onClick={onNewGroupAdd}>添加组</Button>
      </Space>
    </div>
  );
});

FRIGroupsConfig.displayName = 'indicator-manage/FRIGroupsConfig';

