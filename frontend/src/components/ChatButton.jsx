import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ChatBot from './ChatBot';
import { FaCommentDots } from 'react-icons/fa';
import { HIGHLIGHT_PROJECT_CHAT_BUTTON_EVENT } from './ProjectAiAssistantModal';

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightChat, setHighlightChat] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let clearT;
    const pulse = () => {
      if (clearT) window.clearTimeout(clearT);
      setHighlightChat(true);
      clearT = window.setTimeout(() => setHighlightChat(false), 2200);
    };
    window.addEventListener(HIGHLIGHT_PROJECT_CHAT_BUTTON_EVENT, pulse);
    return () => {
      window.removeEventListener(HIGHLIGHT_PROJECT_CHAT_BUTTON_EVENT, pulse);
      if (clearT) window.clearTimeout(clearT);
    };
  }, []);
  
  // Only show on Project page
  const isProjectPage = location.pathname === '/Project' || location.pathname === '/project';
  
  if (!isProjectPage) {
    return null;
  }

  return (
    <>
      <button
        className={`chat-floating-button${highlightChat ? " chat-floating-button--attention" : ""}`}
        onClick={() => setIsOpen(true)}
        aria-label="Ask about my projects"
        title="Ask about my projects"
      >
        <FaCommentDots className="chat-button-icon" />
      </button>

      <ChatBot isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <style>{`
        .chat-floating-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          background: #00d4ff;
          color: #001018;
          border: 3px solid #141414;
          border-radius: 50%;
          padding: 0;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          z-index: 1030;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          animation: slideInUp 0.5s ease-out;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chat-floating-button:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 8px 25px rgba(0, 212, 255, 0.55);
          background: #00b8e0;
        }

        .chat-floating-button:active {
          transform: translateY(-2px) scale(1.02);
        }

        .chat-button-icon {
          font-size: 1.5rem;
          transition: transform 0.3s ease;
        }

        .chat-floating-button:hover .chat-button-icon {
          transform: scale(1.1);
        }

        .chat-floating-button--attention {
          animation: chatFabAttention 2.1s ease-in-out 1 !important;
        }

        @keyframes chatFabAttention {
          0%,
          100% {
            transform: scale(1) translateY(0);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          }
          18% {
            transform: scale(1.14) translateY(-6px);
            box-shadow:
              0 0 0 6px rgba(0, 212, 255, 0.4),
              0 12px 32px rgba(0, 212, 255, 0.42);
          }
          36% {
            transform: scale(1) translateY(0);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          }
          54% {
            transform: scale(1.12) translateY(-5px);
            box-shadow:
              0 0 0 8px rgba(0, 212, 255, 0.35),
              0 10px 28px rgba(0, 212, 255, 0.38);
          }
          72% {
            transform: scale(1) translateY(0);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          }
          88% {
            transform: scale(1.08) translateY(-3px);
            box-shadow: 0 8px 24px rgba(0, 212, 255, 0.46);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .chat-floating-button--attention {
            animation: none !important;
          }
        }

        @media (max-width: 768px) {
          .chat-floating-button {
            bottom: 20px;
            right: 20px;
            width: 55px;
            height: 55px;
          }

          .chat-button-icon {
            font-size: 1.3rem;
          }
        }

        @media (max-width: 480px) {
          .chat-floating-button {
            bottom: 15px;
            right: 15px;
            width: 50px;
            height: 50px;
          }

          .chat-button-icon {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </>
  );
};

export default ChatButton;

