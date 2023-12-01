import { useMount } from 'ahooks';
import { getAllStocks, fetchStocksByFilter } from '@renderer/api';
import { memo } from 'react';

export const App = memo(() => {
  useMount(async () => {
    const res = await fetchStocksByFilter({ maxPe: 30 });
    console.log(res);
  });

  return (
    <div>
      App
    </div>
  )
});

App.displayName = 'App';

