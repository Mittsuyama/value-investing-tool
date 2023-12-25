import type { ReportIndicatorGroup } from '@renderer/types';
import { LocalstorageKeys } from '@renderer/constants';

const key = `value-investing-tool_${LocalstorageKeys.FINANCIAL_REPORT_DATA_INDICATOR_GROUPS}`;

export const getFinancialReportDataIndicatorGroups = (): Array<ReportIndicatorGroup> => {
  const res = JSON.parse(window.localStorage.getItem(key) || '[]');
  return res;
};

export const setFinancialReportDataIndicatorGroups = (schema: Array<ReportIndicatorGroup>) => {
  window.localStorage.setItem(
    key,
    JSON.stringify(schema),
  );
};

