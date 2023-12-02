import { memo, useState } from 'react';
import { useMount } from 'ahooks';
import { Table, Spin, Space, Select, TableColumnType } from 'antd';
import type { BaseStockInfo } from '@renderer/types';
import { getAllStocks } from '@renderer/api';

const currentMonth = (new Date()).getMonth();
// 一般公司当年 3 底公布去年年报
const defaultEndYear = (new Date()).getFullYear() - (currentMonth > 3 ? 1 : 2)
/** 证券交易所开业时间 */
const EXCHNAGE_OPEN_UP_YEAR = 1990;

const YearSelector = memo((props: { year: number; setYear: (year: number) => void; title: string }) => {
  const { year, setYear, title } = props;
  return (
    <Space size={12}>
      <div>{title}</div>
      <Select
        value={year}
        onChange={setYear}
        options={Array.from({ length: defaultEndYear - EXCHNAGE_OPEN_UP_YEAR }).map((_, index) => ({
          label: `${defaultEndYear - index} 年`,
          value: defaultEndYear - index,
        }))}
      />
    </Space>
  );
});
YearSelector.displayName = 'YearSelector';

export const FinancialDataManage = memo(() => {
  const [list, setList] = useState<BaseStockInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const [startYear, setStartYear] = useState(defaultEndYear - 5);
  const [endYear, setEndYear] = useState(defaultEndYear);

  useMount(async () => {
    const stocks = await getAllStocks();
    setList(stocks);
    setLoading(false);
  });

  return (
    <div className="w-full h-full overflow-auto">
      <div className="w-full px-5">
        <Space className="py-4 text-sm" wrap size={24}>
          <YearSelector
            title="起始日期:"
            year={startYear}
            setYear={setStartYear}
          />
          <YearSelector
            title="结束日期:"
            year={endYear}
            setYear={setEndYear}
          />
        </Space>
        <Spin spinning={loading}>
          <Table
            rowKey="code"
            dataSource={list}
            columns={[
              {
                title: '名称',
                key: 'name',
                dataIndex: 'name',
              },
              {
                title: '代码',
                key: 'code',
                dataIndex: 'code',
              },
              ...(Array.from({ length: Math.max(endYear - startYear, 0)}).map<TableColumnType<BaseStockInfo>>((_, index) => ({
                title: `${endYear - index}年`,
                key: `year-${endYear - index}`,
                render: () => {
                  return <div>未获取</div>;
                },
              }))),
            ]}
          />
        </Spin>
      </div>
    </div>
  )
});

FinancialDataManage.displayName = 'FinancialDataManage';
