import React from 'react';
import '../styles.css';

export const About: React.FC = () => {
  return (
    <div className="about-page">
      <h1>About AI Policy Docs</h1>
      <p>
        AI Policy Docs is a project aimed at monitoring and analyzing federal rulemaking related to artificial intelligence (AI) and its potential impact on AI extinction risk. The project aggregates and filters relevant documents from various government sources, including federalregister.gov, and COMING SOON: reginfo.gov, regulations.gov, and congress.gov.
      </p>
      
      <h2>Project Goals</h2>
      <ul>
        <li>Identify and track proposed rules and public comment periods relevant to AI governance.</li>
        <li>Gain insights into the types of rules being proposed and determine specific goals to pursue.</li>
      </ul>
      
      <h2>Current Features</h2>
      <ul>
        <li>Backend service that aggregates and filters AI governance-related documents from federal sources.</li>
        <li>Frontend interface for browsing, searching, and filtering documents.</li>
        <li>List of documents currently open for public comment.</li>
      </ul>
      
      <h2>Planned Features</h2>
      <ul>
        <li>Analysis of comments on closed documents, including submitting organizations and sentiment analysis.</li>
        <li>Display of comments on relevant AI documents.</li>
        <li>Email subscription or RSS feed for updates on new relevant documents.</li>
      </ul>
      
      <p>
        Code available here: <a href="https://github.com/simonwisdom/ai-policy-docs" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
      </p>
    </div>
  );
};