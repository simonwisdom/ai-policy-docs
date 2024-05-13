import React, { useState, useRef } from 'react';
import { Table, Tag, TablePaginationConfig } from 'antd';
import { useTable, UseTableReturnType } from '@refinedev/antd';
import { CrudFilters } from '@refinedev/core';
import { IDocument } from '../../interfaces';
import './list.css';
import ExpandedRowContent from '../../components/ExpandedRowContent';
import { getColumns } from './columnsConfig';
import { handleAgencyFilterChange, handleTypeFilterChange, handleClearFilters } from './utils';

const FILTER_TAGS: string[] = ['Rule', 'Proposed Rule', 'Notice', 'Presidential Document', 'Open Comments'];

export const DocumentList: React.FC = () => {
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  // const [current, setCurrent] = useState(1);
  const pageSizeRef = useRef(10);

  const {
    tableProps,
    setFilters,
    setPageSize,
    setCurrent,
  }: UseTableReturnType<IDocument> = useTable<IDocument>({
    resource: 'ai_documents',
    initialPageSize: pageSizeRef.current,
    metaData: {
      fields: ['data', 'total', 'page', 'pageSize'],
    },
    hasPagination: true,
    pagination: {
      current: 1, // Initial value
      pageSize: pageSizeRef.current,
      mode: 'server', 
    },
    filters: {
      initial: [
        {
          field: 'agency_names',
          operator: 'contains',
          value: selectedAgency,
        },
        {
          field: 'type',
          operator: 'eq',
          value: activeTypeFilter,
        },
      ],
      defaultBehavior: 'replace',
    },
    sorters: {
      initial: [
        {
          field: 'publication_date',
          order: 'desc',
        },
      ],
    },
  });
  

  // Debugging statements
  // console.log(`Initial Pagination: Current - ${tableProps.pagination?.current}, PageSize - ${pageSizeRef.current}`);
  // console.log(`TableProps Pagination: Current - ${tableProps.pagination?.current}, PageSize - ${tableProps.pagination?.pageSize}`);  
  // console.log(`Initial Sort: publication_date:desc`);
  // console.log(`TableProps Sort: ${JSON.stringify(tableProps.sorter)}`);

  const expandRow = (rowKey: React.Key) => {
    setExpandedRowKeys((prevExpandedKeys) =>
      prevExpandedKeys.includes(rowKey)
        ? prevExpandedKeys.filter((key) => key !== rowKey)
        : [rowKey]
    );
  };

  const columns = getColumns(setSelectedAgency, setSelectedTag, setFilters, expandRow, expandedRowKeys);

  const dataSource = tableProps?.dataSource?.data ?? [];
  const totalDocuments = tableProps?.dataSource?.total ?? 0;

  const handlePageChange = (page: number, pageSize?: number) => {
    // console.log(`Pagination Change: Page - ${page}, PageSize - ${pageSize}`);
    setCurrent(page);
    setPageSize(pageSize || pageSizeRef.current);
  };
  
  const paginationConfig: TablePaginationConfig = {
    current: tableProps.pagination?.current || 1,
    pageSize: tableProps.pagination?.pageSize || pageSizeRef.current,
    total: totalDocuments,
    onChange: handlePageChange,
  };
  

  return (
    <div>
      <div className="filter-tags">
        {FILTER_TAGS.map((type: string, index: number) => (
          <Tag
            color={activeTypeFilter === type ? 'blue' : 'default'}
            onClick={() => handleTypeFilterChange(type, setActiveTypeFilter, setFilters, setCurrent)}
            key={`filter-tag-${index}`}
          >
            {type}
          </Tag>
        ))}
        <Tag onClick={() => handleClearFilters(setActiveTypeFilter, setSelectedAgency, setFilters, setCurrent)} key="clear-filter-tag">
          Clear Filter
        </Tag>
        {selectedAgency && (
          <Tag onClick={() => handleAgencyFilterChange("", setSelectedAgency, setFilters, setCurrent)} key="selected-agency-tag">
            Agency: {selectedAgency}
          </Tag>
        )}
        <div style={{ marginBottom: 20 }}>
          Total Documents: {totalDocuments}
        </div>
      </div>
      <Table<IDocument>
        {...tableProps}
        dataSource={dataSource}
        rowKey="document_number"
        columns={columns as any}
        onRow={(record) => ({
          onClick: () => expandRow(record.document_number),
        })}
        expandable={{
          expandedRowRender: (record) => <ExpandedRowContent record={record} />,
          expandedRowKeys,
          expandIcon: () => null,
          columnWidth: '0px',
        }}
        bordered
        className="custom-table"
        scroll={{ x: '100%', y: 'calc(100vh - 250px)' }}
        pagination={paginationConfig}
      />
    </div>
  );
};

export default DocumentList;