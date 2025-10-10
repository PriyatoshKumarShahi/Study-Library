import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Trash2, Loader2, Sparkles, Mic, MicOff } from 'lucide-react';
import API from '../api'; // Your axios instance with auth
import '../styles/AskAce.css'; // Import external CSS

const AskAce = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [userId, setUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const chatPanelRef = useRef(null);
  const recognitionRef = useRef(null);

  // Get userId - NO localStorage for chat data
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserId(userData._id || userData.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Load chat history from DATABASE when userId changes
  useEffect(() => {
    if (userId) {
      loadChatHistory();
    }
  }, [userId]);

  useEffect(() => {
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
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    if (!userId) return;

    try {
      console.log("[Frontend] Loading chat history for user:", userId);
      const response = await API.get(`/askace/history/${userId}`);
      
      if (response.data.messages && response.data.messages.length > 0) {
        const formattedMessages = response.data.messages.map((msg, index) => ({
          id: Date.now() + index,
          text: msg.text,
          sender: msg.sender,
          timestamp: new Date(msg.time).getTime()
        }));
        setMessages(formattedMessages);
        console.log("[Frontend] Loaded", formattedMessages.length, "messages");
      }
    } catch (error) {
      console.error("[Frontend] Error loading chat history:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Enhanced formatting function - ONLY for AI messages
  const formatMessageText = (text, isUserMessage = false) => {
    if (!text) return text;

    // User messages: simple text, no special formatting
    if (isUserMessage) {
      return <div className="user-message-text">{text}</div>;
    }

    // AI messages: enhanced formatting
    let cleanText = text.replace(/\*\*/g, '');
    cleanText = cleanText.replace(/\*/g, '');

    const paragraphs = cleanText.split(/\n\n+/);
    const totalLines = cleanText.split('\n').length;
    const isShortResponse = totalLines <= 3 && cleanText.length < 150;

    // For very short responses (like "Hi", "Hello", etc.), no special formatting
    if (isShortResponse) {
      return <div className="ai-text">{cleanText}</div>;
    }

    return paragraphs.map((para, pIndex) => {
      const lines = para.split('\n').filter(line => line.trim());
      
      return (
        <div key={pIndex} className="ai-paragraph">
          {lines.map((line, lIndex) => {
            const trimmedLine = line.trim();
            
            // Check if it's a heading (only for longer responses with structure)
            const isHeading = trimmedLine.length < 60 && 
                             trimmedLine.length > 3 &&
                             (trimmedLine.endsWith(':') || 
                              (lIndex === 0 && lines.length > 1 && 
                               !trimmedLine.startsWith('•') && 
                               !trimmedLine.startsWith('-') &&
                               !trimmedLine.match(/^(hi|hello|hey|thanks|thank you|okay|ok|sure|yes|no)/i)));
            
            if (isHeading) {
              return (
                <div key={lIndex} className="ai-heading">
                  {trimmedLine}
                </div>
              );
            }

            // Bullet points
            if (trimmedLine.startsWith('*') || trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
              return (
                <div key={lIndex} className="ai-bullet">
                  {trimmedLine}
                </div>
              );
            }

            // Regular paragraph text
            return (
              <div key={lIndex} className="ai-text">
                {trimmedLine}
              </div>
            );
          })}
        </div>
      );
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (!userId) {
      alert('Please log in to use AskAce');
      return;
    }

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
        userId: userId
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

      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I encountered an error. Please try again!",
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

  const clearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all chat history?')) {
      return;
    }

    if (!userId) {
      alert('Please log in to clear history');
      return;
    }

    try {
      await API.delete(`/askace/history/${userId}`);
      setMessages([]);
      console.log("[Frontend] Chat history cleared");
    } catch (error) {
      console.error("[Frontend] Error clearing history:", error);
      alert('Failed to clear chat history. Please try again.');
    }
  };

  const summarizeConversation = async () => {
    if (messages.length === 0) return;

    if (!userId) {
      alert('Please log in to use this feature');
      return;
    }

    setIsLoading(true);

    const conversationText = messages
      .map(msg => `${msg.sender === 'user' ? 'User' : 'AskAce'}: ${msg.text}`)
      .join('\n');

    try {
      console.log("[Frontend] Requesting conversation summary...");

      const response = await API.post('/askace', {
        message: `Please provide a brief summary of this conversation:\n\n${conversationText}`,
        userId: userId
      });

      const summaryMessage = {
        id: Date.now(),
        text: `📝 Conversation Summary\n\n${response.data.text || response.data.reply}`,
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
    <div className="askace-container">
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
                    <div className="message-text">
                      {formatMessageText(message.text, message.sender === 'user')}
                    </div>
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
            onKeyDown={handleKeyPress}
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
    </div>
  );
};

export default AskAce;