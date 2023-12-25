import { memo } from 'react';
import { Line } from '@ant-design/charts';
import type { FinancialReportData, ReportIndicator } from '@renderer/types';
import { formatFinancialNumber } from '@renderer/utils';
import { computeFinancialReportData } from '@renderer/pages/detail/computeFinancialReportData';

interface IndicatorGraphProps {
  reports: FinancialReportData[];
  indicators: ReportIndicator[];
  title: string;
}

export const IndicatorGraph = memo((props: IndicatorGraphProps) => {
  const {
    reports,
    indicators,
    title,
  } = props;

  return (
    <div className="mb-8">
      <div className="pl-[2px] text-base font-bold mb-4">
        {title}
      </div>
      <div className="flex flex-wrap gap-8">
        {
          indicators.map(({ id: indicatorId, title, RPN, unit }) => {
            const data = reports.map((_, index) => {
              // 倒着计算
              const cur = reports.length - index - 1;
              let value = 0;
              if (RPN) {
                value = computeFinancialReportData(RPN, reports, cur) || 0;
              }
              return {
                year: String(reports[cur]['REPORT_YEAR']),
                value,
              };
            });

            return (
              <div key={indicatorId} className="flex-none w-[calc(50%-20px)]">
                <div className="mb-4">{title}{unit ? ` (${unit})` : ''}</div>
                <Line
                  key={indicatorId}
                  data={data}
                  xField="year"
                  yField="value"
                  tooltip={{
                    formatter: (data) => ({
                      name: data.type,
                      value: formatFinancialNumber(data.value),
                    }),
                  }}
                  height={200}
                />
              </div>
            );
          })
        }
      </div>
    </div>
  );
});

IndicatorGraph.displayName = 'IndicatorGraph';

