import { memo, useState, PropsWithChildren } from 'react';
import { Button, ButtonProps } from 'antd';

export const ButtonWithThrottle = memo((props: PropsWithChildren<ButtonProps>) => {
  const { children, onClick, ...rest } = props;
  const [loading, setLoading] = useState(false);
  return (
    <Button
      {...rest}
      loading={loading}
      onClick={(e) => {
        setLoading(true);
        onClick?.(e);
        setTimeout(() => setLoading(false), 500);
      }}
    >
      {children}
    </Button>
  );
});

ButtonWithThrottle.displayName = 'ButtonWithThrottle';

