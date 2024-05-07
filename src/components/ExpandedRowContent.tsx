import React from 'react';
import { IDocument } from '../interfaces';

interface ExpandedRowContentProps {
  record: IDocument;
}

const ExpandedRowContent: React.FC<ExpandedRowContentProps> = ({ record }) => {
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

export default ExpandedRowContent;