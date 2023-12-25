import React, { memo } from 'react';
import { Button, Space, Table } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { FinancialReportData, ReportIndicator } from '@renderer/types';
import { formatFinancialNumber } from '@renderer/utils';
import { computeFinancialReportData } from '@renderer/pages/detail/computeFinancialReportData';
import { SortableRow } from '../EditableIndicatorTable/SortableRow';

interface IndicatorTableProps {
  reports: FinancialReportData[];
  indicators: ReportIndicator[];
  title: React.ReactNode;
  getIsFolllowed?: (id: string) => boolean;
  onFollowChange?: (indicatorId: string, followed: boolean) => void;
  columns?: Array<ColumnType<ReportIndicator>>;
  /** 拖拽排序，和 setIndicators 配合 */
  sortable?: boolean;
  setIndicators?: (indicators: ReportIndicator[]) => void;
}

export const IndicatorTable = memo((props: IndicatorTableProps) => {
  const {
    reports,
    indicators,
    title,
    getIsFolllowed,
    onFollowChange,
    columns = [],
    sortable,
    setIndicators,
  } = props;

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = indicators.findIndex((item) => item.id === active.id);
      const overIndex = indicators.findIndex((item) => item.id === over?.id);
      setIndicators?.(arrayMove(indicators, activeIndex, overIndex))
    }
  };

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext
        items={indicators.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="mb-8">
          <Space className="mb-4" size={16}>
            {
              typeof title === 'string'
              ? (
                <div className="pl-[2px] text-base font-bold">
                  {title}
                </div>
              )
              : title
            }
          </Space>
          <Table<ReportIndicator>
            components={
              sortable
                ? { body: { row: SortableRow } }
                : undefined
            }
            className="mb-4"
            pagination={false}
            rowKey="id"
            dataSource={indicators}
            columns={[
              ...(sortable ? [{ key: 'sort', }] : []),
              {
                title: '指标',
                key: 'title',
                dataIndex: 'title',
              },
              ...reports.map<ColumnType<ReportIndicator>>((report, index) => ({
                title: `${report['REPORT_YEAR']} 年`,
                key: String(report['REPORT_YEAR']),
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
              ...columns,
              {
                title: (
                  <div className="pl-4">
                    操作
                  </div>
                ),
                key: 'operatioin',
                render: (_, { id: indicatorId }) => (
                  <div>
                    <Button
                      type="link"
                      onClick={() => onFollowChange?.(indicatorId, !getIsFolllowed?.(indicatorId))}
                    >
                      {getIsFolllowed?.(indicatorId) ? '取消关注' : '关注'}
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </SortableContext>
    </DndContext>
  );
});

IndicatorTable.displayName = 'IndicatorTable';

