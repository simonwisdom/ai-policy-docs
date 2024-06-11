import React, { useRef, useEffect, useState } from 'react';
import { Table, Tag, TablePaginationConfig, Select, Switch, Tooltip, Tabs } from 'antd';
import { useTable, CrudFilters } from '@refinedev/antd';
import { IDocument } from '../../interfaces';
import './list.css';
import ExpandedRowContent from '../../components/ExpandedRowContent';
import { getColumns } from './columnsConfig';
import { handleAgencyFilterChange, handleTypeFilterChange, handleClearFilters, handleSearch, handleRemoveDocumentFilter } from './utils';
import { Input, Button } from 'antd';
import ChatbotResults from '../../components/ChatbotResults';
import { StateProvider, useStateContext } from '../../components/StateContext';
import FilterSection from '../../components/FilterSection';
// import FilterSummary from '../../components/FilterSummary';
import HelpSidebar from '../../components/HelpSidebar'; 
import DocumentDescription from '../../components/DocumentDescription';


const DOCUMENT_TYPES = ['Rule', 'Proposed Rule', 'Notice', 'Presidential Document'];

const { TabPane } = Tabs;

const DocumentList: React.FC<DocumentListProps & { isHelpSidebarOpen: boolean }> = ({ isSidebarOpen, isHelpSidebarOpen }) => {
  const {
    activeTypeFilter, setActiveTypeFilter,
    selectedAgency, setSelectedAgency,
    searchText, setSearchText,
    searchApplied, setSearchApplied,
    isOpenComments, setIsOpenComments,
    isPopular, setIsPopular
  } = useStateContext();

  const [selectedTag, setSelectedTag] = useState<string>('');
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const pageSizeRef = useRef(10);
  const [documentNumbers, setDocumentNumbers] = useState<number[]>([]);
  const [selectedTab, setSelectedTab] = useState('1');

  const handleTabChange = (key) => {
    console.log('Selected tab:', key);
    setSelectedTab(key);
  };

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
    ...(isPopular ? [
      {
        field: 'page_views_count',
        operator: 'gte',
        value: 3000,
      },
    ] : []),
    ...(isOpenComments ? [
      {
        field: 'comments_close_on',
        operator: 'gt',
        value: new Date().toISOString().split('T')[0], // Current date in 'YYYY-MM-DD' format
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
    filters,
  } = useTable<IDocument>({
    resource: 'ai_documents',
    initialPageSize: pageSizeRef.current,
    metaData: {
      fields: ['data', 'total', 'page', 'pageSize'],
    },
    hasPagination: true,
    pagination: {
      current: 1,
      pageSize: pageSizeRef.current,
      mode: 'server',
    },
    filters: {
      initial: [
        ...initialFilters,
        ...(documentNumbers.length > 0 ? [
          {
            field: 'document_number',
            operator: 'in' as const,
            value: documentNumbers,
          },
        ] : []),
      ],
      defaultBehavior: 'replace',
    },
    onSearch: (filters: CrudFilters) => {
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

  useEffect(() => {
    if (documentNumbers.length > 0) {
      setFilters((prevFilters) => [
        ...prevFilters.filter((filter) => filter.field !== 'document_number'),
        {
          field: 'document_number',
          operator: 'in' as const,
          value: documentNumbers,
        },
      ]);
      setCurrent(1);
    }
  }, [documentNumbers, setFilters, setCurrent]);

  if (!tableProps.dataSource) {
    return <div>No data available.</div>;
  }

  const dataSource = tableProps?.dataSource?.data ?? [];
  const totalDocuments = tableProps?.dataSource?.total ?? 0;

  const expandRow = (rowKey: React.Key) => {
    setExpandedRowKeys((prevExpandedKeys) =>
      prevExpandedKeys.includes(rowKey)
        ? prevExpandedKeys.filter((key) => key !== rowKey)
        : [rowKey]
    );
  };

  const columns = getColumns(
    setSelectedAgency,
    setSelectedTag,
    setFilters,
    expandRow,
    expandedRowKeys,
    setCurrent,
    searchText
  );

  const responsiveColumns = columns.map((column) => ({
    ...column,
    width: isSidebarOpen ? 150 : 200,
  }));

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrent(page);
    setPageSize(pageSize || pageSizeRef.current);
  };

  const paginationConfig: TablePaginationConfig = {
    current: tableProps.pagination?.current || 1,
    pageSize: tableProps.pagination?.pageSize || pageSizeRef.current,
    total: totalDocuments,
    onChange: handlePageChange,
  };

  const tabItems = [
    { key: '1', label: 'US Executive' },
    { key: '2', label: 'US Legislative' },
    { key: '3', label: 'UK' },
    { key: '4', label: 'EU' },
    { key: '5', label: 'China' }
  ];

  return (
    <div>
      {isHelpSidebarOpen && <HelpSidebar onClose={() => setIsHelpSidebarOpen(false)} />} 


    <Tabs defaultActiveKey="1" onChange={handleTabChange} items={tabItems} />
    
    {selectedTab === '1' && <DocumentDescription selectedTab={selectedTab} />}

    {selectedTab === '1' && (
        <FilterSection
          handleSearch={() =>
            handleSearch(
              searchText,
              setSearchText,
              setSearchApplied,
              setFilters,
              setCurrent,
              activeTypeFilter,
              isOpenComments,
              isPopular,
              selectedAgency
            )
          }
          // handleChatbotSearch={() => handleChatbotSearch(searchText)}
          handleClearFilters={() =>
            handleClearFilters(
              setActiveTypeFilter,
              setSelectedAgency,
              setSearchText,
              setSearchApplied,
              setFilters,
              setCurrent,
              setIsOpenComments,
              setIsPopular
            )
          }
          isOpenComments={isOpenComments}
          setIsOpenComments={setIsOpenComments}
          isPopular={isPopular}
          setIsPopular={setIsPopular}
          activeTypeFilter={activeTypeFilter}
          setActiveTypeFilter={(type) =>
            handleTypeFilterChange(
              type,
              setActiveTypeFilter,
              setFilters,
              setCurrent,
              searchText,
              selectedAgency,
              isOpenComments,
              isPopular
            )
          }
          setFilters={setFilters}
          setCurrent={setCurrent}
          totalDocuments={totalDocuments}
          setSearchApplied={setSearchApplied}
          handleAgencyFilterChange={() =>
            handleAgencyFilterChange(
              '',
              setSelectedAgency,
              setFilters,
              setCurrent,
              searchText,
              activeTypeFilter,
              isOpenComments,
              isPopular
            )
          }
          handleRemoveDocumentFilter={() => handleRemoveDocumentFilter(setFilters, setCurrent)}
          filters={filters}
        />
      )}


      {selectedTab === '1' ? (
            <div style={{ display: 'flex' }}>
              <div style={{ flex: 1, overflowX: 'auto' }}>
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
                    expandIconColumnIndex: -1,
                  }}
                  bordered
                  className="custom-table"
                  scroll={{ x: 'max-content' }}
                  // scroll={{ x: isSidebarOpen ? 1500 : 1500, y: 'calc(100vh - 250px)' }}
                  pagination={paginationConfig}
                />
              </div>
            </div>
          ) : (
            <div style={{ padding: 20 }}>
              <p>Coming soon</p>
            </div>
          )}
        </div>
      );
};

export default DocumentList;
