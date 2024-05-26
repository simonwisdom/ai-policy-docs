// SearchResults.tsx
import React from 'react';

interface SearchResultsProps {
  searchResults: any[];
  llmResponse: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ searchResults, llmResponse }) => {
  return (
    <div>
      <p>{llmResponse}</p>
      <ul>
        {searchResults.map((result, index) => (
          <li key={index}>
            <a href={result.html_url} target="_blank" rel="noopener noreferrer">
              {result.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResults;