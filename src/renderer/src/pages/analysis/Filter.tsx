import { memo, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Spin,
  Table,
  Tooltip,
  Tag,
  theme,
  Space,
  Input,
} from 'antd';
import { TableColumnProps } from 'antd/lib';
import { PlusOutlined } from '@ant-design/icons';
import { db } from '@renderer/api/db';
import { getFilterSchema, setFilterSchema } from '@renderer/api/localstorage';
import type { StockWithLeadingIndicators } from '@renderer/types';
import type { FilterSchema } from '@renderer/types/filter-schema';
import { NameColumn } from '@renderer/components/TableColumn';
import { computeRPNWithLeadingIndicators } from './computeExpression';
import { AddFilterSchemaModal } from './AddFilterSchemaModal';

const simplyExpression = (exp?: string) => {
  if (!exp) {
    return 'Not Exist Expression';
  }

  let res = '';
  let isVariable = false;
  let variable = '';
  let isBracket = false;

  const getTextFromVariable = (v: string) => {
    const [pinyin, chinese, year = '0'] = v.split('-');
    let prefix = '';
    if (year.startsWith('avg')) {
      const years = year[3];
      prefix = `${years} 年均 - `;
    }
    return `${prefix}${(chinese || pinyin)}`;
  };

  for (const ch of exp) {
    if (ch === ']') {
      isBracket = false;
      continue;
    }
    if (ch === '[') {
      isBracket = true;
      continue;
    }
    if (isBracket) {
      continue;
    }
    if (ch === '@') {
      isVariable = true;
      continue;
    }
    if (isVariable && /[\s()]/.test(ch)) {
      if (!variable) {
        return 'error';
      }
      res += getTextFromVariable(variable);
      variable = '';
      isVariable = false;
    }
    if (isVariable) {
      variable += ch;
    } else {
      res += ch;
    }
  }
  return res + getTextFromVariable(variable);
};

export const Filter = memo(() => {
  const { token } = theme.useToken();
  const [schema, setSchema] = useState(getFilterSchema());
  const [addFilterModalVisible, setAddFilterModalVisible] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [defaultSchema, setDefaultSchema] = useState<FilterSchema | undefined>(undefined);
  const [searchKey, setSearchKey] = useState('');

  const [filterOnSet, setFilterOnSet] = useState(new Set(schema.map((item) => item.id)));

  const baseInfoMap = useLiveQuery(async () => {
    const list = await db.stockBaseInfoList.toArray();
    return new Map(list.map((item) => [item.id, item]));
  });

  const list = useLiveQuery(
    () => db
      .stockWithLeadingIndicatorsList
      .toArray(),
    [],
  );

  const filteredList = useMemo(
    () => {
      if (!list) {
        return undefined;
      }
      let collect = list;
      if (searchKey) {
        collect = collect.filter((item) => {
          return item.code.toLowerCase().indexOf(searchKey.toLowerCase()) >= 0 || item.name.indexOf(searchKey.toLowerCase()) >= 0;
        });
      }
      return collect.filter((record) => {
        return !schema.find((sc) => {
          if (!filterOnSet.has(sc.id)) {
            return false;
          }
          if (!sc.RPN) {
            return false;
          }
          const value = computeRPNWithLeadingIndicators(sc.RPN, record, baseInfoMap);
          // 因为各种原因（比如缺失数据）导致无法计算出结果，直接抛弃
          if (value === null) {
            return true;
          }
          let times = 1;
          if (sc.limitUnit === 'y') {
            times = 1_0000_0000;
          } else if (sc.limitUnit === 'w') {
            times = 1_0000;
          }
          // illegal
          if (sc.limit?.[0] !== undefined && value < sc.limit[0] * times) {
            return true;
          }
          if (sc.limit?.[1] !== undefined && value > sc.limit[1] * times) {
            return true;
          }
          return false;
        });
      });
    },
    [list, filterOnSet, schema, baseInfoMap, searchKey],
  );

  const industryList = useMemo(
    () => {
      const noDuplicateList = Array.from(new Set(filteredList?.map((item) => baseInfoMap?.get?.(item.id)?.INDUSTRY)));
      return noDuplicateList.filter((item): item is string => !!item);
    },
    [filteredList, baseInfoMap],
  );

  return (
    <div className="w-full h-full overflow-auto p-6 text-base font-sans box-border">
      <div className="text-lg mb-4 bold">
        指标筛选
      </div>
      <div className="flex items-center flex-wrap gap-y-2 mb-6">
        <div className="mr-5">
          当前筛选项:
        </div>
        {!schema.length && (
          <div>无筛选项</div>
        )}
        {
          schema.map((item) => {
            const { title, expression, id, limit } = item;
            return (
              <Tooltip
                key={expression}
                placement="bottomLeft"
                title={(
                  <div className="flex items-center gap-3">
                    <div>
                      {simplyExpression(expression)}
                    </div>
                    <div className="flex-none flex items-center gap-3">
                      <div>∈</div>
                      <div>{`[${limit?.[0] ?? '-∞'}, ${limit?.[1] ?? '+∞'}]`}</div>
                    </div>
                  </div>
                )}
              >
                <Tag
                  onClose={() => {
                    const schemaList = schema.filter((listItem) => listItem.id !== id);
                    setSchema(schemaList);
                    setFilterOnSet(new Set(schemaList.map((item) => item.id)));
                    setFilterSchema(schemaList);
                  }}
                  closeIcon
                  key={id}
                >
                  <span>{title}</span>
                  <span
                    className="ml-2 cursor-pointer text-blue-500"
                    onClick={() => {
                      setDefaultSchema(item);
                      setAddFilterModalVisible(true);
                    }}
                  >
                    修改
                  </span>
                </Tag>
              </Tooltip>
            );
          })
        }
        <Tag
          icon={<PlusOutlined />}
          onClick={() => setAddFilterModalVisible(true)}
          style={{
            height: 22,
            background: token.colorBgContainer,
            borderStyle: 'dashed',
            cursor: 'pointer',
            marginLeft: 12,
          }}
        >
          增加筛选项
        </Tag>
      </div>
      <Space size={24} className="mb-6">
        <div className="text-base">
          {`筛选结果条数: ${filteredList ? filteredList.length : '加载中' }`}
        </div>
        <Space size={16}>
          <div>搜索:</div>
          <Input.Search onSearch={(value) => setSearchKey(value)} />
        </Space>
      </Space>
      <div className="w-full overflow-x-auto">
        <Spin spinning={!filteredList}>
          <Table<StockWithLeadingIndicators>
            pagination={{
              pageSize,
              onChange(_, pageSize) {
                setPageSize(pageSize);
              },
              showQuickJumper: true,
              showSizeChanger: true,
            }}
            rowKey="code"
            dataSource={filteredList || []}
            columns={[
              {
                title: '名称',
                key: 'name',
                dataIndex: 'name',
                render: (name: string, record) => {
                  return <NameColumn name={name} id={record.id} />;
                },
              },
              {
                title: '行业',
                key: 'industry',
                render: (_, record) => {
                  return <div>{baseInfoMap?.get?.(record.id)?.INDUSTRY}</div>;
                },
                filters: industryList?.map((name) => ({
                  text: name,
                  value: name,
                })),
                onFilter: (value, record) => baseInfoMap?.get?.(record.id)?.INDUSTRY === value,
              },
              {
                title: '最新报表时间',
                key: 'latestReportTime',
                render: (_, record) => {
                  return <div>{record.indicators[0].reportYear} 年</div>;
                },
              },
              ...schema.map<TableColumnProps<StockWithLeadingIndicators>>((sc) => {
                return {
                  title: sc.title,
                  key: sc.id,
                  render: (_, record) => {
                    if (!sc.RPN) {
                      return 'Not Exist RPN';
                    }
                    const value = computeRPNWithLeadingIndicators(sc.RPN, record, baseInfoMap) || 0;
                    if (value > 1_0000_0000) {
                      return `${(value / 1_0000_0000).toFixed(2)} 亿`;
                    }
                    if (value > 1_0000) {
                      return `${(value / 1_0000).toFixed(2)} 万`;
                    }
                    return value.toFixed(2);
                  },
                  sorter: sc.RPN
                    ? ((a, b) => (computeRPNWithLeadingIndicators(sc.RPN!, a, baseInfoMap) || 0) - (computeRPNWithLeadingIndicators(sc.RPN!, b, baseInfoMap) || 0))
                    : undefined,
                };
              }),
            ]}
          />
        </Spin>
      </div>
      <AddFilterSchemaModal
        key={defaultSchema?.id || `${Date.now()}-${Math.random().toString().slice(2, 10)}`}
        visible={addFilterModalVisible}
        defaultSchema={defaultSchema}
        onConfirm={(filter) => {
          const map = new Map(schema.map((item) => [item.id, item]));
          map.set(filter.id, filter);
          const schemaList = [...map.values()];
          setSchema(schemaList);
          setFilterOnSet(new Set(schemaList.map((item) => item.id)));
          setFilterSchema(schemaList);
          setAddFilterModalVisible(false);
          setDefaultSchema(undefined);
        }}
        onCancel={() => {
          setAddFilterModalVisible(false);
          setDefaultSchema(undefined);
        }}
      />
    </div>
  );
});

Filter.displayName = 'analysis/Filter';
