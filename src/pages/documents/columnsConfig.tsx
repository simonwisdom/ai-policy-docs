import { ColumnsType } from 'antd/es/table';
import { Tooltip } from 'antd';
import { IDocument } from '../../interfaces';
import ExpandableText from '../../components/ExpandableText';
import FlatButton from '../../components/FlatButton';
import { Tag } from 'antd';
import { handleAgencyFilterChange, handleTagFilterChange } from './utils';

export const getColumns = (
  setSelectedAgency: (agency: string) => void,
  setSelectedTag: (tag: string) => void,
  setFilters: (filters: any[]) => void,
  expandRow: (rowKey: string) => void,
  expandedRowKeys: React.Key[]
): ColumnsType<IDocument> => [
  {
    title: '',
    dataIndex: 'page_views_count',
    key: 'expand_and_icon',
    width: 50,
    render: (pageViewsCount: number, record: IDocument) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {pageViewsCount > 5000 && (
          <Tooltip title="This document has more than 5000 page views" placement="right">
            <span role="img" aria-label="Popular" style={{ marginRight: '10px' }}>🔥</span>
          </Tooltip>
        )}
        {expandedRowKeys.includes(record.id) ? (
          <span onClick={() => expandRow(record.id)} style={{ cursor: 'pointer' }}>-</span>
        ) : (
          <span onClick={() => expandRow(record.id)} style={{ cursor: 'pointer' }}>+</span>
        )}
      </div>
    ),
  },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    width: 150,
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
    width: 200,
    ellipsis: true,
    render: (title: string, record: IDocument) => {
      const firstPunctuationIndex = title.search(/[,;]/);
      let truncatedTitle = title;
      if (firstPunctuationIndex !== -1) {
        truncatedTitle = title.substring(0, firstPunctuationIndex + 1) + '...';
      }
      return (
        <ExpandableText 
        content={title}
        onClick={() => expandRow(record.id)}
        maxHeight={80}
        />
        // <ExpandableText content={title} title={title} maxLength={40} />
      );
    },
  },
  {
    title: 'Agency Names',
    width: 300,
    dataIndex: 'agency_names',
    key: 'agency_names',
    render: (agencyNames: string, record: IDocument) => (
      <div>
        {agencyNames.split(', ').map((agency) => (
          <Tag
            key={agency}
            onClick={(event) => {
              event.stopPropagation();
              handleAgencyFilterChange(agency, setSelectedAgency, setFilters); // Remove the pagination onChange argument
            }}
            style={{
              cursor: 'pointer',
              marginBottom: '4px',
              maxWidth: '250px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'normal',
              height: 'auto',
              display: 'inline-block',
              lineHeight: 'normal',
              padding: '4px'
            }}
          >
            {agency}
          </Tag>
        ))}
      </div>
    ),
  },
  {
    title: 'Publication Date',
    width: 120,
    dataIndex: 'publication_date',
    key: 'publication_date',
    defaultSortOrder: 'descend',
    sorter: (a: IDocument, b: IDocument) =>
      new Date(a.publication_date).getTime() - new Date(b.publication_date).getTime(),
  },
  {
    title: 'Tags',
    width: 100,
    dataIndex: 'tags',
    key: 'tags',
    render: (tags: string[], record: IDocument) => (
      <div>
        {tags?.map((tag) => (
          <Tag
            key={tag}
            onClick={() => handleTagFilterChange(tag, setSelectedTag, setFilters)}
            style={{
              cursor: 'pointer',
              marginBottom: '4px',
              maxWidth: '250px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'normal',
              height: 'auto',
              display: 'inline-block',
              lineHeight: 'normal',
              padding: '4px'
            }}
          >
            {tag}
          </Tag>
        ))}
      </div>
    ),
  },
  {
    title: 'LLM Summary',
    dataIndex: 'llm_summary',
    key: 'llm_summary',
    width: 400,
    render: (text: string, record: IDocument): JSX.Element => {
      if (!text) {
        return <div style={{ minHeight: '24px' }}>—</div>;
      }
  
      // Formatting the text to handle Markdown-like inputs and display them as HTML
      const formattedText = text.replace(/\\\*/g, '*').replace(/\n/g, '<br>');
      return (
        <ExpandableText
          content={formattedText}
          onClick={() => expandRow(record.id)}
          maxHeight={100}
        />
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
              <FlatButton onClick={() => window.open(record.regulations_dot_gov_comments_url, '_blank')}>
                Submit Comment!
              </FlatButton>
            </div>
          )}
        </div>
      );
    },
  },
];