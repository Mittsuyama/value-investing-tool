import { useMemo, useRef } from 'react';
import { useMemoizedFn } from 'ahooks';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { LocalstorageKeys } from '@renderer/constants';

const key = `value-investing-tool_${LocalstorageKeys.FAVORITE_STOCK_LIST}`;

export const favoriteStockIdListAtom = atomWithStorage<string[]>(key, []);

export const useToggoleFavoriteStockList = (id: string) => {
  const [list, setList] = useAtom(favoriteStockIdListAtom);

  const has = useMemo(
    () => Boolean(list.find((item) => item === id)),
    [list, id],
  );

  const toggle = useMemoizedFn(() => {
    if (has) {
      setList(list.filter((item) => item !== id));
    } else {
      setList([...list, id]);
    }
  });

  return {
    list,
    has,
    toggle,
  };
};

