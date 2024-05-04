import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tag } from "antd";
import { useTable } from "@refinedev/antd";
import { IDocument } from "../../interfaces";
import ExpandableText from '../../components/ExpandableText';
import FlatButton from '../../components/FlatButton';
import "./list.css";

const FILTER_TAGS = ['Rule', 'Proposed Rule', 'Notice', 'Presidential Document', 'Open Comments'];

export const DocumentList = () => {
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const { tableProps, setFilters } = useTable<IDocument>({
    initialPageSize: 10,
  });
  // const [tableKey, setTableKey] = useState(0);

  const handleClearFilters = () => {
    setActiveTypeFilter(null);
    setFilters([], "replace");  // Explicitly use the replace behavior to clear all filters
    console.log("Filters cleared"); // Debugging output
  };  

  const handleFilterChange = (type: string | null) => {
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

  

  const columns = useMemo(() => [
    // {
    //   title: '',
    //   dataIndex: 'comments_close_on',
    //   key: 'row_highlight',
    //   render: (text: string, record: IDocument) => {
    //     const currentDate = new Date();
    //     const commentsCloseOn = new Date(record.comments_close_on);
    //     return commentsCloseOn > currentDate ? 'open-comments' : '';
    //   },
    // },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 300, // Set a minimum width
      ellipsis: true, // Handle text overflow
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
      defaultSortOrder: 'descend',
      sorter: (a: IDocument, b: IDocument) => new Date(a.publication_date).getTime() - new Date(b.publication_date).getTime(),
    },
    {
      title: 'Document Number',
      dataIndex: 'document_number',
      key: 'document_number',
    },
    // {
    //   title: 'Docket ID',
    //   dataIndex: 'docket_id',
    //   key: 'docket_id',
    // },
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
    // {
    //   title: 'Page Views',
    //   dataIndex: 'page_views',
    //   key: 'page_views',
    // },
    {
      title: 'Federal Register Link',
      dataIndex: 'html_url',
      key: 'html_url',
      render: (text: string) => text ? <a href={text} target="_blank" rel="noopener noreferrer">View official release</a> : null,
    },
    {
      title: 'Regulations.gov Link',
      dataIndex: 'regulations_dot_gov_comments_url',
      key: 'regulations_dot_gov_comments_url',
      render: (text: string) => text ? <a href={text} target="_blank" rel="noopener noreferrer">Document details</a> : null,
    },
    {
      title: 'Effective On',
      dataIndex: 'effective_on',
      key: 'effective_on',
    },
    {
      title: 'Comments Close On',
      dataIndex: 'comments_close_on',
      key: 'comments_close_on',
      render: (text: string, record: IDocument) => {
        if (!text) {
          return <div style={{ minHeight: '24px' }}>—</div>;
        }
    
        const currentDate = new Date();
        const commentsCloseOn = new Date(text);
        if (isNaN(commentsCloseOn.getTime())) {
          console.error("Invalid date:", text);
          return <div>Invalid closing date</div>;
        }
    
        const shouldShowCommentButton = commentsCloseOn > currentDate;
    
        return (
          <div>
            {text}
            {shouldShowCommentButton && (
              <div style={{ marginTop: '4px' }}>
                <FlatButton onClick={() => window.open(record.comment_url, '_blank')}>
                  Submit Comment!
                </FlatButton>
              </div>
            )}
          </div>
        );
      },
    },
    
    // {
    //   title: 'Comments Count',
    //   dataIndex: 'comments_count',
    //   key: 'comments_count',
    // },
  ], []);

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
          onClick={handleClearFilters}
          color={activeTypeFilter ? 'blue' : 'default'} // Highlight if filter is active
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
        scroll={{ x: '100%', y: 'calc(100vh - 250px)' }}
        rowClassName={(record: IDocument) => {
          const currentDate = new Date();
          const commentsCloseOn = new Date(record.comments_close_on);
          return commentsCloseOn > currentDate ? 'open-comments' : '';
        }}
      />
    </div>
  );
};