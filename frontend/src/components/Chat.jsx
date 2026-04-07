import React, { useState, useRef, useEffect } from 'react';
import AssistantMessageContent from './AssistantMessageContent';
import { askQuestion } from '../utils/api';
import Swal from 'sweetalert2';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

const Chat = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const lastProjectTitleRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const historyForApi = messages.map((m) => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content,
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
          type: 'assistant',
          content: response.answer,
          relevantProjects: rp,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to get response. Make sure the backend server is running.',
        icon: 'error',
        confirmButtonText: 'OK',
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

  return (
    <section className="chat-section py-5 my-3">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="chat-container shadow-lg">
              <div className="chat-header">
                <h2>Ask About My Projects</h2>
                <p className="text-muted">Ask me anything about my portfolio projects!</p>
              </div>

              <div className="chat-messages" id="chat-messages">
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
                    className={`message ${message.type === 'user' ? 'user-message' : 'assistant-message'}`}
                  >
                    <div className="message-content">
                      {message.type === 'user' ? (
                        <strong>You:</strong>
                      ) : (
                        <strong>AI Assistant:</strong>
                      )}
                      {message.type === 'user' ? (
                        <p>{message.content}</p>
                      ) : (
                        <div className="assistant-msg-wrap">
                          <AssistantMessageContent text={message.content} />
                        </div>
                      )}
                      
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
                  <div className="message assistant-message">
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

              <form onSubmit={handleSubmit} className="chat-input-form">
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
          </div>
        </div>
      </div>

      <style>{`
        .chat-section {
          min-height: 70vh;
        }

        .chat-container {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 600px;
        }

        .chat-header {
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
        }

        .chat-header h2 {
          margin: 0 0 10px 0;
          font-size: 1.8rem;
        }

        .chat-header p {
          margin: 0;
          opacity: 0.9;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f8f9fa;
        }

        .welcome-message {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
        }

        .welcome-message ul {
          text-align: left;
          display: inline-block;
          margin-top: 15px;
        }

        .message {
          margin-bottom: 15px;
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
          max-width: 70%;
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
          max-width: 92%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .assistant-msg-wrap {
          margin-top: 4px;
        }

        .message-content strong {
          display: block;
          margin-bottom: 5px;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .message-content p {
          margin: 0;
          line-height: 1.5;
        }

        .relevant-projects {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e9ecef;
        }

        .relevant-projects ul {
          margin: 10px 0 0 0;
          padding-left: 20px;
        }

        .relevant-projects li {
          margin-bottom: 8px;
        }

        .project-link {
          margin-left: 10px;
          color: #007bff;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .project-link:hover {
          text-decoration: underline;
        }

        .chat-input-form {
          padding: 20px;
          background: white;
          border-top: 1px solid #e9ecef;
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
        }

        .input-group .form-control:focus {
          border-color: #ffc107;
          box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.25);
        }

        .input-group .btn {
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Scrollbar styling */
        .chat-messages::-webkit-scrollbar {
          width: 8px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </section>
  );
};

export default Chat;



