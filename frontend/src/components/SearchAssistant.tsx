import React, { useState } from 'react';
import { Input, Button, Checkbox } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import ChatbotResults from './ChatbotResults';

interface SearchAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchResults: (results: any[], response: string) => void;
  searchResults: any[];
  llmResponse: string;
}

const SearchAssistant: React.FC<SearchAssistantProps> = ({
  isOpen,
  onClose,
  onSearchResults,
  searchResults,
  llmResponse,
}) => {
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocumentSources, setSelectedDocumentSources] = useState<string[]>(['US Executive']);

  const handleSearch = async () => {
    if (searchText.trim() === '') {
      return;
    }

    setIsLoading(true);

    try {
      const backendUrl = import.meta.env.MODE === 'production'
        ? `${import.meta.env.VITE_BACKEND_URL_PROD || 'https://ai-policy-docs-production.up.railway.app'}/api/algolia_search?query=${encodeURIComponent(searchText)}`
        : `${import.meta.env.VITE_BACKEND_URL_DEV || 'http://localhost:3001'}/api/algolia_search?query=${encodeURIComponent(searchText)}`;

      const response = await fetch(backendUrl);

      setIsLoading(false);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const parsedResponse = await response.json();

      if (parsedResponse.llmResponse && parsedResponse.searchResults) {
        onSearchResults(parsedResponse.searchResults, parsedResponse.llmResponse);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setIsLoading(false);
    }
  };

  const handleDocumentSourceChange = (checkedValues: any[]) => {
    setSelectedDocumentSources(checkedValues);
  };

  return (
    <div className={`search-assistant ${isOpen ? 'open' : 'closed'}`}>
      <div style={{ padding: 20, position: 'relative' }}>
        <h2>Search Assistant</h2>
        <CloseOutlined 
          onClick={onClose} 
          style={{ position: 'absolute', top: 20, right: 20, cursor: 'pointer' }} 
        />
        <p>The search assistant answers natural language questions and returns results referencing specific documents in the database.</p>
        <Checkbox.Group
          options={[
            { label: 'US Executive', value: 'US Executive' },
            { label: 'US Legislative', value: 'US Legislative', disabled: true },
            { label: 'UK', value: 'UK', disabled: true },
            { label: 'EU', value: 'EU', disabled: true },
            { label: 'China', value: 'China', disabled: true },
          ]}
          value={selectedDocumentSources}
          onChange={handleDocumentSourceChange}
        />
        <Input
          placeholder="Ask a question..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      {isLoading ? (
        <div style={{ padding: 20 }}>
          <p>Loading...</p>
        </div>
      ) : (
        <ChatbotResults
          searchResults={searchResults}
          llmResponse={llmResponse}
          onClose={onClose}
          documentCount={searchResults.length}
        />
      )}
    </div>
  );
};

export default SearchAssistant;
