import React, { useState, useRef } from 'react';
import { Table, Tag, TablePaginationConfig } from 'antd';
import { useTable, useTableReturnType } from '@refinedev/antd';
import { CrudFilters } from '@refinedev/core';
import { IDocument, IDataResponse } from '../../interfaces';
import './list.css';
import ExpandedRowContent from '../../components/ExpandedRowContent';
import { getColumns } from './columnsConfig';
import { handleAgencyFilterChange, handleTypeFilterChange, handleClearFilters, handleSearch } from './utils';
import { Input, Button } from 'antd';

const FILTER_TAGS: string[] = ['Rule', 'Proposed Rule', 'Notice', 'Presidential Document', 'Open Comments', 'Popular'];

export const DocumentList: React.FC = () => {
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  // const [current, setCurrent] = useState(1);
  const pageSizeRef = useRef(10);
  const [searchText, setSearchText] = useState<string | null>(null);
  const [searchApplied, setSearchApplied] = useState(false);
  const initialFilterState: CrudFilters = [];
  
  const initialFilters: CrudFilters = [
    ...(selectedAgency ? [
      {
        field: 'agency_names',
        operator: 'contains',
        value: selectedAgency,
      },
    ] : []),
    ...(activeTypeFilter ? [
      {
        field: 'type',
        operator: 'eq',
        value: activeTypeFilter === 'Popular' ? undefined : activeTypeFilter,
      },
    ] : []),
    ...(activeTypeFilter === 'Popular' ? [
      {
        field: 'page_views_count',
        operator: 'gte',
        value: 3000,
      },
    ] : []),
    ...(searchText ? [
      {
        field: 'search_query',
        operator: 'contains',
        value: searchText,
      },
    ] : []),
  ];

  const {
    tableProps,
    setFilters,
    setPageSize,
    setCurrent,
  } = useTable<IDocument>({
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
      initial: initialFilters,
      defaultBehavior: 'replace',
    },
    onSearch: (filters: CrudFilters) => {
      console.log("Search Filters:", filters);
      return filters;
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

  // if (tableProps.loading) {
  //   return <div>Loading data...</div>; 
  // }

  if (!tableProps.dataSource) {
    return <div>No data available.</div>;
  }  
  
  // console.log("Table Props:", tableProps);
  // console.log("Data Source:", tableProps.dataSource);

  // @ts-ignore
  const dataSource = tableProps?.dataSource?.data ?? [];
  // @ts-ignore
  const totalDocuments = tableProps?.dataSource?.total ?? 0;
  
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

const columns = getColumns(setSelectedAgency, setSelectedTag, setFilters, expandRow, expandedRowKeys, setCurrent);

const handlePageChange = (page: number, pageSize?: number) => {
    // console.log(`Pagination Change: Page - ${page}, PageSize - ${pageSize}`);
    setCurrent(page);
    setPageSize(pageSize || pageSizeRef.current);
  };
  
  const paginationConfig: TablePaginationConfig = {
    // @ts-ignore
    current: tableProps.pagination?.current || 1,
    // @ts-ignore
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
          onClick={() => handleTypeFilterChange(type, setActiveTypeFilter, setFilters, setCurrent, searchText)}
          key={`filter-tag-${index}`}
        >
          {type}
        </Tag>        
        ))}
        <Tag onClick={() => handleClearFilters(
          setActiveTypeFilter, 
          setSelectedAgency, 
          setSearchText, 
          setSearchApplied, 
          setFilters, 
          setCurrent, 
          initialFilterState
        )} key="clear-filter-tag">
          Clear Filters
        </Tag>

        {selectedAgency && (
          <Tag onClick={() => handleAgencyFilterChange("", setSelectedAgency, setFilters, setCurrent, searchText)} key="selected-agency-tag">
            Agency: {selectedAgency}
          </Tag>
        )}
        {searchApplied && (
          <Tag onClick={() => handleSearch("", setSearchText, setSearchApplied, setFilters, setCurrent)} key="search-text-tag">
            Search: {searchText}
          </Tag>
        )}
        <div style={{ marginBottom: 20 }}>
          Total Documents: {totalDocuments}
        </div>
          <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search LLM Summary"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200, marginRight: 8 }}
          />
          <Button onClick={() => handleSearch(searchText, setSearchText, setSearchApplied, setFilters, setCurrent)}>
            Search
          </Button>
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