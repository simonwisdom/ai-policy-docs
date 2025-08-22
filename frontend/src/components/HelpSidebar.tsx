import React, { useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import './HelpSidebar.css';

const HelpSidebar: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitStatus, setSubmitStatus] = useState('');
  
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
      
        const backendUrl = import.meta.env.MODE === 'production'
          ? `${import.meta.env.VITE_BACKEND_URL_PROD || 'https://ai-policy-docs-production.up.railway.app'}/api/contact`
          : `${import.meta.env.VITE_BACKEND_URL_DEV || 'http://localhost:3001'}/api/contact`;
      
        try {
          const response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message }),
          });
  
        if (response.ok) {
          setName('');
          setEmail('');
          setMessage('');
          setSubmitStatus('success');
        } else {
          setSubmitStatus('error');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        setSubmitStatus('error');
      }
    };

  return (
    <div className="help-sidebar">
      <div className="help-sidebar-header">
        <h3>Welcome to AI Policy Docs!</h3>
        <CloseOutlined
          onClick={onClose}
          style={{ position: 'absolute', top: 20, right: 20, cursor: 'pointer' }}
        />
      </div>
      <div className="help-sidebar-content">
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
        
        <h2>Feedback</h2>
        Is this tool useful to you? Something missing? I'd love to hear from you!
        <form className="feedback-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
          <button type="submit">Send</button>
        </form>
        {submitStatus === 'success' && <p className="status-message success-message">Message sent successfully!</p>}
  {submitStatus === 'error' && <p className="status-message error-message">Error sending message. Please try again.</p>}

        <br></br>
        <p>
          Code available here: <a href="https://github.com/simonwisdom/ai-policy-docs" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
        </p>
      </div>
    </div>
  );
};

export default HelpSidebar;
