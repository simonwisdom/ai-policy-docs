import { ColumnsType } from 'antd/es/table';
import { IDocument } from '../../interfaces';
import ExpandableText from '../../components/ExpandableText';
import FlatButton from '../../components/FlatButton';
import { Tag } from 'antd';
import { handleAgencyFilterChange } from './utils';

export const getColumns = (setSelectedAgency: (agency: string) => void, setFilters: (filters: any[]) => void): ColumnsType<IDocument> => [
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
    render: (title: string) => {
      const firstPunctuationIndex = title.search(/[,;]/);
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
    width: 300,
    dataIndex: 'agency_names',
    key: 'agency_names',
    render: (agencyNames: string, record: IDocument) => (
      <div>
        {agencyNames.split(', ').map((agency) => (
          <Tag
            key={agency}
            onClick={() => handleAgencyFilterChange(agency, setSelectedAgency, setFilters)}
            style={{ 
              cursor: 'pointer',
              marginBottom: '4px',
              maxWidth: '250px', // Set a maximum width to fit within the column
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'normal', // Allow wrapping
              height: 'auto', // Adjust height automatically to fit content
              display: 'inline-block', // Keep inline behavior but allow block properties
              lineHeight: 'normal', 
              padding: '4px' // Ensure padding does not cut off text
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
    title: 'LLM Summary',
    dataIndex: 'llm_summary',
    key: 'llm_summary',
    width: 400,
    render: (text: string): JSX.Element => {
      return <ExpandableText content={text} maxLength={50} title={text} />;
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
];