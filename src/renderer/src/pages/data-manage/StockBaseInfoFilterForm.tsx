import { memo } from 'react';
import { Button, Form, Input } from 'antd';

export interface StockBaseInfoFilterValues {
  searchKey?: string;
  maxPe?: string;
  minPe?: string;
  maxROE?: string;
  minROE?: string;
}

interface StockBaseInfoFilterFormProps {
  onSubmit?: (values: StockBaseInfoFilterValues) => void;
  disabled?: boolean;
  initialValues?: StockBaseInfoFilterValues;
}

export const StockBaseInfoFilterForm = memo((props: StockBaseInfoFilterFormProps) => {
  const {
    onSubmit,
    disabled,
    initialValues,
  } = props;
  const [formRef] = Form.useForm();

  return (
    <Form
      className="gap-y-4"
      layout="inline"
      form={formRef}
      disabled={disabled}
      initialValues={initialValues}
    >
      <Form.Item label="搜索" name="search">
        <Input />
      </Form.Item>
      <Form.Item label="最小 PE" name="minPe">
        <Input />
      </Form.Item>
      <Form.Item label="最大 PE" name="maxPe">
        <Input />
      </Form.Item>
      <Form.Item label="最小 ROE" name="minROE">
        <Input />
      </Form.Item>
      <Form.Item label="最大 ROE" name="maxROE">
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" onClick={() => {
          onSubmit?.(formRef.getFieldsValue());
          setValues(formRef.getFieldsValue());
        }}>
          确认
        </Button>
      </Form.Item>
    </Form>
  );
});

StockBaseInfoFilterForm.displayName = 'StockBaseInfoFilterForm';

