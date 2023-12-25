import { memo, PropsWithChildren, useState } from 'react';
import { Select, Button, Popover, type SelectProps } from 'antd';
import { InfoCircleFilled } from '@ant-design/icons';
import { PopoverContentWrapper } from './styles';

type SelectPopconfirmProps = SelectProps & {
  onConfirm?: (value: string) => void;
  width?: number;
  title: string;
};

export const SelectPopconfirm = memo((props: PropsWithChildren<SelectPopconfirmProps>) => {
  const { children, title, width, defaultValue, onConfirm, className, style, ...rest } = props;
  const [value, setValue] = useState(defaultValue);
  const [visible, setVisible] = useState(false);

  return (
    <Popover
      open={visible}
      onOpenChange={setVisible}
      trigger="click"
      content={(
        <PopoverContentWrapper>
          <div className="input-popover-content-header">
            <div className="icon">
              <InfoCircleFilled />
            </div>
            <div className="header-right">
              <div className="title">
                {title}
              </div>
              <div className="input">
                <Select
                  style={{ ...style, width }}
                  className={`w-full ${className || ''}`}
                  value={value}
                  onChange={setValue}
                  {...rest}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setVisible(false)}>取消</Button>
            <Button
              type="primary"
              onClick={() => {
                onConfirm?.(value);
                setVisible(false);
              }}
            >
              确认
            </Button>
          </div>
        </PopoverContentWrapper>
      )}
    >
      {children}
    </Popover>
  );
});

SelectPopconfirm.displayName = 'SelectPopconfirm';

