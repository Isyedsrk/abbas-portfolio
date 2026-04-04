import React, { useState, useRef, useEffect } from 'react';
import { askQuestion } from '../utils/api';
import Swal from 'sweetalert2';
import { FaPaperPlane, FaSpinner, FaTimes } from 'react-icons/fa';

const ChatPopup = ({ isOpen, onClose }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      return;
    }

    const userMessage = question.trim();
    setQuestion('');
    setMessages((prev) => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Send conversation history for context
      const response = await askQuestion(userMessage, messages);
      
      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: response.answer,
          relevantProjects: response.relevantProjects || [],
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to get response. Make sure the backend server is running.',
        icon: 'error',
        confirmButtonText: 'OK',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      
      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          content: 'Sorry, I encountered an error. Please try again or make sure the backend server is running.',
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="chat-popup-backdrop" onClick={onClose}></div>
      
      {/* Chat Popup */}
      <div className="chat-popup-container">
        <div className="chat-popup-header">
          <div>
            <h3>Ask About My Projects</h3>
            <p>Ask me anything about my portfolio projects!</p>
          </div>
          <button className="chat-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="chat-popup-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <p>👋 Hi! I'm an AI assistant that can help you learn about my projects.</p>
              <p>Try asking:</p>
              <ul>
                <li>"Tell me about your AR project"</li>
                <li>"What games have you created?"</li>
                <li>"Show me your e-commerce projects"</li>
              </ul>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${message.type === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-content">
                {message.type === 'user' ? (
                  <strong>You:</strong>
                ) : (
                  <strong>AI Assistant:</strong>
                )}
                <p>{message.content}</p>
                
                {message.relevantProjects && message.relevantProjects.length > 0 && (
                  <div className="relevant-projects">
                    <strong>Relevant Projects:</strong>
                    <ul>
                      {message.relevantProjects.map((project, idx) => (
                        <li key={idx}>
                          <strong>{project.title}</strong>
                          {project.links && (
                            <a
                              href={project.links}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="project-link"
                            >
                              View on GitHub
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message assistant-message">
              <div className="message-content">
                <strong>AI Assistant:</strong>
                <p>
                  <FaSpinner className="spinner" /> Thinking...
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chat-popup-input-form">
          <div className="input-group">
            <input
              ref={inputRef}
              type="text"
              className="form-control"
              placeholder="Ask a question about my projects..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-warning"
              disabled={loading || !question.trim()}
            >
              {loading ? (
                <FaSpinner className="spinner" />
              ) : (
                <FaPaperPlane />
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .chat-popup-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1040;
          animation: fadeIn 0.2s ease-in;
        }

        .chat-popup-container {
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

        .chat-popup-header {
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 20px 20px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .chat-popup-header h3 {
          margin: 0 0 5px 0;
          font-size: 1.5rem;
        }

        .chat-popup-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 0.9rem;
        }

        .chat-close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
          flex-shrink: 0;
        }

        .chat-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .chat-popup-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f8f9fa;
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

        .chat-message {
          margin-bottom: 15px;
          animation: fadeIn 0.3s ease-in;
        }

        .user-message {
          text-align: right;
        }

        .user-message .message-content {
          display: inline-block;
          background: #007bff;
          color: white;
          padding: 12px 18px;
          border-radius: 18px 18px 4px 18px;
          max-width: 75%;
          text-align: left;
        }

        .assistant-message {
          text-align: left;
        }

        .assistant-message .message-content {
          display: inline-block;
          background: white;
          color: #333;
          padding: 12px 18px;
          border-radius: 18px 18px 18px 4px;
          max-width: 75%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .message-content strong {
          display: block;
          margin-bottom: 5px;
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .message-content p {
          margin: 0;
          line-height: 1.5;
          font-size: 0.95rem;
        }

        .relevant-projects {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e9ecef;
        }

        .relevant-projects strong {
          font-size: 0.9rem;
        }

        .relevant-projects ul {
          margin: 10px 0 0 0;
          padding-left: 20px;
        }

        .relevant-projects li {
          margin-bottom: 8px;
          font-size: 0.9rem;
        }

        .project-link {
          margin-left: 10px;
          color: #007bff;
          text-decoration: none;
          font-size: 0.85rem;
        }

        .project-link:hover {
          text-decoration: underline;
        }

        .chat-popup-input-form {
          padding: 15px 20px;
          background: white;
          border-top: 1px solid #e9ecef;
          border-radius: 0 0 20px 20px;
        }

        .input-group {
          display: flex;
          gap: 10px;
        }

        .input-group .form-control {
          flex: 1;
          border-radius: 25px;
          border: 2px solid #e9ecef;
          padding: 12px 20px;
          font-size: 0.95rem;
        }

        .input-group .form-control:focus {
          border-color: #ffc107;
          box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.25);
          outline: none;
        }

        .input-group .btn {
          border-radius: 50%;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: none;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Scrollbar styling */
        .chat-popup-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-popup-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .chat-popup-messages::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }

        .chat-popup-messages::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        @media (max-width: 768px) {
          .chat-popup-container {
            width: 95%;
            height: 85vh;
            max-height: 600px;
          }
        }
      `}</style>
    </>
  );
};

export default ChatPopup;

