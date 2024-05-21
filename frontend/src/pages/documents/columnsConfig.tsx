import { ColumnsType } from 'antd/es/table';
import { Tooltip, Tag } from 'antd';
import { IDocument } from '../../interfaces';
import ExpandableText from '../../components/ExpandableText';
import FlatButton from '../../components/FlatButton';
import { handleAgencyFilterChange, handleTagFilterChange } from './utils';
import { format } from 'date-fns';

export const getColumns = (
  setSelectedAgency: (agency: string) => void,
  setSelectedTag: (tag: string) => void,
  setFilters: (filters: any[]) => void,
  expandRow: (rowKey: string) => void,
  expandedRowKeys: React.Key[],
  setCurrent: (page: number) => void, 
): ColumnsType<IDocument> => [
  {
    title: '',
    dataIndex: 'page_views_count',
    key: 'expand_and_icon',
    width: 50,
    render: (pageViewsCount: number, record: IDocument) => (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {pageViewsCount >= 3000 && (
          <Tooltip title={`This document has received a lot of attention! It has ${new Intl.NumberFormat().format(pageViewsCount)} page views.`} placement="right">
            <span role="img" aria-label="Popular" style={{ marginRight: '10px' }}>
              {pageViewsCount >= 30000 ? '🔥🔥' : '🔥'}
            </span>
          </Tooltip>
        )}
        {expandedRowKeys.includes(record.document_number) ? (
          <span onClick={() => expandRow(record.document_number)} style={{ cursor: 'pointer' }}>-</span>
        ) : (
          <span onClick={() => expandRow(record.document_number)} style={{ cursor: 'pointer' }}>+</span>
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
    render: (title: string, record: IDocument) => (
      <ExpandableText
        content={title}
        onClick={() => expandRow(record.document_number)}
        maxHeight={80}
      />
    ),
  },
  {
    title: 'Agency Names',
    width: 300,
    dataIndex: 'agency_names',
    key: 'agency_names',
    render: (agencyNames: string, record: IDocument) => (
      <div>
        {agencyNames.split(', ').map((agency, index) => (
          <Tag
            key={`${agency}-${index}`}
            onClick={(event) => {
              event.stopPropagation();
              handleAgencyFilterChange(agency, setSelectedAgency, setFilters, setCurrent);
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
    width: 150,
    dataIndex: 'publication_date',
    key: 'publication_date',
    defaultSortOrder: 'descend',
    sorter: (a: IDocument, b: IDocument) =>
      new Date(a.publication_date).getTime() - new Date(b.publication_date).getTime(),
    render: (date: string | Date) => format(new Date(date), 'MMMM d, yyyy'), // Example: May 6, 2024
  },
  // {
  //   title: 'Tags',
  //   width: 100,
  //   dataIndex: 'tags',
  //   key: 'tags',
  //   render: (tags: string[] | undefined, record: IDocument) => (
  //     <div>
  //       {Array.isArray(tags) && tags.map((tag, index) => (
  //         <Tag
  //           key={`${tag}-${index}`}
  //           onClick={(event) => {
  //             event.stopPropagation();
  //             handleTagFilterChange(tag, setSelectedTag, setFilters, setCurrent);
  //           }}
  //           style={{
  //             cursor: 'pointer',
  //             marginBottom: '4px',
  //             maxWidth: '250px',
  //             overflow: 'hidden',
  //             textOverflow: 'ellipsis',
  //             whiteSpace: 'normal',
  //             height: 'auto',
  //             display: 'inline-block',
  //             lineHeight: 'normal',
  //             padding: '4px'
  //           }}
  //         >
  //           {tag}
  //         </Tag>
  //       ))}
  //     </div>
  //   ),
  // },
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
          onClick={() => expandRow(record.document_number)}
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
      const formattedDate = format(commentsCloseOn, 'MMMM d, yyyy'); // Example: May 6, 2024

      return (
        <div>
          {formattedDate}
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
