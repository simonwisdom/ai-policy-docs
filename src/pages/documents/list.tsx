import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Table, Tag, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useTable } from '@refinedev/antd';
import { IDocument } from '../../interfaces';
import './list.css';
import ExpandedRowContent from '../../components/ExpandedRowContent';
import { getColumns } from './columnsConfig';
import { handleAgencyFilterChange } from './utils';

const FILTER_TAGS: string[] = ['Rule', 'Proposed Rule', 'Notice', 'Presidential Document', 'Open Comments'];

export const DocumentList: React.FC = () => {
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [current, setCurrent] = useState(1);  // Current page state
  const pageSizeRef = useRef(10); // Reference for page size

  const { tableProps, setFilters } = useTable<IDocument>({
    initialPageSize: pageSizeRef.current,
  });

  const expandRow = (rowKey: React.Key) => {
    if (expandedRowKeys.includes(rowKey)) {
      setExpandedRowKeys(expandedRowKeys.filter((key) => key !== rowKey));
    } else {
      setExpandedRowKeys([...expandedRowKeys, rowKey]);
    }
  };

  const handleAgencyFilterChange = (agency: string): void => {
    setSelectedAgency(agency);
    setCurrent(1); // Reset to the first page on agency change

    const filterConfig = {
      field: 'agency_names',
      operator: 'contains',
      value: agency,
    };

    const settings = {
      filters: [filterConfig],
      pagination: {
        current: 1,
        pageSize: pageSizeRef.current,  // Use the current page size
      }
    };

    setFilters(settings as any);
  };
  

  const handleClearFilters = (): void => {
    setActiveTypeFilter(null);
    setSelectedAgency(null);
    setFilters([], "replace");
  };

  const handleFilterChange = (type: string | null): void => {
    setActiveTypeFilter(type);
    if (type === 'Open Comments') {
      const currentDate = new Date();
      setFilters([{
        field: 'comments_close_on',
        operator: 'gt',
        value: currentDate.toISOString(),
      }]);
    } else if (type === null) {
      setFilters([]);
    } else {
      setFilters([{
        field: 'type',
        operator: 'eq',
        value: type,
      }]);
    }
    console.log("Filter set for:", type); // Debugging output
  };

  const columns = getColumns(setSelectedAgency, setSelectedTag, setFilters, expandRow, expandedRowKeys);

  return (
    <div>
      <div className="filter-tags">
        {FILTER_TAGS.map((type: string) => (
          <Tag
            color={activeTypeFilter === type ? 'blue' : 'default'}
            onClick={() => handleFilterChange(type)}
            key={type}
          >
            {type}
          </Tag>
        ))}
        <Tag onClick={handleClearFilters}>
          Clear Filter
        </Tag>
        {selectedAgency && (
          <Tag onClick={() => handleAgencyFilterChange("")}>
            Agency: {selectedAgency}
          </Tag>
        )}
        <div style={{ marginBottom: 20 }}>
          Total Documents: {tableProps.dataSource?.length || 0}
        </div>
      </div>
      <Table
        {...tableProps}
        rowKey="id"
        columns={columns}
        onRow={(record, rowIndex) => {
          return {
            onClick: event => { // Toggle expand on row click instead of using a separate column
              const currentExpandedRows = [...expandedRowKeys];
              const recordId = record.id.toString();
              const currentIndex = currentExpandedRows.indexOf(recordId);
              if (currentIndex === -1) {
                setExpandedRowKeys([...currentExpandedRows, recordId]);
              } else {
                setExpandedRowKeys(currentExpandedRows.filter(id => id !== recordId));
              }
            },
          };
        }}
        expandable={{
          expandedRowRender: (record: IDocument) => <ExpandedRowContent record={record} />,
          expandedRowKeys: expandedRowKeys,
          expandIcon: () => null,
          columnWidth: '0px', // Set width to 0 if not already removed by expandIcon: () => null
        }}
        bordered
        className="custom-table"
        scroll={{ x: '100%', y: 'calc(100vh - 250px)' }}
      />

    </div>
  );
};

export default DocumentList;