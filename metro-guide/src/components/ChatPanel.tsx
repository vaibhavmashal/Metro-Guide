import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Loader2, Trash2, MessageSquare } from 'lucide-react';
import { type CityConfig } from '../data/cityData';
import { FormattedMessage } from './FormattedMessage';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface ChatPanelProps {
  cityConfig?: CityConfig;
  isMobile?: boolean;
}

const DEFAULT_SUGGESTIONS: string[] = [
  "Show metro route between stations",
  "Check timings and train frequency",
  "What facilities are available at stations?"
];

export default function ChatPanel({ cityConfig, isMobile = false }: ChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string>(() => {
    let id = sessionStorage.getItem('metro_guest_session_id');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('metro_guest_session_id', id);
    }
    return id;
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: `Hello! I'm Metro AI 🚇. Ask me anything about ${cityConfig?.name || 'Metro'} routes, stations, travel times, or tips!`,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query, session_id: sessionId }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.response || "I couldn't process that request at the moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `I am currently running in offline mode or unable to reach the backend. Feel free to explore Pune Metro routes and stations using the interactive 3D map!`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClearHistory = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/chat/history/${sessionId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error("Failed to delete chat history from database:", error);
    }

    const newId = crypto.randomUUID();
    sessionStorage.setItem('metro_guest_session_id', newId);
    setSessionId(newId);

    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: `Chat history cleared. How can I assist with your ${cityConfig?.name || 'Metro'} journey today?`,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? '74px' : '20px',
      right: isMobile ? '16px' : '20px',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              width: isMobile ? 'calc(100vw - 32px)' : '360px',
              maxWidth: 'calc(100vw - 32px)',
              height: isMobile ? '420px' : '510px',
              maxHeight: 'calc(100vh - 140px)',
              background: 'rgba(18, 20, 36, 0.94)',
              backdropFilter: 'blur(36px) saturate(180%)',
              WebkitBackdropFilter: 'blur(36px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '22px',
              boxShadow: '0 25px 70px rgba(0,0,0,0.65), 0 0 40px rgba(124, 58, 237, 0.18)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              marginBottom: '14px',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              background: 'linear-gradient(90deg, rgba(124,58,237,0.22) 0%, rgba(18,20,36,0.4) 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '11px',
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
                  position: 'relative'
                }}>
                  <Bot size={20} color="#fff" />
                  <span style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#4ade80',
                    border: '2px solid rgba(18,20,36,0.95)'
                  }} />
                </div>
                <div>
                  <h3 style={{
                    color: '#f8fafc',
                    fontSize: '15px',
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: '-0.01em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    Metro AI Assistant
                  </h3>
                  <span style={{
                    color: '#a78bfa',
                    fontSize: '11px',
                    fontWeight: 500,
                    display: 'block'
                  }}>
                    Ask anything about metro routes
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={handleClearHistory}
                  title="Clear conversation"
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '9px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#f87171';
                    e.currentTarget.style.background = 'rgba(248,113,113,0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }}
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Assistant"
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '9px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Message History */}
            <div className="custom-scrollbar" style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '11px 14px',
                      borderRadius: msg.sender === 'user'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      background: msg.sender === 'user'
                        ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                        : 'rgba(255, 255, 255, 0.07)',
                      color: '#f8fafc',
                      fontSize: '13px',
                      lineHeight: '1.45',
                      border: msg.sender === 'user'
                        ? '1px solid rgba(167, 139, 250, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: msg.sender === 'user'
                        ? '0 4px 14px rgba(124, 58, 237, 0.3)'
                        : '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    <FormattedMessage text={msg.text} isUser={msg.sender === 'user'} />
                  </div>
                  <span style={{
                    fontSize: '10px',
                    color: '#64748b',
                    marginTop: '4px',
                    padding: '0 4px'
                  }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 4px' }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'rgba(255, 255, 255, 0.07)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#c4b5fd',
                    fontSize: '12px'
                  }}>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Metro AI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            {messages.length <= 2 && (
              <div style={{
                padding: '0 16px 12px 16px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                flexShrink: 0,
              }}>
                {DEFAULT_SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(sug)}
                    style={{
                      background: 'rgba(124, 58, 237, 0.15)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '12px',
                      padding: '6px 10px',
                      color: '#ddd6fe',
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(124, 58, 237, 0.3)';
                      e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.5)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(124, 58, 237, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                    }}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div style={{
              padding: '12px 14px',
              background: 'rgba(15, 17, 30, 0.8)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
            }}>
              <input
                type="text"
                placeholder="Ask about stations, timings, routes..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#f8fafc',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'border-color 0.15s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: input.trim() && !isLoading
                    ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                    : 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: input.trim() && !isLoading ? '#fff' : '#64748b',
                  cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                  boxShadow: input.trim() && !isLoading
                    ? '0 4px 14px rgba(124, 58, 237, 0.4)'
                    : 'none'
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (FAB) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: isOpen ? '12px' : '12px 18px',
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '9999px',
          color: '#ffffff',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(124, 58, 237, 0.45), 0 0 0 1px rgba(255,255,255,0.1)',
          transition: 'all 0.2s ease',
        }}
        title="Open Metro AI Assistant"
      >
        {isOpen ? (
          <X size={20} />
        ) : (
          <>
            <MessageSquare size={18} />
            <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.01em' }}>
              Metro AI
            </span>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#4ade80',
              boxShadow: '0 0 8px #4ade80'
            }} />
          </>
        )}
      </motion.button>
    </div>
  );
}
