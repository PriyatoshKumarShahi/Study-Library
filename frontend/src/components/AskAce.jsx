import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Trash2, Loader2, Sparkles, Mic, MicOff } from 'lucide-react';
import '../styles/AskAce.css';
import API from '../api';

const AskAce = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const chatPanelRef = useRef(null);
  const recognitionRef = useRef(null);

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

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => prev + (prev ? ' ' : '') + transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('askace_messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        chatHistory: messages.map(msg => ({ sender: msg.sender, text: msg.text }))
      });

      console.log("[Frontend] Response received:", response.data);

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.text || response.data.reply || "No response from AI",
        sender: 'ai',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);

      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }

    } catch (error) {
      console.error("[Frontend] Error:", error);
      console.error("[Frontend] Error response:", error.response?.data);

      let errorText = "I'm sorry, I encountered an error. Please try again!";

      if (error.response?.data?.error) {
        errorText = error.response.data.error;
      } else if (error.response?.data?.details) {
        errorText = `${error.response.data.error}\nDetails: ${error.response.data.details}`;
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

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      setMessages([]);
      localStorage.removeItem('askace_messages');
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
        text: `📝 **Conversation Summary:**\n\n${response.data.text || response.data.reply}`,
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

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
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
      <div
        className={`chat-icon ${isOpen ? 'hidden' : ''}`}
        onClick={toggleChat}
      >
        <MessageCircle size={28} />
        {unreadCount > 0 && (
          <div className="notification-badge">{unreadCount}</div>
        )}
      </div>

      <div className={`chat-panel ${isOpen ? 'open' : ''}`} ref={chatPanelRef}>
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

        {messages.length > 0 && (
          <div className="action-buttons">
            {messages.length > 5 && (
              <button
                className="summarize-btn"
                onClick={summarizeConversation}
                disabled={isLoading}
              >
                📝 Summarize
              </button>
            )}
            <button
              className="clear-btn"
              onClick={clearHistory}
              disabled={isLoading}
            >
              <Trash2 size={16} /> Clear History
            </button>
          </div>
        )}

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
            className={`mic-btn ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
            disabled={isLoading}
            title={isRecording ? "Stop recording" : "Start voice input"}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
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
