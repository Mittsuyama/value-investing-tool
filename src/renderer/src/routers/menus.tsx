
import React from 'react';
import { type MenuProps } from 'antd';
import type { ItemType } from 'antd/lib/menu/hooks/useItems';
import {
  DatabaseOutlined,
  RadarChartOutlined,
  UserOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { RouteKeys } from '@renderer/routers/configs';

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

export interface MenuConfigs {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuConfigs[];
}

export const menuConfigs: MenuConfigs[] = [
  {
    label: '我的',
    key: 'my',
    icon: <UserOutlined />,
    children: [
      { label: '我的收藏', key: RouteKeys.MY_FAVORITE },
    ],
  },
  {
    label: '数据管理',
    key: 'data-manage',
    icon: <DatabaseOutlined />,
    children: [
      { label: '基本数据', key: RouteKeys.STOCK_BASE_INFO },
      { label: '主要指标', key: RouteKeys.STOCK_WITH_LEADING_INDICAOTRS },
      { label: '报表数据基本数据', key: RouteKeys.STOCK_WITH_FINANCIAL_REPORTS_DATA },
    ],
  },
  {
    label: '指标管理',
    key: 'indicator-manage',
    icon: <BarChartOutlined />,
    children: [
      { label: '主要指标', key: RouteKeys.INDICATOR_MANAGE_LEADING_INDICATOR },
      { label: '报表数据指标', key: RouteKeys.INDICATOR_MANAGE_FRI_GROUP },
    ],
  },
  {
    label: '批量分析',
    key: 'analysis',
    icon: <RadarChartOutlined />,
    children: [
      { label: '主要指标筛选', key: RouteKeys.ANALYSIS_FILTER },
    ],
  },
];

export const generateMenuItems = (configs: MenuConfigs[]) => {
  return configs.map<ItemType>((cfg) => getItem(
    cfg.label,
    cfg.key,
    cfg.icon,
    cfg.children && generateMenuItems(cfg.children),
  ));
};

export const findMenu = (pathname: string) => {
  let res: MenuConfigs | undefined;

  const dfs = (config: MenuConfigs) => {
    if (config.key === pathname) {
      res = config;
      return;
    }
    config.children?.forEach(dfs);
    if (res) {
      return;
    }
  };
  menuConfigs.forEach(dfs);

  return res;
};
