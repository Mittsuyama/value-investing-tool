import React, { memo } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { type MenuProps, Menu, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { DatabaseOutlined, RadarChartOutlined } from '@ant-design/icons';
import { LeadingIndicators, StockBaseInfoList } from '@renderer/pages/data-manage';
import { Filter } from '@renderer/pages/analysis';

enum RouteKeys {
  STOCK_BASE_INFO = '/data-manage/stock-base-info',
  STOCK_WITH_LEADING_INDICAOTRS = '/data-manage/stock-with-leading-indicators',
  ANALYSIS_FILTER = '/analysis/filter',
}

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
  getItem('数据管理', 'data-manage', <DatabaseOutlined />, [
    getItem('股票基本数据', RouteKeys.STOCK_BASE_INFO),
    getItem('股票主要指标', RouteKeys.STOCK_WITH_LEADING_INDICAOTRS),
  ]),
  getItem('股票分析', 'analysis', <RadarChartOutlined />, [
    getItem('指标筛选', RouteKeys.ANALYSIS_FILTER),
  ]),
];

export const App = memo(() => {
  const history = useHistory();

  return (
    <ConfigProvider locale={zhCN}>
      <div className="w-full h-full overflow-hidden flex">
        <div className="flex-none h-full">
          <Menu
            className="h-full"
            onClick={(e) => history.push(e.key)}
            style={{ width: 256 }}
            defaultSelectedKeys={[RouteKeys.STOCK_BASE_INFO]}
            defaultOpenKeys={['data-manage', 'analysis']}
            mode="inline"
            items={items}
          />
        </div>
        <div className="flex-1 h-full">
          <Switch>
            <Route path={RouteKeys.STOCK_BASE_INFO} exact component={StockBaseInfoList} />
            <Route path={RouteKeys.STOCK_WITH_LEADING_INDICAOTRS} exact component={LeadingIndicators} />
            <Route path={RouteKeys.ANALYSIS_FILTER} exact component={Filter} />
            <Route path="/" component={StockBaseInfoList} />
          </Switch>
        </div>
      </div>
    </ConfigProvider>
  );
});

App.displayName = 'App';

