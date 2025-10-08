import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Trash2, Loader2, Sparkles } from 'lucide-react';
import '../styles/AskAce.css';
import API from '../api';

const AskAce = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const chatPanelRef = useRef(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('askace_messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const recentMessages = parsed.filter(msg => msg.timestamp > sevenDaysAgo);
        setMessages(recentMessages);
        
        if (recentMessages.length !== parsed.length) {
          localStorage.setItem('askace_messages', JSON.stringify(recentMessages));
        }
      } catch (error) {
        console.error('Error loading saved messages:', error);
        localStorage.removeItem('askace_messages');
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('askace_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up old messages daily
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      setMessages(prev => prev.filter(msg => msg.timestamp > sevenDaysAgo));
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log("[Frontend] Sending message to backend:", currentInput);

      const response = await API.post('/askace', {
        message: currentInput,
        chatHistory: messages // Send previous messages for context
      });

      console.log("[Frontend] Response received:", response.data);

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.text || "No response from AI",
        sender: 'ai',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);

      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }

    } catch (error) {
      console.error("[Frontend] Error:", error);

      let errorText = "I'm sorry, I encountered an error. Please try again!";
      
      if (error.response?.data?.error) {
        errorText = error.response.data.error;
      } else if (error.message) {
        errorText = `Error: ${error.message}`;
      }

      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: 'ai',
        timestamp: Date.now(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const summarizeConversation = async () => {
    if (messages.length === 0) return;

    setIsLoading(true);

    const conversationText = messages
      .map(msg => `${msg.sender === 'user' ? 'User' : 'AskAce'}: ${msg.text}`)
      .join('\n');

    try {
      console.log("[Frontend] Requesting conversation summary...");

      const response = await API.post('/askace', {
        message: `Please provide a brief summary of this conversation:\n\n${conversationText}`,
        chatHistory: []
      });

      const summaryMessage = {
        id: Date.now(),
        text: `📝 **Conversation Summary:**\n\n${response.data.text}`,
        sender: 'ai',
        timestamp: Date.now(),
        isSummary: true
      };

      setMessages(prev => [...prev, summaryMessage]);

    } catch (error) {
      console.error("[Frontend] Error fetching summary:", error);
      
      const errorMessage = {
        id: Date.now(),
        text: "Failed to generate summary. Please try again.",
        sender: 'ai',
        timestamp: Date.now(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <div 
        className={`chat-icon ${isOpen ? 'hidden' : ''}`}
        onClick={toggleChat}
      >
        <MessageCircle size={28} />
        {unreadCount > 0 && (
          <div className="notification-badge">{unreadCount}</div>
        )}
      </div>

      {/* Chat Panel */}
      <div className={`chat-panel ${isOpen ? 'open' : ''}`} ref={chatPanelRef}>
        {/* Header */}
        <div className="chat-header">
          <div className="header-content">
            <div className="logo-section">
              <Sparkles className="logo-icon" />
              <div>
                <h3>AskAce</h3>
                <p className="tagline">Your friendly AI assistant</p>
              </div>
            </div>
            <button className="close-btn" onClick={toggleChat}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <Sparkles size={48} className="welcome-icon" />
              <h2>Hi there! 👋</h2>
              <p>I'm AskAce, your friendly AI assistant!</p>
              <p>Ask me anything - I'm here to help with:</p>
              <ul>
                <li>📚 Study questions & explanations</li>
                <li>💡 Problem-solving guidance</li>
                <li>🎯 Learning tips & strategies</li>
                <li>🤔 General knowledge questions</li>
              </ul>
              <p className="motivational">Let's learn together! 🚀</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.sender} ${message.isError ? 'error' : ''} ${message.isSummary ? 'summary' : ''}`}
                >
                  <div className="message-content">
                    <div className="message-text">{message.text}</div>
                    <div className="message-footer">
                      <span className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      <button
                        className="delete-btn"
                        onClick={() => deleteMessage(message.id)}
                        title="Delete message"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message ai loading">
                  <div className="message-content">
                    <Loader2 className="spinner" size={20} />
                    <span>AskAce is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Action Buttons */}
        {messages.length > 5 && (
          <div className="action-buttons">
            <button 
              className="summarize-btn"
              onClick={summarizeConversation}
              disabled={isLoading}
            >
              📝 Summarize Conversation
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="input-area">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            rows="1"
            disabled={isLoading}
          />
          <button 
            className="send-btn"
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </>
  );
};

export default AskAce;

