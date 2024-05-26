import React, { useState, useRef, useEffect } from 'react';
import { Table, Tag, TablePaginationConfig } from 'antd';
import { useTable, CrudFilters } from '@refinedev/antd';
import { IDocument } from '../../interfaces';
import './list.css';
import ExpandedRowContent from '../../components/ExpandedRowContent';
import { getColumns } from './columnsConfig';
import { handleAgencyFilterChange, handleTypeFilterChange, handleClearFilters, handleSearch, handleRemoveDocumentFilter } from './utils';
import { Input, Button } from 'antd';
import ChatbotResults from '../../components/ChatbotResults';


const FILTER_TAGS: string[] = ['Rule', 'Proposed Rule', 'Notice', 'Presidential Document', 'Open Comments', 'Popular'];

interface DocumentListProps {
  isSidebarOpen: boolean;
  filters: CrudFilters;
  setFilters: (filters: CrudFilters) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ isSidebarOpen }) => {
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const pageSizeRef = useRef(10);
  const [searchText, setSearchText] = useState<string | null>(null);
  const [searchApplied, setSearchApplied] = useState(false);
  const [documentNumbers, setDocumentNumbers] = useState<number[]>([]);
  const initialFilterState: CrudFilters = [];
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [llmResponse, setLLMResponse] = useState('');
  const [isChatbotSidebarOpen, setIsChatbotSidebarOpen] = useState(false);
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);
  const [isChatbotInitialized, setIsChatbotInitialized] = useState(false);



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
      // console.log("Search Filters:", filters);
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
    // console.log("Document Numbers in useEffect:", documentNumbers);
    if (documentNumbers.length > 0) {
      setFilters((prevFilters) => [
        ...prevFilters.filter((filter) => filter.field !== 'document_number'),
        {
          field: 'document_number',
          operator: 'in' as const,
          value: documentNumbers,
        },
      ]);
      setCurrent(1); // Reset to the first page if needed
    }
  }, [documentNumbers, setFilters, setCurrent]);

  const handleChatbotSearch = async (query: string) => {

    setIsChatbotLoading(true);
    setIsChatbotSidebarOpen(true);
    setIsChatbotInitialized(true);

    try {
      const backendUrl = import.meta.env.MODE === 'production'
        ? `${import.meta.env.VITE_BACKEND_URL_PROD || 'https://aipolicydocs-2612a9348c68.herokuapp.com'}/api/algolia_search?query=${encodeURIComponent(query)}`
        : `${import.meta.env.VITE_BACKEND_URL_DEV || 'http://localhost:3001'}/api/algolia_search?query=${encodeURIComponent(query)}`;

      // console.log(`Sending request to: ${backendUrl}`);
      const response = await fetch(backendUrl);
      // console.log(`Response status: ${response.status}`);

      setIsChatbotLoading(false);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const parsedResponse = await response.json();
      // console.log('Parsed response:', parsedResponse);

      if (parsedResponse.llmResponse && parsedResponse.searchResults) {
        setLLMResponse(parsedResponse.llmResponse);
        setSearchResults(parsedResponse.searchResults);
        setIsChatbotSidebarOpen(true);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setIsChatbotLoading(false);
    }
  };

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

  return (
    <div>
      <div className="filter-tags">
        {FILTER_TAGS.map((type: string, index: number) => (
          <Tag
            color={activeTypeFilter === type ? 'blue' : 'default'}
            onClick={() =>
              handleTypeFilterChange(type, setActiveTypeFilter, setFilters, setCurrent, searchText)
            }
            key={`filter-tag-${index}`}
          >
            {type}
          </Tag>
        ))}
        <Tag
          onClick={() =>
            handleClearFilters(
              setActiveTypeFilter,
              setSelectedAgency,
              setSearchText,
              setSearchApplied,
              setFilters,
              setCurrent,
              initialFilterState
            )
          }
          key="clear-filter-tag"
        >
          Clear Filters
        </Tag>
  
        {selectedAgency && (
          <Tag
            onClick={() =>
              handleAgencyFilterChange("", setSelectedAgency, setFilters, setCurrent, searchText)
            }
            key="selected-agency-tag"
          >
            Agency: {selectedAgency}
          </Tag>
        )}
        {searchApplied && (
          <Tag
            onClick={() => handleSearch("", setSearchText, setSearchApplied, setFilters, setCurrent)}
            key="search-text-tag"
          >
            Search: {searchText}
          </Tag>
        )}
        {filters.some((filter) => filter.field === 'document_number') && (
          <Tag
            closable
            onClose={() => handleRemoveDocumentFilter(setDocumentNumbers, setFilters, setCurrent)}
          >
            Document Filter
          </Tag>
        )}
      </div>
  
      <div style={{ marginBottom: 20 }}>
        Total Documents: {totalDocuments}
      </div>
  
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <Input
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200, marginRight: 8 }}
        />
        <Button
          onClick={() =>
            handleSearch(searchText, setSearchText, setSearchApplied, setFilters, setCurrent)
          }
        >
          Filter Docs
        </Button>
        <Button
          onClick={() => handleChatbotSearch(searchText)}
          style={{ marginLeft: 8 }}
        >
          Ask Chatbot
        </Button>
        {isChatbotInitialized && (
          <Button
            onClick={() => setIsChatbotSidebarOpen(!isChatbotSidebarOpen)}
            style={{ marginLeft: 8 }}
          >
            {isChatbotSidebarOpen ? 'Close Chatbot' : 'Open Chatbot'}
          </Button>
        )}
      </div>
  
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
            }}
            bordered
            className="custom-table"
            scroll={{ x: isSidebarOpen ? 1500 : 1500, y: 'calc(100vh - 250px)' }}
            pagination={paginationConfig}
          />
        </div>
  
        {isChatbotSidebarOpen && (
        <div
          style={{
            width: 400,
            marginLeft: 20,
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#fff',
            zIndex: 1000,
            boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease-in-out',
            transform: isChatbotSidebarOpen ? 'translateX(0)' : 'translateX(100%)',
            overflowY: 'auto',
          }}
          onMouseEnter={() => {
            document.body.style.overflow = 'hidden';
          }}
          onMouseLeave={() => {
            document.body.style.overflow = 'auto';
          }}
        >
          {isChatbotLoading ? (
            <div style={{ padding: 20 }}>
              <p>Loading...</p>
            </div>
          ) : (
            <ChatbotResults
              searchResults={searchResults}
              llmResponse={llmResponse}
              onClose={() => setIsChatbotSidebarOpen(false)}
              documentCount={searchResults.length}
            />
          )}
        </div>
      )}
    </div>
  </div>
);
};

export default DocumentList;
