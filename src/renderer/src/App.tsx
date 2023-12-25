import { memo, useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';
import cls from 'classnames';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { Menu, ConfigProvider, FloatButton, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  StockOutlined,
} from '@ant-design/icons';
import { LeadingIndicators, StockBaseInfoList, FinancialReportsData } from '@renderer/pages/data-manage';
import { MyFavorite } from '@renderer/pages/my';
import { FRIDetail } from '@renderer/pages/detail';
import { Filter } from '@renderer/pages/analysis';
import { Leading, FRIGroupsConfig } from '@renderer/pages/indicator-manage';
import { RouteKeys } from '@renderer/routers/configs';
import { menuConfigs, findMenu, generateMenuItems } from '@renderer/routers/menus';

const collapsedAtom = atomWithStorage('AppMenuCollapsed', localStorage.getItem('AppMenuCollapsed') === 'true');

export const App = memo(() => {
  const history = useHistory();
  const { pathname, search } = useLocation();

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const [collapsed, setCollapsed] = useAtom(collapsedAtom);

  const toggleCollapsed = useMemoizedFn(() => {
    setCollapsed(!collapsed);
  });

  const defaultSelectedKeys = useMemo(
    () => {
      const path = findMenu(pathname)?.key;
      const from = (new URLSearchParams(search)).get('from');
      return path || from || RouteKeys.STOCK_BASE_INFO;
    },
    [pathname],
  );

  return (
    <ConfigProvider locale={zhCN} theme={{ algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <div className="w-full h-full overflow-hidden flex">
        <div className="flex-none flex flex-col">
          <div
            className={cls(
              'flex-none box-border w-full py-6 flex items-center gap-3 text-[#4374F8] font-bold',
              { 'pl-[28px]': !collapsed },
              { 'justify-center': collapsed },
            )}
            style={{
              borderInlineEnd: isDark
                ? '1px solid rgba(253, 253, 253, 0.12)'
                : '1px solid rgba(5, 5, 5, 0.06)'
            }}
          >
            <StockOutlined className="text-xl" />
            {!collapsed && (
              <div className="text-base">
                Value Investing
              </div>
            )}
          </div>
          <Menu
            className="flex-1"
            style={{ width: collapsed ? 80 : 256 }}
            inlineCollapsed={collapsed}
            onClick={(e) => history.push(e.key)}
            defaultSelectedKeys={collapsed ? undefined: [defaultSelectedKeys]}
            defaultOpenKeys={collapsed ? undefined : ['my', 'data-manage', 'indicator-manage', 'analysis']}
            mode="inline"
            items={generateMenuItems(menuConfigs)}
          />
        </div>
        <div className="flex-1 h-full overflow-hidden">
          <Switch>
            <Route path={RouteKeys.STOCK_BASE_INFO} exact component={StockBaseInfoList} />
            <Route path={RouteKeys.STOCK_WITH_LEADING_INDICAOTRS} exact component={LeadingIndicators} />
            <Route path={RouteKeys.STOCK_WITH_FINANCIAL_REPORTS_DATA} exact component={FinancialReportsData} />
            <Route path={RouteKeys.INDICATOR_MANAGE_LEADING_INDICATOR} exact component={Leading} />
            <Route path={RouteKeys.INDICATOR_MANAGE_FRI_GROUP} exact component={FRIGroupsConfig} />
            <Route path={RouteKeys.ANALYSIS_FILTER} exact component={Filter} />
            <Route path={RouteKeys.FRI_DETAIL} component={FRIDetail} />
            <Route path={RouteKeys.MY_FAVORITE} component={MyFavorite} />
            <Route path="/" component={StockBaseInfoList} />
          </Switch>
        </div>
        <FloatButton
          shape="square"
          type="primary"
          tooltip="收起菜单"
          onClick={toggleCollapsed}
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          style={{ left: 20, bottom: 20 }}
        />
      </div>
    </ConfigProvider>
  );
});

App.displayName = 'App';

