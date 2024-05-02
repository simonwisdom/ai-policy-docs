import React, { useState, useEffect, useMemo } from 'react';
import { List, useTable, EditButton, ShowButton, DeleteButton } from "@refinedev/antd";
import { Table, Space, Typography, Button, Tag } from "antd";
import { IDocument } from "../../interfaces";
import ExpandableText from '../../components/ExpandableText';
import "./list.css";

const FILTER_TAGS = ['Rule', 'Proposed Rule', 'Notice', 'Presidential Document'];

export const DocumentList = () => {
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);

  const { tableProps, sorter, setSorter } = useTable<IDocument>({
    initialPageSize: 10,
    initialSorter: [
      {
        field: 'publication_date',
        order: 'desc',
      },
    ],
    permanentFilter: [
      {
        field: 'type',
        operator: 'eq',
        value: activeTypeFilter,
      },
    ],
    hasPagination: false, // Disable pagination
  });

  const handleFilterChange = (type: string | null) => {
    // console.log('handleFilterChange called with type:', type);
    setActiveTypeFilter(type);
  };


  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <span className={`type-tag ${type.toLowerCase().replace(' ', '-')}`}>
          {type}
        </span>
      ),
    },
    {
      title: 'Publication Date',
      dataIndex: 'publication_date',
      key: 'publication_date',
      defaultSortOrder: 'descend', // Indicates default sorting should be descending
      sorter: (a: IDocument, b: IDocument) => new Date(a.publication_date).getTime() - new Date(b.publication_date).getTime(),
    },
    {
      title: 'Document Number',
      dataIndex: 'document_number',
      key: 'document_number',
    },
    {
      title: 'Agency Names',
      dataIndex: 'agency_names',
      key: 'agency_names',
    },
    {
      title: 'Abstract',
      dataIndex: 'abstract',
      key: 'abstract',
      render: (text: string) => <ExpandableText text={text} />,
    },
    {
      title: 'LLM Summary',
      dataIndex: 'llm_summary',
      key: 'llm_summary',
      render: (text: string) => <ExpandableText text={text} />,
    },
    {
      title: 'LLM Summary Full',
      dataIndex: 'llm_summary_full',
      key: 'llm_summary_full',
      render: (text: string) => <ExpandableText text={text} />,
    },
    {
      title: 'Dates',
      dataIndex: 'dates',
      key: 'dates',
      render: (text: string) => <ExpandableText text={text} />,
    },
    {
      title: 'Docket ID',
      dataIndex: 'docket_id',
      key: 'docket_id',
    },
    {
      title: 'Page Views',
      dataIndex: 'page_views',
      key: 'page_views',
    },
    {
      title: 'Raw Text URL',
      dataIndex: 'raw_text_url',
      key: 'raw_text_url',
      render: (text: string) => text ? <a href={text} target="_blank" rel="noopener noreferrer">View Raw Text</a> : null,
    },
    {
      title: 'Comments URL',
      dataIndex: 'comments_url',
      key: 'comments_url',
      render: (text: string) => text ? <a href={text} target="_blank" rel="noopener noreferrer">Comment</a> : null,
    },
    {
      title: 'Comments Count',
      dataIndex: 'comments_count',
      key: 'comments_count',
    },
  ];

  // console.log('tableProps.filters:', tableProps.filters);
  // console.log('activeTypeFilter:', activeTypeFilter);

  return (
    <div>
      <div className="filter-tags">
        {FILTER_TAGS.map(type => (
          <Tag
            color={activeTypeFilter === type ? 'blue' : 'default'}
            onClick={() => handleFilterChange(type)} 
            key={type}
          >
            {type}
          </Tag>
        ))}
        <Tag
          onClick={() => handleFilterChange(null)}
          color={activeTypeFilter === null ? 'blue' : 'default'}
        >
          Clear Filter  
        </Tag>
      </div>
      <Table
        {...tableProps}
        rowKey="id"
        columns={columns}
        bordered
        className="custom-table"
        sticky={{ offsetHeader: 0 }}
        // scroll={{ y: 'calc(100vh - 250px)' }}
      />
    </div>
  );
};