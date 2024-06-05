import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import './HelpSidebar.css';

const HelpSidebar: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="help-sidebar">
      <div className="help-sidebar-header">
        <h3>How to Use AI Policy Docs</h3>
        <CloseOutlined 
          onClick={onClose} 
          style={{ position: 'absolute', top: 20, right: 20, cursor: 'pointer' }} 
        />
      </div>
      <div className="help-sidebar-content">
        <p>Welcome to AI Policy Docs!</p>
        <p>This site allows you to track and filter documents related to AI policy across various regions.</p>
        <ul>
          <li>Use the <b>country tabs</b> to navigate different sections.</li>
          <li>Use the search bar and filters to refine your document search.</li>
          <li><b>Click on a document row</b> to expand and view more details.</li>
          <li>Use the <b>search assistant</b> to ask questions to entire collections the documents or get document summaries.</li>
        </ul>
        <h2>About</h2>
        <p>
          AI Policy Docs is a project aimed at monitoring and analyzing federal rulemaking related to artificial intelligence (AI). The project aggregates and filters relevant documents from various government sources.
        </p>
        <p>
            For now, it pulls from the <a href='https://federalregister.gov'>US Federal Register</a>. Hopefully soon it will also pull documents from the US Congress, UK, EU, and China.
        </p>
        
        <p>
            Is this tool useful to you? I'd love your feedback!
        </p>
        <p>
          Code available here: <a href="https://github.com/simonwisdom/ai-policy-docs" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
        </p>
      </div>
    </div>
  );
};

export default HelpSidebar;
