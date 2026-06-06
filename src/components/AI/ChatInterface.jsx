import React, { useState, useRef, useEffect } from 'react';
import { useAIAssistant } from '../../context/AIAssistantContext';
import { Send, Bot, User, Loader2, Sparkles, Plus, Trash2 } from 'lucide-react';
import '../UI/UI.css';

const ChatInterface = ({ isPopup = false }) => {
  const { messages, isTyping, sendMessage, clearChat, apiKey } = useAIAssistant();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'transparent',
      borderRadius: isPopup ? '24px' : '32px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        background: 'var(--item-bg)',
        borderBottom: '1px solid var(--card-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--accent-coral), var(--accent-pink))', 
            padding: '10px', 
            borderRadius: '50%',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <Bot size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>AI Coach</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> Powered by Gemini
            </p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="neu-icon-btn"
          style={{ width: '40px', height: '40px' }}
          title="New Chat"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center' }}>
            <Bot size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Let's talk!</h4>
            <p style={{ fontSize: '14px', maxWidth: '250px' }}>
              Tell me your ideas, goals, or problems. I can help you figure things out and even create tasks or notes for you.
            </p>
            {!apiKey && (
              <div style={{ marginTop: '20px', background: 'var(--accent-coral)', padding: '8px 16px', borderRadius: '16px', color: 'white', fontSize: '12px', fontWeight: 600 }}>
                Please set your Gemini API Key in Settings first.
              </div>
            )}
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: msg.role === 'user' ? 'var(--item-bg)' : 'var(--accent-blue-wave)',
                color: msg.role === 'user' ? 'var(--text-main)' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: 'var(--shadow-inner)'
              }}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div style={{
                background: msg.role === 'user' ? 'var(--item-bg-hover)' : 'var(--solid-card-bg)',
                padding: '12px 16px',
                borderRadius: '16px',
                borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderTopLeftRadius: msg.role === 'model' ? '4px' : '16px',
                boxShadow: 'var(--shadow-soft)',
                maxWidth: '80%',
                fontSize: '14px',
                lineHeight: '1.5',
                color: 'var(--text-main)',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--accent-blue-wave)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-inner)'
            }}>
              <Bot size={16} />
            </div>
            <div style={{
              background: 'var(--solid-card-bg)',
              padding: '12px 16px',
              borderRadius: '16px',
              borderTopLeftRadius: '4px',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-muted)'
            }}>
              <Loader2 size={16} className="lucide-spin" style={{ animation: 'spin 2s linear infinite' }} />
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '20px', borderTop: '1px solid var(--card-border)', background: 'var(--item-bg)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="neu-input"
            style={{ flex: 1, padding: '14px 20px', borderRadius: '24px' }}
            disabled={isTyping}
          />
          <button 
            type="submit" 
            disabled={!inputValue.trim() || isTyping}
            className="pill-btn primary"
            style={{ 
              width: '48px', 
              height: '48px', 
              padding: 0, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              opacity: (!inputValue.trim() || isTyping) ? 0.5 : 1
            }}
          >
            <Send size={18} style={{ marginLeft: '4px' }} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
