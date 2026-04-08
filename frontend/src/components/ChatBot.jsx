import React, { useState, useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';
import { FaPaperPlane, FaSpinner, FaTimes } from 'react-icons/fa';
import { askQuestion } from '../utils/api';

const ChatBot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const lastProjectTitleRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Show welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = "Hello, I'm Syed Bakhtawar Abbas assistant. I'll give you a brief about his projects.";
      setMessages([{ text: welcomeMessage, isUser: false }]);
    }
  }, [isOpen]);

  // Scroll and focus when messages change
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // Reset messages when chat closes
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      lastProjectTitleRef.current = null;
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || loading) {
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setLoading(true);

    try {
      const historyForApi = messages
        .filter((m) => typeof m.text === 'string')
        .map((m) => ({
          role: m.isUser ? 'user' : 'assistant',
          content: m.text,
        }));
      const response = await askQuestion(userMessage, {
        lastProjectTitle: lastProjectTitleRef.current,
        history: historyForApi,
      });

      const rp = response.relevantProjects || [];
      if (rp.length > 0 && rp[0]?.title) {
        lastProjectTitleRef.current = rp[0].title;
      }

      setMessages((prev) => [
        ...prev,
        {
          text: response.answer,
          isUser: false,
          relevantProjects: rp,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { 
          text: 'Sorry, I encountered an error. Please make sure the backend server is running.', 
          isUser: false 
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="chatbot-backdrop" onClick={onClose}></div>
      
      {/* Chat Bot */}
      <div className="chatbot-container">
        <div className="chatbot-header">
          <div>
            <h3>Portfolio Chat Assistant</h3>
            <p>Ask me about my projects!</p>
          </div>
          <button className="chatbot-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <ChatBubble 
              key={index} 
              message={msg.text} 
              isUser={msg.isUser}
            />
          ))}

          {loading && (
            <div className="chat-bubble assistant-bubble">
              <div className="bubble-content">
                <div className="bubble-label">AI Assistant</div>
                <div className="bubble-text">
                  <FaSpinner className="spinner" /> Thinking...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chatbot-input-form">
          <input
            ref={inputRef}
            type="text"
            className="chatbot-input"
            placeholder="Ask about the portfolio..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="chatbot-send-btn"
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <FaSpinner className="spinner" />
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </form>
      </div>

      <style>{`
        .chatbot-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1040;
          animation: fadeIn 0.2s ease-in;
        }

        .chatbot-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 500px;
          height: 80vh;
          max-height: 700px;
          background: #1a1a1a;
          border: 1px solid rgba(0, 212, 255, 0.32);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55);
          z-index: 1050;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease-out;
          overflow: hidden;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }

        .chatbot-header {
          padding: 20px;
          background: linear-gradient(180deg, #1f1f1f 0%, #181818 100%);
          color: #f2f2f2;
          border-radius: 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid rgba(0, 212, 255, 0.38);
        }

        .chatbot-header h3 {
          margin: 0 0 5px 0;
          font-size: 1.5rem;
          color: #00d4ff;
        }

        .chatbot-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.9rem;
          color: white;
        }

        .chatbot-close-btn {
          background: rgba(0, 212, 255, 0.18);
          border: 2px solid #00d4ff;
          color: #00d4ff;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .chatbot-close-btn:hover {
          background: #00d4ff;
          color: #000000;
        }

        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #141414;
        }

        .welcome-message {
          text-align: center;
          padding: 30px 20px;
          color: rgba(155, 232, 255, 0.72);
        }

        .welcome-message ul {
          text-align: left;
          display: inline-block;
          margin-top: 15px;
        }

        .chat-bubble {
          margin-bottom: 15px;
          animation: fadeIn 0.3s ease-in;
        }

        .user-bubble {
          text-align: right;
        }

        .bubble-label-user {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(0, 212, 255, 0.55);
          margin-bottom: 6px;
          padding-right: 2px;
        }

        .user-bubble .bubble-content--user {
          display: inline-block;
          background: linear-gradient(195deg, #2c2820 0%, #221e18 100%);
          color: rgba(255, 250, 240, 0.96);
          padding: 14px 18px 14px 20px;
          border-radius: 18px 6px 18px 18px;
          max-width: 78%;
          min-width: 3rem;
          text-align: left;
          font-weight: 400;
          line-height: 1.5;
          letter-spacing: 0.02em;
          box-shadow: 0 6px 22px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 212, 255, 0.24);
          border-right: 3px solid #00d4ff;
        }

        .user-bubble .bubble-content--user .bubble-text-user {
          color: rgba(255, 252, 245, 0.96);
          font-size: 0.96rem;
        }

        .assistant-bubble {
          text-align: left;
        }

        .assistant-bubble .bubble-content {
          display: inline-block;
          background: linear-gradient(165deg, #2a2a2a 0%, #222 100%);
          color: rgba(245, 245, 245, 0.95);
          padding: 12px 18px;
          border-radius: 18px 18px 18px 4px;
          max-width: 92%;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-left: 3px solid #00d4ff;
        }

        .bubble-label {
          font-size: 0.85rem;
          opacity: 0.8;
          margin-bottom: 5px;
          font-weight: 600;
          color: #00d4ff;
        }

        .bubble-text {
          line-height: 1.5;
          font-size: 0.95rem;
          color: rgba(245, 245, 245, 0.92);
        }

        .bubble-text-user {
          white-space: pre-wrap;
        }

        .chatbot-input-form {
          padding: 15px 20px;
          background: #181818;
          border-top: 1px solid rgba(0, 212, 255, 0.32);
          border-radius: 0 0 20px 20px;
          display: flex;
          gap: 10px;
        }

        .chatbot-input {
          flex: 1;
          border-radius: 25px;
          border: 1px solid rgba(0, 212, 255, 0.3);
          padding: 12px 20px;
          font-size: 0.95rem;
          background: #242424;
          color: #f2f2f2;
        }

        .chatbot-input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }

        .chatbot-input:focus {
          border-color: #00d4ff;
          box-shadow: 0 0 0 0.2rem rgba(0, 212, 255, 0.25);
          outline: none;
        }

        .chatbot-send-btn {
          border-radius: 50%;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: none;
          background: #00d4ff;
          color: #000000;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
        }

        .chatbot-send-btn:hover:not(:disabled) {
          background: #00b8e0;
          transform: scale(1.05);
        }

        .chatbot-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chatbot-messages::-webkit-scrollbar-track {
          background: #1a1a1a;
        }

        .chatbot-messages::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.35);
          border-radius: 3px;
        }

        .chatbot-messages::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.5);
        }

        @media (max-width: 768px) {
          .chatbot-container {
            width: 95%;
            height: 85vh;
            max-height: 600px;
          }
        }
      `}</style>
    </>
  );
};

export default ChatBot;



