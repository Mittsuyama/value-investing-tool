import { memo, useMemo } from 'react';
import { Line, Pie } from '@ant-design/charts';
import { FinancialReportData } from '@renderer/types';
import {
  ACCOUNT_ITEM,
  CURRENT_ASSET,
  NON_CURRENT_ASSET,
  CURRENT_DEBT,
  NON_CURRENT_DEBT,
} from '@renderer/constants';
import { formatFinancialNumber } from '@renderer/utils';

export type SheetType
= 'asset'
| 'debt'
| 'current-asset'
| 'current-debt'
| 'non-currnet-asset'
| 'non-current-debt';

const totalKeyRecord: Record<SheetType, keyof typeof ACCOUNT_ITEM> = {
  'asset': 'z-zczj-资产总计',
  'debt': 'z-fzhj-负债合计',
  'current-asset': 'z-ldzchj-流动资产合计',
  'non-currnet-asset': 'z-fldzchj-非流动资产合计',
  'current-debt': 'z-ldfzhj-流动负债合计',
  'non-current-debt': 'z-fldfzhj-非流动负债合计',
};

const currentAssetItemKeys = Object.keys(CURRENT_ASSET);
const nonCurrentAssetItemKeys = Object.keys(NON_CURRENT_ASSET);
const currentDebtItemKeys = Object.keys(CURRENT_DEBT);
const nonCurrentDebtItemKeys = Object.keys(NON_CURRENT_DEBT);
const assetItemKeys = [...currentAssetItemKeys, ...nonCurrentAssetItemKeys];
const debtItemKeys = [...currentDebtItemKeys, ...nonCurrentDebtItemKeys];

const sheetType2Keys: Record<SheetType, string[]> = {
  'asset': assetItemKeys,
  'debt': debtItemKeys,
  'current-asset': currentAssetItemKeys,
  'non-currnet-asset': nonCurrentAssetItemKeys,
  'current-debt': currentDebtItemKeys,
  'non-current-debt': nonCurrentDebtItemKeys,
};

interface BalanceItemDistributionProps {
  type: SheetType;
  reports: FinancialReportData[];
}

interface ChartDataItem {
  value: number;
  year: string
  type: string;
}

const getValidItems = (report: FinancialReportData, type: SheetType) => {
  const total: number = Number(report[ACCOUNT_ITEM[totalKeyRecord[type]]]) || 0;

  const datas = sheetType2Keys[type].map<ChartDataItem | undefined>((key) => {
    const percent = (Number(report[ACCOUNT_ITEM[key]]) || 0) / total * 100;
    if (percent > 10) {
      const [, , chinese] = key.split('-');
      return {
        year: String(report['REPORT_YEAR']),
        type: chinese,
        value: percent,
      };
    }
    return undefined;
  });

  const totalPercent = datas.reduce((pre, cur) => pre + (cur?.value || 0), 0);

  return datas
    .concat({
      year: String(report['REPORT_YEAR']),
      type: '剩余',
      value: 100 - totalPercent,
    })
    .filter((data): data is ChartDataItem => Boolean(data))
    .sort((a, b) => b.value - a.value);
};

const getLineData = (reports: FinancialReportData[], type: SheetType) => {
  return reports
    .map((_, index) => {
      // 倒着计算
      const report = reports[reports.length - index - 1];
      return getValidItems(report, type);
    })
    .flat();
};

export const BalanceItemDistribution = memo((props: BalanceItemDistributionProps) => {
  const { type, reports } = props;

  const lineData = useMemo(
    () => getLineData(reports, type),
    [reports, type],
  );

  const pieData = useMemo(
    () => reports.length ? getValidItems(reports[0], type) : [],
    [reports, type],
  );

  return (
    <div className="flex items-center w-full">
      <div className="flex-1 overflow-hidden">
        <Line
          legend={false}
          height={200}
          data={lineData}
          xField="year"
          yField="value"
          tooltip={{
            formatter: (data) => ({
              name: data.type,
              value: formatFinancialNumber(data.value, { unit: '%' }),
            }),
          }}
          seriesField="type"
        />
      </div>
      <div className="flex-none">
        <Pie
          legend={false}
          width={350}
          height={200}
          appendPadding={10}
          data={pieData}
          angleField="value"
          colorField="type"
          radius={0.8}
          label={{
            type: 'outer',
            content: '{name} {percentage}',
          }}
          interactions={[
            {
              type: 'pie-legend-active',
            },
            {
              type: 'element-active',
            },
          ]}
        />
      </div>
    </div>
  );
});

BalanceItemDistribution.displayName = 'BalanceItemDistribution';

