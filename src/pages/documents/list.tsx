import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tag, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useTable } from '@refinedev/antd';
import { IDocument } from '../../interfaces';
import ExpandableText from '../../components/ExpandableText';
import FlatButton from '../../components/FlatButton';
import './list.css';

const FILTER_TAGS: string[] = ['Rule', 'Proposed Rule', 'Notice', 'Presidential Document', 'Open Comments'];

export const DocumentList: React.FC = () => {
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const { tableProps, setFilters } = useTable<IDocument>({
    initialPageSize: 10,
  });

  const handleClearFilters = (): void => {
    setActiveTypeFilter(null);
    setFilters([], "replace");  // Use replace behavior to clear all filters
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

  const expandedRowRender = (record: IDocument): JSX.Element => {
    return (
      <div>
        {record.document_number && <p><strong>Document Number:</strong> {record.document_number}</p>}
        {record.abstract && <p><strong>Abstract:</strong> {record.abstract}</p>}
        {record.llm_summary && <p><strong>LLM Summary:</strong> {record.llm_summary}</p>}
        {record.llm_summary_full && <p><strong>LLM Summary Full:</strong> {record.llm_summary_full}</p>}
        {record.dates && <p><strong>Dates:</strong> {record.dates}</p>}
        {record.html_url && <p><strong>Federal Register Link:</strong> <a href={record.html_url} target="_blank" rel="noopener noreferrer">View official release</a></p>}
        {record.regulations_dot_gov_comments_url && <p><strong>Regulations.gov Link:</strong> <a href={record.regulations_dot_gov_comments_url} target="_blank" rel="noopener noreferrer">Document details</a></p>}
        {record.effective_on && <p><strong>Effective On:</strong> {record.effective_on}</p>}
      </div>
    );
  };
  

  const columns: ColumnsType<IDocument> = useMemo(() => [
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
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      ellipsis: true,
      render: (title: string) => {
        // Logic to find the first punctuation
        const firstPunctuationIndex = title.search(/[,;.]/);
        let truncatedTitle = title;
        if (firstPunctuationIndex !== -1) {
          truncatedTitle = title.substring(0, firstPunctuationIndex + 1) + '...';
        }
        return (
          <ExpandableText content={truncatedTitle} title={title} maxLength={40} />
        );
      },
    },
      {
        title: 'Agency Names',
        dataIndex: 'agency_names',
        key: 'agency_names',
    },
    {
      title: 'Publication Date',
      dataIndex: 'publication_date',
      key: 'publication_date',
      defaultSortOrder: 'descend',
      sorter: (a: IDocument, b: IDocument) => new Date(a.publication_date).getTime() - new Date(b.publication_date).getTime(),
    },
    {
      title: 'LLM Summary',
      dataIndex: 'llm_summary',
      key: 'llm_summary',
      width: 300,
      render: (text: string): JSX.Element => {
        return (
            <ExpandableText content={text} maxLength={30} title={text}> 
                {text} 
            </ExpandableText>
        );
      },
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
  ], []);

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
        <div style={{ marginBottom: 20 }}>
          Total Documents: {tableProps.dataSource?.length || 0}
        </div>
      </div>
      <Table
        {...tableProps}
        rowKey="id"
        columns={columns}
        expandedRowRender={expandedRowRender}
        bordered
        className="custom-table"
        scroll={{ x: '100%', y: 'calc(100vh - 250px)' }}
      />
    </div>
  );
};

export default DocumentList;
