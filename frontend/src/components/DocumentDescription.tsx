import React from 'react';
import './FilterSection.css';

const DocumentDescription: React.FC<{ selectedTab: string }> = ({ selectedTab }) => {
  
  let description = '';

  switch (selectedTab) {
    case '1':
      description = 'AI-relevant documents from the US Federal Register, including the Executive branch and Federal agencies.';
      break;
    case '2':
      description = 'Showing documents from the US Congress (Coming Soon).';
      break;
    case '3':
      description = 'Showing documents from the UK (Coming Soon).';
      break;
    case '4':
      description = 'Showing documents from the EU (Coming Soon).';
      break;
    case '5':
      description = 'Showing documents from China (Coming Soon).';
      break;
    default:
      description = '';
  }

  return (
    <div className="document-description">
      {description}
    </div>
  );
};

export default DocumentDescription;