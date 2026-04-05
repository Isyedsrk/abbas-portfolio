import React from 'react';
import AssistantMessageContent from './AssistantMessageContent';

const ChatBubble = ({ message, isUser }) => {
  return (
    <div className={`chat-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
      {isUser ? (
        <>
          <div className="bubble-label-user">You</div>
          <div className="bubble-content bubble-content--user">
            <div className={`bubble-text bubble-text-user`}>{message}</div>
          </div>
        </>
      ) : (
        <div className="bubble-content">
          <div className="bubble-label">AI Assistant</div>
          <div className="bubble-text">
            <AssistantMessageContent text={message} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;



