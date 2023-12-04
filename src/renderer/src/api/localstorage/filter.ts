import type { FilterSchema } from '@renderer/types/filter-schema';
import { LocalstorageKeys } from '@renderer/constants';

const key = `value-investing-tool_${LocalstorageKeys.FILTER_SCHEMA}`;

export const getFilterSchema = (): FilterSchema[] => {
  return JSON.parse(window.localStorage.getItem(key) || '[]');
};

export const setFilterSchema = (schema: FilterSchema[]) => {
  window.localStorage.setItem(
    key,
    JSON.stringify(schema),
  );
};
