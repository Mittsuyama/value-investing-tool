import { memo, useMemo, useRef, useState } from 'react';
import { Input, Modal, Mentions, Tooltip, InputRef, Select } from 'antd';
import type { FilterSchema } from '@renderer/types/filter-schema';
import { LEADING_INDICAOTR_ITEMS } from '@renderer/constants/leading-indicator-items';
import { transferToRPN } from './computeExpression';
import { useMemoizedFn, useMount } from 'ahooks';

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
  const [expErrorMessage, setExpErrorMessage] = useState('');
  const [limit, setLimit] = useState<[string | null, string | null]>([
    typeof defaultSchema?.limit?.[0] === 'number' ? String(defaultSchema?.limit?.[0]) : null,
    typeof defaultSchema?.limit?.[1] === 'number' ? String(defaultSchema?.limit?.[1]) : null,
  ]);
  const [limitUnit, setLimitUnit] = useState<'y' | 'w' | null>(null);

  const titleRef = useRef<InputRef>(null);
  const inputComposingRef = useRef<Record<string, boolean>>({});

  useMount(() => {
    titleRef.current?.focus();
  });

  const valueIllegal = useMemo(
    () => [
      limit[0] !== null ? Number.isNaN(Number(limit[0])) : false,
      limit[1] !== null ? Number.isNaN(Number(limit[1])) : false,
    ],
    [limit],
  );

  const onOk = useMemoizedFn(() => {
    try {
      if (title) {
        onConfirm({
          id: defaultSchema?.id || `${Date.now()}-${Math.random().toString().slice(2, 10)}`,
          title,
          expression,
          RPN: transferToRPN(expression),
          limit: [Number(limit[0] || null), Number(limit[1]) || null],
          limitUnit,
        });
      }
    } catch {
      // do nothing
    }
  });

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
      onOk={onOk}
    >
      <div className="pr-4 pb-4 pt-2">
        <div className="my-5 flex items-center">
          <div className="w-[90px] text-end flex-none mr-4">筛选项标题：</div>
          <Input
            ref={titleRef}
            className="flex-1"
            onCompositionStart={() => inputComposingRef.current.title = true}
            onCompositionEnd={() => inputComposingRef.current.title = false}
            onKeyDown={(e) => !inputComposingRef.current.title && e.key === 'Enter' && onOk()}
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
                options={[
                  ...Object.keys(LEADING_INDICAOTR_ITEMS).map((key) => ({
                    label: String(key),
                    value: String(key),
                  })),
                  { label: 'zsz-总市值', value: 'zsz-总市值' },
                  { label: 'pe', value: 'pe' },
                ]}
              />
            </Tooltip>
          </div>
        </div>
        <div className="my-5 flex items-center">
          <div className="w-[90px] text-end flex-none mr-4">范围:</div>
          <Tooltip
            title={valueIllegal[0] ? '请输入数字' : ''}
            open={valueIllegal[0]}
            placement="topLeft"
          >
            <Input
              onKeyDown={(e) => e.key === 'Enter' && onOk()}
              className="flex-1 mr-2"
              value={limit[0] || ''}
              onChange={(e) => setLimit([e.target.value, limit[1]])}
              status={valueIllegal[0] ? 'error' : undefined}
            />
          </Tooltip>
          <div className="flex-none mr-2">～</div>
          <Tooltip
            title={valueIllegal[1] ? '请输入数字' : ''}
            open={valueIllegal[1]}
            placement="topLeft"
          >
            <Input
              onKeyDown={(e) => e.key === 'Enter' && onOk()}
              className="flex-1 mr-2"
              value={limit[1] || ''}
              onChange={(e) => setLimit([limit[0], e.target.value])}
              status={valueIllegal[1] ? 'error' : undefined}
            />
          </Tooltip>
          <Select
            className="flex-none w-[84px]"
            options={[
              { label: '亿', value: 'y' },
              { label: '万', value: 'w' },
              { label: '无单位', value: null },
            ]}
            value={limitUnit}
            onChange={setLimitUnit}
          />
        </div>
      </div>
    </Modal>
  );
});

AddFilterSchemaModal.displayName = 'AddFilterSchemaModal';
