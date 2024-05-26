import React from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from '../chatbotConfig';
import MessageParser from '../MessageParser';
import ActionProvider from '../ActionProvider';

const ChatbotPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <div style={{ width: '100%', maxWidth: '800px', height: '80vh', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '10px', overflow: 'hidden' }}>
        <Chatbot
          config={config}
          messageParser={MessageParser}
          actionProvider={ActionProvider}
          placeholderText="Type a message..."
        />
      </div>
    </div>
  );
};

export default ChatbotPage;