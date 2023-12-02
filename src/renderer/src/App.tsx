import React, { memo } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { type MenuProps, Menu } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { SettingsDatabase } from '@renderer/pages/settings';

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
  getItem('设置', 'settings', <SettingOutlined />, [
    getItem('数据管理', 'settings/database'),
  ]),
];

export const App = memo(() => {
  const history = useHistory();

  const onClick: MenuProps['onClick'] = (e) => {
    history.push(`/${e.key}`);
  };

  return (
    <div className="w-full h-full overflow-hidden flex">
      <div className="flex-none h-full">
        <Menu
          className="h-full"
          onClick={onClick}
          style={{ width: 256 }}
          defaultSelectedKeys={['settings/database']}
          defaultOpenKeys={['settings']}
          mode="inline"
          items={items}
        />
      </div>
      <div className="flex-1 h-full">
        <Switch>
          <Route path="/settings/database" exact component={SettingsDatabase} />
          <Route path="/" component={SettingsDatabase} />
        </Switch>
      </div>
    </div>
  );
});

App.displayName = 'App';

