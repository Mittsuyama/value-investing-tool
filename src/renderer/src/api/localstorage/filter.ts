import type { FilterSchema } from '@renderer/types/filter-schema';
import { LocalstorageKeys } from '@renderer/constants';

const key = `value-investing-tool_${LocalstorageKeys.FILTER_SCHEMA}`;

export const getFilterSchema = (): Array<FilterSchema> => {
  const res = JSON.parse(window.localStorage.getItem(key) || '[]');
  return res.map((schema: FilterSchema) => ({
    ...schema,
    limit: schema.limit?.map?.((item) => item ?? undefined),
  }));
};

export const setFilterSchema = (schema: FilterSchema[]) => {
  window.localStorage.setItem(
    key,
    JSON.stringify(schema),
  );
};
