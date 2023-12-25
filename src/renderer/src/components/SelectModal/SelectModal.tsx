import { memo, useState } from 'react';
import { Select, Button, Modal, type SelectProps } from 'antd';

type SelectModalProps = SelectProps & {
  onConfirm?: (value: string) => void;
};

export const SelectModal = memo((props: SelectModalProps) => {
  const { defaultValue, onConfirm, className, ...rest } = props;
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="w-full">
      <Select
        className={`w-full mb-4 ${className || ''}`}
        value={value}
        onChange={setValue}
        {...rest}
      />
      <div className="flex justify-end gap-2">
        <Button onClick={() => Modal.destroyAll()}>取消</Button>
        <Button
          type="primary"
          onClick={() => {
            onConfirm?.(value);
            Modal.destroyAll();
          }}
        >
          确认
        </Button>
      </div>
    </div>
  );
});

SelectModal.displayName = 'SelectModal';

interface openSelectModal extends SelectModalProps {
  title: string;
}

export const openSelectModal = ({ title, ...rest }: openSelectModal) => {
  Modal.confirm({
    title,
    content: <SelectModal {...rest} />,
    footer: null,
    maskClosable: true,
  });
};

