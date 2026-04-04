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
      const response = await askQuestion(
        userMessage,
        lastProjectTitleRef.current
      );

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
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          z-index: 1050;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease-out;
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
          background: #000000;
          color: white;
          border-radius: 20px 20px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #ffc107;
        }

        .chatbot-header h3 {
          margin: 0 0 5px 0;
          font-size: 1.5rem;
          color: #ffc107;
        }

        .chatbot-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.9rem;
          color: white;
        }

        .chatbot-close-btn {
          background: rgba(255, 193, 7, 0.2);
          border: 2px solid #ffc107;
          color: #ffc107;
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
          background: #ffc107;
          color: #000000;
        }

        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #ffffff;
        }

        .welcome-message {
          text-align: center;
          padding: 30px 20px;
          color: #6c757d;
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

        .user-bubble .bubble-content {
          display: inline-block;
          background: #ffc107;
          color: #000000;
          padding: 12px 18px;
          border-radius: 18px 18px 4px 18px;
          max-width: 75%;
          text-align: left;
          font-weight: 500;
        }

        .assistant-bubble {
          text-align: left;
        }

        .assistant-bubble .bubble-content {
          display: inline-block;
          background: #ffffff;
          color: #000000;
          padding: 12px 18px;
          border-radius: 18px 18px 18px 4px;
          max-width: 75%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-left: 3px solid #ffc107;
        }

        .bubble-label {
          font-size: 0.85rem;
          opacity: 0.8;
          margin-bottom: 5px;
          font-weight: 600;
          color: #ffc107;
        }

        .bubble-text {
          line-height: 1.5;
          font-size: 0.95rem;
          white-space: pre-wrap;
        }

        .chatbot-input-form {
          padding: 15px 20px;
          background: #ffffff;
          border-top: 2px solid #ffc107;
          border-radius: 0 0 20px 20px;
          display: flex;
          gap: 10px;
        }

        .chatbot-input {
          flex: 1;
          border-radius: 25px;
          border: 2px solid #000000;
          padding: 12px 20px;
          font-size: 0.95rem;
          background: #ffffff;
          color: #000000;
        }

        .chatbot-input:focus {
          border-color: #ffc107;
          box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.25);
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
          background: #ffc107;
          color: #000000;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
        }

        .chatbot-send-btn:hover:not(:disabled) {
          background: #ffb300;
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
          background: #f1f1f1;
        }

        .chatbot-messages::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }

        .chatbot-messages::-webkit-scrollbar-thumb:hover {
          background: #555;
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



