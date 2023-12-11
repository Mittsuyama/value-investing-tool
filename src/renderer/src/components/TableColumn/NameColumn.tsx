import { memo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { RouteKeys } from '@renderer/routers/configs';

interface NameColumnProps {
  name: string;
  id: string;
}

export const NameColumn = memo((props: NameColumnProps) => {
  const { name, id } = props;

  const history = useHistory();
  const { pathname } = useLocation();

  return (
    <div
      className="text-blue-500 hover:text-blue-400 cursor-pointer"
      onClick={() => {
        const search = new URLSearchParams();
        search.set('id', id);
        search.set('from', pathname);
        history.push(`${RouteKeys.FINANCIAL_REPORTS_DATA_DETAIL}?${search.toString()}`)
      }}
    >
      {name}
    </div>
  );
});

NameColumn.displayName = 'NameColumn';
