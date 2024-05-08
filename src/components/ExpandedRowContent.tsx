import React from 'react';
import { IDocument } from '../interfaces';

interface ExpandedRowContentProps {
  record: IDocument;
}

const ExpandedRowContent: React.FC<ExpandedRowContentProps> = ({ record }) => {
  // Helper function to convert LLM summary text to bullet points
  const renderBulletPoints = (summary: string) => {
    return (
      <ul>
        {summary.split('*').map((item, index) => {
          const trimmedItem = item.trim();
          if (trimmedItem) {
            return <li key={index}>{trimmedItem}</li>;
          }
          return null;
        })}
      </ul>
    );
  };
    return (
    <div>
      {record.title && <p><strong>Title:</strong> {record.title}</p>}
      {record.document_number && <p><strong>Document Number:</strong> {record.document_number}</p>}
      {record.llm_summary && (
          <div>
          <strong>LLM Summary:</strong>
          {renderBulletPoints(record.llm_summary)}
        </div>
      )}
      {record.abstract && <p><strong>Official abstract:</strong> {record.abstract}</p>}
      {record.llm_summary_full && <p><strong>LLM Summary Full:</strong> {record.llm_summary_full}</p>}
      {record.dates && <p><strong>Dates:</strong> {record.dates}</p>}
      {record.html_url && <p><strong>Federal Register Link:</strong> <a href={record.html_url} target="_blank" rel="noopener noreferrer">View official release</a></p>}
      {record.regulations_dot_gov_comments_url && <p><strong>Regulations.gov Link:</strong> <a href={record.regulations_dot_gov_comments_url} target="_blank" rel="noopener noreferrer">Document details</a></p>}
      {record.effective_on && <p><strong>Effective On:</strong> {record.effective_on}</p>}
    </div>
  );
};

export default ExpandedRowContent;