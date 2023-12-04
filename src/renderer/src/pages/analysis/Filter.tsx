import { memo, useMemo, useState } from 'react';
import {
  Spin,
  Table,
  Form,
  Space,
  Tooltip,
  Tag,
  theme,
} from 'antd';
import cls from 'classnames';
import { useMemoizedFn, useMount } from 'ahooks';
import { useLiveQuery } from 'dexie-react-hooks';
import { PlusOutlined, FilterFilled } from '@ant-design/icons';
import type { FilterSchema } from '@renderer/types/filter-schema';
import { db } from '@renderer/api/db';
import { getFilterSchema, setFilterSchema } from '@renderer/api/localstorage';
import { AddFilterSchemaModal } from './AddFilterSchemaModal';
import { StockBaseInfo, StockWithLeadingIndicators } from '@renderer/types';
import { TableColumnProps } from 'antd/lib';
import { computeRPN } from './computeExpression';

export const Filter = memo(() => {
  const { token } = theme.useToken();
  const [schema, setSchema] = useState(getFilterSchema());
  const [addFilterModalVisible, setAddFilterModalVisible] = useState(false);
  const [baseInfoMap, setBaseInfoMap] = useState<Map<string, StockBaseInfo>>(new Map());
  const [pageSize, setPageSize] = useState(10);
  const [defaultSchema, setDefaultSchema] = useState<FilterSchema | undefined>(undefined);

  const [filterOnSet, setFilterOnSet] = useState(new Set(schema.map((item) => item.id)));
  const toggleFilter = useMemoizedFn((id: string) => {
    const tmpSet = new Set(filterOnSet);
    if (filterOnSet.has(id)) {
      tmpSet.delete(id);
    } else {
      tmpSet.add(id);
    }
    setFilterOnSet(tmpSet);
  });

  useMount(async () => {
    const list = await db.stockBaseInfoList.toArray();
    setBaseInfoMap(new Map(list.map((item) => [item.id, item])));
  });

  const list = useLiveQuery(
    () => db
      .stockWithLeadingIndicatorsList
      .toArray(),
    [],
  );

  const filteredList = useMemo(
    () => {
      return list?.filter((record) => {
        return !schema.find((sc) => {
          if (!filterOnSet.has(sc.id)) {
            return false;
          }
          const value = computeRPN(sc.RPN, record);
          if (value === null) {
            return true;
          }
          // illegal
          if (sc.relation === 'greater-than') {
            return value < sc.value;
          } else {
            return value > sc.value;
          }
        });
      });
    },
    [list, filterOnSet, schema],
  );

  return (
    <div className="w-full h-full overflow-auto p-6 text-base font-sans box-border">
      <div className="text-lg mb-4 bold">
        指标筛选
      </div>
      <Space wrap size={0}>
        <div className="mr-5">
          当前筛选项:
        </div>
        {!schema.length && (
          <div>无筛选项</div>
        )}
        {
          schema.map((item) => {
            const { title, expression, relation, value, id } = item;
            return (
              <Tooltip
                key={expression}
                placement="bottomLeft"
                title={(
                  <div className="flex items-center gap-3">
                    <div>
                      {expression}
                    </div>
                    <div className="flex-none flex items-center gap-3">
                      <div>{relation === 'greater-than' ? '>' : '<'}</div>
                      <div>{value}</div>
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
      </Space>
      <div className="mb-4">
        <Form autoComplete="off" layout="inline">

        </Form>
      </div>
      <Spin spinning={!filteredList}>
        <Table
          pagination={{
            pageSize,
            onChange(_, pageSize) {
              setPageSize(pageSize);
            },
            showQuickJumper: true,
          }}
          rowKey="code"
          dataSource={filteredList || []}
          columns={[
            {
              title: '名称',
              key: 'name',
              dataIndex: 'name',
            },
            {
              title: '代码',
              key: 'code',
              dataIndex: 'code',
            },
            {
              title: '最近报表时间',
              key: 'latestReportTime',
              render: (_, record) => {
                return <div>{record.indicators[0].reportYear} 年</div>;
              },
            },
            {
              title: '最早报表时间',
              key: 'earliestReportTime',
              render: (_, record) => {
                return <div>{record.indicators[record.indicators.length - 1].reportYear} 年</div>;
              },
            },
            {
              title: 'TTM 市盈率',
              key: 'ttm-pe',
              dataIndex: 'ttmPe',
              render: (_, { id }) => baseInfoMap.get(id)?.ttmPe,
            },
            {
              title: '市值',
              key: 'totalMarketCap',
              dataIndex: 'totalMarketCap',
              render: (value) => `${(Number(value) / 1_0000_0000).toFixed(2)} 亿`,
            },
            ...schema.map<TableColumnProps<StockWithLeadingIndicators>>((sc) => {
              return {
                title: (
                  <div className="flex justify-between items-center">
                    <div>{sc.title}</div>
                    <Tooltip title="是否筛选" trigger="hover">
                      <div
                        className={cls(
                          'py-1 px-2 rounded cursor-pointer',
                          { 'text-blue-500 hover:text-blue-600': filterOnSet.has(sc.id) },
                          { 'text-gray-400 hover:text-blue-300': !filterOnSet.has(sc.id) },
                        )}
                        onClick={() => toggleFilter(sc.id)}
                      >
                        <FilterFilled />
                      </div>
                    </Tooltip>
                  </div>
                ),
                key: sc.id,
                render: (_, record) => {
                  return (computeRPN(sc.RPN, record) || 0).toFixed(2);
                },
                sorter: (a, b) => (computeRPN(sc.RPN, a) || 0) - (computeRPN(sc.RPN, b) || 0),
              };
            }),
          ]}
        />
      </Spin>
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
