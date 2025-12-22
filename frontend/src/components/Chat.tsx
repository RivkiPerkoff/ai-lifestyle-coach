import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

interface ChatMessage {
  userMessage: string;
  aiResponse: string;
  timestamp: string;
  needsPlanUpdate: boolean;
}

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanUpdateNeeded: () => void;
}

const Chat: React.FC<ChatProps> = ({ isOpen, onClose, onPlanUpdateNeeded }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping chat history load');
        return;
      }
      
      const response = await fetch('http://localhost:5001/api/chat/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.chatHistory || []);
      } else {
        console.log('Failed to load chat history:', response.status);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:5001/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageToSend })
      });

      if (response.ok) {
        const data = await response.json();
        
        const newMessage: ChatMessage = {
          userMessage: messageToSend,
          aiResponse: data.response,
          timestamp: data.timestamp,
          needsPlanUpdate: data.needsPlanUpdate
        };

        setMessages(prev => [...prev, newMessage]);

        if (data.needsPlanUpdate) {
          onPlanUpdateNeeded();
        }
      } else {
        console.error('Failed to send message:', response.status, response.statusText);
        // Restore message on error
        setCurrentMessage(messageToSend);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setCurrentMessage(messageToSend);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return (
    <div className="chat-overlay">
      <div className="chat-container">
        {/* Empty container for smooth animation */}
      </div>
    </div>
  );

  return (
    <div className={`chat-overlay ${isOpen ? 'open' : ''}`}>
      <div className="chat-container">
        <div className="chat-header">
          <h3>💬 שיחה עם המאמן שלך</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <p>👋 שלום! אני המאמן האישי שלך.</p>
              <p>תוכל לשאול אותי שאלות על התוכנית שלך, לספר על שינויים בסדר היום או לבקש עצות.</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="message-pair">
                <div className="user-message">
                  <span>{msg.userMessage}</span>
                </div>
                <div className="ai-message">
                  <span>{msg.aiResponse}</span>
                  {msg.needsPlanUpdate && (
                    <div className="update-notice">
                      💡 ייתכן שתרצה לעדכן את התוכנית שלך
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="ai-message loading">
              <span>המאמן כותב...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="chat-input">
          <textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="כתוב הודעה למאמן שלך..."
            disabled={isLoading}
            rows={2}
          />
          <button 
            onClick={sendMessage} 
            disabled={!currentMessage.trim() || isLoading}
            className="send-btn"
          >
            📤
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;