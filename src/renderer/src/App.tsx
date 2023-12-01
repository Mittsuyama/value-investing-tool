import React, { memo } from 'react';
import { DatabaseOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { Manager } from '@renderer/pages/manager';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

const items: MenuProps['items'] = [
  getItem('数据管理', 'manager', <DatabaseOutlined />, [
    getItem('预览', 'manager-general'),
  ]),
  getItem('Group', 'grp', null, [getItem('Option 13', '13'), getItem('Option 14', '14')], 'group'),
];

export const App = memo(() => {
  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
  };

  return (
    <div className="w-full h-full overflow-hidden flex">
      <div className="flex-none h-full">
        <Menu
          className="h-full"
          onClick={onClick}
          style={{ width: 256 }}
          defaultSelectedKeys={['manager-general']}
          defaultOpenKeys={['manager']}
          mode="inline"
          items={items}
        />
      </div>
      <div className="flex-1 h-full">
        <Manager />
      </div>
    </div>
  );
});

App.displayName = 'App';

