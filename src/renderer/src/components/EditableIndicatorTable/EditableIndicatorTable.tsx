import { memo } from 'react';
import { useMemoizedFn } from 'ahooks';
import { Button, Space, Table, Divider, Modal } from 'antd';
import { produce } from 'immer';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { ColumnType } from 'antd/es/table';
import type { FinancialReportData, ReportIndicator } from '@renderer/types';
import { formatFinancialNumber } from '@renderer/utils';
import { computeFinancialReportData } from '@renderer/pages/detail/computeFinancialReportData';
import { EditableIndicatorForm, EditableIndicatorFormData } from './EditableIndicatorForm';
import { SortableRow } from './SortableRow';

interface EditableIndicatorTableProps {
  reports: FinancialReportData[];
  indicators: ReportIndicator[];
  setIndicators: (indicators: ReportIndicator[]) => void;
  title: string;
  onRemove?: () => void;
  getGroupChangeNode?: (indicatorId: string) => React.ReactNode;
}

export const EditableIndicatorTable = memo((props: EditableIndicatorTableProps) => {
  const {
    reports,
    indicators,
    setIndicators,
    title,
    onRemove,
    getGroupChangeNode,
  } = props;

  const onIndicatorRemove = useMemoizedFn((id: string) => {
    setIndicators(indicators.filter((item) => item.id !== id));
  });

  const onNewIndicatorAdd = useMemoizedFn((data: EditableIndicatorFormData) => {
    setIndicators([
      ...indicators,
      {
        id: `${Date.now()}-${Math.random().toString().slice(2, 10)}`,
        ...data,
      },
    ]);
  });

  const onIndicatorChange = useMemoizedFn((id: string) => {
    const ind = indicators.find((item) => item.id === id);
    if (!ind) {
      return;
    }

    const { title, expression, unit } = ind;
    Modal.confirm({
      title: '修改指标',
      content: (
        <EditableIndicatorForm
          title={title}
          expression={expression}
          unit={unit}
          layout="vertical"
          onCancel={() => Modal.destroyAll()}
          onConfirm={(data) => {
            setIndicators(produce(indicators, (draft) => {
              const index = draft.findIndex((item) => item.id == id);
              if (index !== -1) {
                draft[index] = {
                  ...draft[index],
                  ...data,
                };
              }
            }));
            Modal.destroyAll();
          }}
        />
      ),
      footer: null,
      maskClosable: true,
    });
  });

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = indicators.findIndex((item) => item.id === active.id);
      const overIndex = indicators.findIndex((item) => item.id === over?.id);
      setIndicators(arrayMove(indicators, activeIndex, overIndex))
    }
  };

  return (
    <div key={title} className="mb-8">
      <Space className="mb-4" size={16}>
        <div className="pl-[2px] text-base font-bold">
          {title}
        </div>
        <Button danger onClick={() => onRemove?.()}>
          删除组
        </Button>
      </Space>
      <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
        <SortableContext
          items={indicators.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <Table<ReportIndicator>
            components={{
              body: {
                row: SortableRow,
              },
            }}
            className="mb-4"
            pagination={false}
            rowKey="id"
            dataSource={indicators}
            columns={[
              {
                key: 'sort',
              },
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
                      onClick={() => onIndicatorChange(indicatorId)}
                    >
                      修改
                    </Button>
                    {getGroupChangeNode?.(indicatorId)}
                    <Button
                      type="link"
                      danger
                      onClick={() => onIndicatorRemove(indicatorId)}
                    >
                      删除
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </SortableContext>
      </DndContext>
      <EditableIndicatorForm layout="inline" onConfirm={(data) => onNewIndicatorAdd(data)} />
      <Divider />
    </div>
  );
});

EditableIndicatorTable.displayName = 'EditableIndicatorTable';

