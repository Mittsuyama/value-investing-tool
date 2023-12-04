import { memo, useMemo, useRef, useState } from 'react';
import { Input, Modal, Select, Mentions, Tooltip, InputRef } from 'antd';
import type { FilterSchema, FilterSchemaRelation } from '@renderer/types/filter-schema';
import { LEADING_INDICAOTR_ITEMS } from '@renderer/constants/leading-indicator-items';
import { transferToRPN } from './computeExpression';
import { useMount } from 'ahooks';

interface AddFilterSchemaModalProps {
  visible: boolean;
  onConfirm: (schema: FilterSchema) => void;
  onCancel: () => void;
  defaultSchema?: FilterSchema;
}

export const AddFilterSchemaModal = memo((props: AddFilterSchemaModalProps) => {
  const {
    visible,
    onConfirm,
    onCancel,
    defaultSchema,
  } = props;

  const [title, setTitle] = useState(defaultSchema?.title || `默认标题_${Date.now()}`);
  const [expression, setExpression] = useState(defaultSchema?.expression || '');
  const [relation, setRelation] = useState<FilterSchemaRelation>(defaultSchema?.relation || 'greater-than');
  const [value, setValue] = useState<number | string>(defaultSchema?.value || 0);
  const [expErrorMessage, setExpErrorMessage] = useState('');

  const titleRef = useRef<InputRef>(null);

  useMount(() => {
    titleRef.current?.focus();
  });

  const valueIllegal = useMemo(
    () => Number.isNaN(Number(value)),
    [value],
  );

  return (
    <Modal
      open={visible}
      title={`${defaultSchema ? '修改' : '增加'}一条筛选项`}
      okText={defaultSchema ? '修改' : '增加'}
      cancelText="取消"
      maskClosable={false}
      onCancel={onCancel}
      okButtonProps={{
        disabled: !expression.length,
      }}
      onOk={() => {
        try {
          const numValue = Number(value);
          if (!Number.isNaN(numValue) && title) {
            onConfirm({
              id: defaultSchema?.id || `${Date.now()}-${Math.random().toString().slice(2, 10)}`,
              title,
              expression,
              relation,
              value: numValue,
              RPN: transferToRPN(expression),
            });
          }
        } catch {
          // do nothing
        }
      }}
    >
      <div className="pr-4 pb-4 pt-2">
        <div className="my-5 flex items-center">
          <div className="w-[90px] text-end flex-none mr-4">筛选项标题：</div>
          <Input
            ref={titleRef}
            className="flex-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="my-5 flex items-center">
          <div className="w-[90px] text-end flex-none mr-4">表达式：</div>
          <div className="flex-1 flex flex-wrap items-center">
            <Tooltip title={expErrorMessage} open={!!expErrorMessage} placement="topLeft">
              <Mentions
                autoSize
                status={expErrorMessage ? 'error' : undefined}
                onChange={(exp) => {
                  try {
                    transferToRPN(exp);
                    setExpErrorMessage('');
                  } catch (e: any) {
                    setExpErrorMessage(e.message);
                  }
                  setExpression(exp);
                }}
                value={expression}
                options={Object.keys(LEADING_INDICAOTR_ITEMS).map((key) => ({
                  label: String(key),
                  value: String(key),
                }))}
              />
            </Tooltip>
          </div>
        </div>
        <div className="my-5 flex items-center">
          <div className="w-[90px] text-end flex-none mr-4">关系：</div>
          <Select
            className="flex-1"
            value={relation}
            onChange={setRelation}
            options={[
              { label: '大于', value: 'greater-than' },
              { label: '小于', value: 'less-than' },
            ]}
          />
        </div>
        <div className="my-5 flex items-center">
          <div className="w-[90px] text-end flex-none mr-4">值：</div>
          <Tooltip
            title={valueIllegal ? '请输入数字' : ''}
            open={valueIllegal}
            placement="topLeft"
          >
            <Input
              className="flex-1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              status={valueIllegal ? 'error' : undefined}
            />
          </Tooltip>
        </div>
      </div>
    </Modal>
  );
});

AddFilterSchemaModal.displayName = 'AddFilterSchemaModal';
