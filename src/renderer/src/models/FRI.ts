import { atomWithStorage } from 'jotai/utils';
import type { ReportIndicatorGroup } from '@renderer/types';
import { LocalstorageKeys } from '@renderer/constants';

export const FRIGroupsAtom = atomWithStorage<Array<ReportIndicatorGroup>>(
  `value-investing-tool_${LocalstorageKeys.FINANCIAL_REPORT_DATA_INDICATOR_GROUPS}`,
  [],
);

export const followedFRIMapAtom = atomWithStorage<Record<string, Array<{ reason: string; id: string; }>>>(
  `value-investing-tool_${LocalstorageKeys.FOLLOWED_FRI_STOCK_MAP}`,
  {},
);

