import { memo } from 'react';

export const FinancialReportsData = memo(() => {
  return (
    <div className="w-full h-full overflow-auto p-6 text-base font-sans box-border">
      <div className="text-lg mb-4 bold">
        三大报表数据
      </div>
    </div>
  );
});

FinancialReportsData.displayName = 'FinancialReportsData';
