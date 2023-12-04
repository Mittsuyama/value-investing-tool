import { MetaInfo } from '@renderer/types/meta';
import { LocalstorageKeys } from '@renderer/constants';

const key = `value-investing-tool_${LocalstorageKeys.META_INFO}`;

export const getMetaInfo = (): MetaInfo => {
  return JSON.parse(window.localStorage.getItem(key) || '{}');
};

export const setMetaInfo = (info: MetaInfo) => {
  window.localStorage.setItem(
    key,
    JSON.stringify(info),
  );
};
