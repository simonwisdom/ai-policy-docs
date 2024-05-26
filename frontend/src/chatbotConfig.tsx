import { createChatBotMessage } from 'react-chatbot-kit';
import React from 'react';
import parse from 'html-react-parser';
import SearchResults from './components/SearchResults';


const config = {
    botName: 'Chatbot',
    initialMessages: [createChatBotMessage('Hi! How can I help you?', { delay: 500 })],
    customStyles: {
        botMessageBox: {
            backgroundColor: '#376B7E',
        },
        chatButton: {
            backgroundColor: '#376B7E',
        },
        chatContainer: {
            width: '100%',
            height: '80vh',
        },
    },
    customComponents: {
        header: () => (
            <div style={{ backgroundColor: '#376B7E', padding: '10px', borderRadius: '3px', color: 'white' }}>
                Chatbot
            </div>
        ),
        botMessage: ({ message, actions }) => {
          const { searchResults, llmResponse } = actions.state;
    
          return (
            <div className="react-chatbot-kit-chat-bot-message">
              {searchResults && llmResponse ? (
                <SearchResults searchResults={searchResults} llmResponse={llmResponse} />
              ) : (
                <span>{message.message}</span>
              )}
            </div>
          );
        },
      },
};

export default config;
