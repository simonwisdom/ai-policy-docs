import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tag, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useTable } from '@refinedev/antd';
import { IDocument } from '../../interfaces';
import './list.css';
// import FilterTags from '../../components/FilterTags';
import ExpandedRowContent from '../../components/ExpandedRowContent';
import { getColumns } from './columnsConfig';
import { handleAgencyFilterChange } from './utils';

const FILTER_TAGS: string[] = ['Rule', 'Proposed Rule', 'Notice', 'Presidential Document', 'Open Comments'];

export const DocumentList: React.FC = () => {
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);

  const { tableProps, setFilters } = useTable<IDocument>({
    initialPageSize: 10,
  });

  const handleAgencyFilterChange = (agency: string): void => {
    setSelectedAgency(agency);
    setFilters([
      {
        field: 'agency_names',
        operator: 'contains',
        value: agency,
      },
    ]);
  };

  const handleClearFilters = (): void => {
    setActiveTypeFilter(null);
    setSelectedAgency(null);
    setFilters([], "replace"); // Use replace behavior to clear all filters
    console.log("Filters cleared"); // Debugging output
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

// list.tsx
const columns = useMemo(() => getColumns(setSelectedAgency, setFilters), [setSelectedAgency, setFilters]);

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
        expandedRowRender={(record: IDocument) => <ExpandedRowContent record={record} />}
        bordered
        className="custom-table"
        scroll={{ x: '100%', y: 'calc(100vh - 250px)' }}
      />
    </div>
  );
};

export default DocumentList;