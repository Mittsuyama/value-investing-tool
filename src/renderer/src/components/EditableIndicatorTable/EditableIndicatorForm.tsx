import { memo, useRef, useState } from 'react';
import cls from 'classnames';
import { Button, Input, Mentions, Select, Form, Space } from 'antd';
import { ACCOUNT_ITEM, LEADING_INDICAOTR_ITEMS } from '@renderer/constants';
import { ReportIndicator, ReportIndicatorUnit } from '@renderer/types';
import { transferToRPN } from '@renderer/utils';
import { FormLayout } from 'antd/es/form/Form';
import { useMemoizedFn } from 'ahooks';

export type EditableIndicatorFormData = Pick<ReportIndicator, 'title' | 'expression' | 'RPN' | 'unit'>;

interface EditableIndicatorFormProps {
  title?: string;
  expression?: string;
  unit?: ReportIndicatorUnit;
  layout?: FormLayout;
  onConfirm?: (data: EditableIndicatorFormData) => void;
  onCancel?: () => void;
}

export const EditableIndicatorForm = memo((props: EditableIndicatorFormProps) => {
  const { layout, onConfirm, onCancel, ...rest } = props;

  const [form] = Form.useForm();
  const containeRef = useRef<HTMLDivElement | null>(null);

  const [expression, setExpression] = useState(rest.expression);
  const [errMsg, setErrMsg] = useState('');

  const onSubmit = useMemoizedFn(() => {
    const values = form.getFieldsValue() as EditableIndicatorFormData;
    onConfirm?.({
      ...values,
      RPN: transferToRPN(values.expression || ''),
    });
  });

  const isVertical = layout === 'vertical';

  return (
    <div
      className={cls(
        'flex items-start w-full pr-2 box-border justify-start',
        {
          'flex-col': isVertical,
          'items-end': isVertical,
        })
      }
      ref={containeRef}
    >
      <Form
        className={cls({ 'w-full': isVertical })}
        layout={layout}
        form={form}
        initialValues={{
          title: rest.title,
          unit: rest.unit || 'none',
          expression: rest.expression,
        }}
      >
        <Form.Item
          name="title"
          label="指标名称"
          rules={[{ required: true }]}
        >
          <Input placeholder="输入新指标名称" />
        </Form.Item>
        <Form.Item
          label="表达式"
          name="expression"
          help={errMsg}
          rules={[{ required: true }]}
        >
          <Mentions
            getPopupContainer={() => containeRef.current || document.body}
            autoSize
            status={errMsg ? 'error' : undefined }
            placeholder="输入指标表达式"
            style={layout === 'vertical' ? undefined : { width: 400 }}
            value={expression}
            onChange={(exp) => {
              if (!exp) {
                setErrMsg('');
                setExpression('');
                return;
              }
              try {
                transferToRPN(exp);
                setErrMsg('');
              } catch (e: any) {
                setErrMsg(e.message);
              }
              setExpression(exp);
            }}
            options={[
              ...Object.keys({ ...LEADING_INDICAOTR_ITEMS, ...ACCOUNT_ITEM }).map((key) => ({
                label: String(key),
                value: String(key),
              })),
            ]}
          />
        </Form.Item>
        <Form.Item
          name="unit"
          label="单位"
          rules={[{ required: true }]}
        >
          <Select
            className="flex-none w-[84px]"
            options={[
              { label: '无单位', value: 'none' },
              { label: '百分比', value: '%' },
            ]}
          />
        </Form.Item>
      </Form>
      <Space size={8}>
        {onCancel && (
          <Button onClick={onCancel}>
            取消
          </Button>
        )}
        <Button type="primary" onClick={onSubmit}>
          确认
        </Button>
      </Space>
    </div>
  );
});

EditableIndicatorForm.displayName = 'EditableIndicatorForm';

