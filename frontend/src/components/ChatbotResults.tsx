import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatbotResultsProps {
  searchResults: { 
    html_url: string; 
    title: string; 
    document_number: string;
    publication_date: string;
    page_views_count: string;
  }[];
  llmResponse: string;
  onClose: () => void;
  documentCount: number;
}

const ChatbotResults: React.FC<ChatbotResultsProps> = ({
  searchResults,
  llmResponse,
  onClose,
  documentCount,
}) => {
  const [showDocuments, setShowDocuments] = useState(false);

  const toggleDocuments = () => {
    setShowDocuments(!showDocuments);
  };

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h3>Chatbot Results</h3>
        <button onClick={onClose}>Close</button>
      </div>
      <ReactMarkdown>{llmResponse}</ReactMarkdown>

      <p>Top Related Documents: {documentCount}</p>
      <button
        onClick={toggleDocuments}
        style={{
          background: '#f0f0f0',
          border: 'none',
          padding: '8px 16px',
          cursor: 'pointer',
        }}
      >
        {showDocuments ? 'Hide Documents' : 'Show Documents'}
      </button>

      {showDocuments && (
        <ul style={{ padding: 0, listStyleType: 'none' }}>
          {searchResults.map((result, index) => (
            <li key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <a href={result.html_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', fontWeight: 'bold', color: '#007bff' }}>
                {result.title}
              </a>
              <div style={{ marginTop: '5px' }}>
                <small>
                  <strong>Document Number:</strong> {result.document_number}<br />
                  <strong>Publication Date:</strong> {result.publication_date}<br />
                  <strong>Page Views:</strong> {result.page_views_count}
                </small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatbotResults;
