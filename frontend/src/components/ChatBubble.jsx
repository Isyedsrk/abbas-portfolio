import React from 'react';

const ChatBubble = ({ message, isUser }) => {
  return (
    <div className={`chat-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
      <div className="bubble-content">
        {!isUser && <div className="bubble-label">AI Assistant</div>}
        <div className="bubble-text">{message}</div>
      </div>
    </div>
  );
};

export default ChatBubble;



