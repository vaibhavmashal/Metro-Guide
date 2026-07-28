import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Loader2, Trash2, MessageSquare, MapPin, Clock, Train, ChevronRight, Map } from 'lucide-react';
import { type CityConfig } from '../data/cityData';
import { FormattedMessage } from './FormattedMessage';
import type { JourneyResult } from '../utils/journeyApi';

// ── Types ─────────────────────────────────────────────────────────────

interface StructuredRouteSegment {
  line: string;
  line_name: string;
  stations: string[];
  station_names: string[];
  station_count: number;
}

interface StructuredRoute {
  source_place: string;
  destination_place: string;
  source_station: { id: string; name: string; line: string; latitude: number; longitude: number; distance_from_user_meters: number };
  dest_station: { id: string; name: string; line: string; latitude: number; longitude: number; distance_from_user_meters: number };
  total_stations: number;
  metro_distance_km: number;
  estimated_time_min: number;
  interchanges: string[];
  line_segments: StructuredRouteSegment[];
  metro_route_coords: number[][];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  structured_route?: StructuredRoute | null;
}

interface ChatPanelProps {
  cityConfig?: CityConfig;
  isMobile?: boolean;
  activeTab?: string;
  onJourneyResult?: (result: JourneyResult | null) => void;
}

const DEFAULT_SUGGESTIONS: string[] = [
  'How to go from FC Road to Swargate?',
  'Route from Shivajinagar to Ramwadi',
  'What facilities are at Khadki station?',
];

// Line color map
const LINE_COLORS: Record<string, string> = {
  purple: '#9333ea',
  aqua: '#06b6d4',
};

// ── Route Card Component ──────────────────────────────────────────────

function RouteCard({ route, onViewOnMap }: { route: StructuredRoute; onViewOnMap: () => void }) {
  const hasInterchange = route.interchanges.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        marginTop: '10px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '14px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Train size={14} color="#a78bfa" />
        <span style={{ color: '#a78bfa', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Metro Route
        </span>
      </div>

      {/* Station route */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={12} color="#4ade80" />
          <span style={{ color: '#f8fafc', fontSize: '12px', fontWeight: 600 }}>
            {route.source_station.name}
          </span>
        </div>
        <ChevronRight size={12} color="#64748b" />
        {route.line_segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                padding: '2px 7px',
                borderRadius: '6px',
                background: (LINE_COLORS[seg.line] || '#64748b') + '30',
                border: `1px solid ${LINE_COLORS[seg.line] || '#64748b'}`,
                color: LINE_COLORS[seg.line] || '#94a3b8',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              {seg.line_name}
            </span>
            {i < route.line_segments.length - 1 && <ChevronRight size={12} color="#64748b" />}
          </div>
        ))}
        <ChevronRight size={12} color="#64748b" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={12} color="#f87171" />
          <span style={{ color: '#f8fafc', fontSize: '12px', fontWeight: 600 }}>
            {route.dest_station.name}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} color="#94a3b8" />
          <span style={{ color: '#94a3b8', fontSize: '11px' }}>~{route.estimated_time_min} min</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Train size={12} color="#94a3b8" />
          <span style={{ color: '#94a3b8', fontSize: '11px' }}>{route.total_stations} stations</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={12} color="#94a3b8" />
          <span style={{ color: '#94a3b8', fontSize: '11px' }}>{route.metro_distance_km} km</span>
        </div>
        {hasInterchange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#fbbf24', fontSize: '11px' }}>
              🔄 {route.interchanges.length} interchange{route.interchanges.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* View on Map button */}
      <button
        onClick={onViewOnMap}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '8px 14px',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          border: 'none',
          borderRadius: '10px',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'opacity 0.15s',
          width: '100%',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <Map size={14} />
        View on Map
      </button>
    </motion.div>
  );
}

// ── Main ChatPanel Component ──────────────────────────────────────────

export default function ChatPanel({ cityConfig, isMobile = false, onJourneyResult }: ChatPanelProps) {
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
      text: `Hello! I'm Metro AI 🚇\n\nI can plan routes for you — just say something like:\n\n**"How to go from FC Road to Swargate?"**\n\nOr ask about timings, fares, and station info!`,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Build a JourneyResult-compatible object from StructuredRoute for map rendering
  const buildJourneyResult = (route: StructuredRoute): JourneyResult => ({
    success: true,
    source_station: {
      id: route.source_station.id,
      name: route.source_station.name,
      line: route.source_station.line,
      latitude: route.source_station.latitude,
      longitude: route.source_station.longitude,
      distance_from_user_km: route.source_station.distance_from_user_meters / 1000,
      distance_from_user_meters: route.source_station.distance_from_user_meters,
    },
    dest_station: {
      id: route.dest_station.id,
      name: route.dest_station.name,
      line: route.dest_station.line,
      latitude: route.dest_station.latitude,
      longitude: route.dest_station.longitude,
      distance_from_user_km: route.dest_station.distance_from_user_meters / 1000,
      distance_from_user_meters: route.dest_station.distance_from_user_meters,
    },
    source_walking: {
      distance_meters: route.source_station.distance_from_user_meters,
      duration_minutes: (route.source_station.distance_from_user_meters / 1000 / 5) * 60,
      geometry: [],
      steps: [],
    },
    dest_walking: {
      distance_meters: route.dest_station.distance_from_user_meters,
      duration_minutes: (route.dest_station.distance_from_user_meters / 1000 / 5) * 60,
      geometry: [],
      steps: [],
    },
    source_options: [],
    dest_options: [],
    metro_segments: route.line_segments.map(seg => ({
      line: seg.line,
      line_name: seg.line_name,
      stations: seg.stations,
      station_names: seg.station_names,
      direction: '',
      station_count: seg.station_count,
    })),
    interchanges: route.interchanges,
    total_stations: route.total_stations,
    metro_distance_km: route.metro_distance_km,
    metro_time_minutes: route.estimated_time_min,
    walking_time_minutes: 0,
    total_time_minutes: route.estimated_time_min,
    ai_summary: '',
    journey_steps: [],
    metro_route_coords: route.metro_route_coords,
  });

  const sendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      // ── Call /chat/langgraph (LangGraph-powered route-aware endpoint)
      const response = await fetch(`${apiUrl}/chat/langgraph`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, session_id: sessionId }),
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.response || "I couldn't process that request at the moment.",
        timestamp: new Date(),
        structured_route: data.structured_route || null,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `I am currently running in offline mode or unable to reach the backend. Feel free to explore Pune Metro routes and stations using the interactive 3D map!`,
        timestamp: new Date(),
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
      await fetch(`${apiUrl}/chat/history/${sessionId}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete chat history from database:', error);
    }

    const newId = crypto.randomUUID();
    sessionStorage.setItem('metro_guest_session_id', newId);
    setSessionId(newId);

    setMessages([
      {
        id: Date.now().toString(),
        sender: 'bot',
        text: `Chat history cleared. How can I assist with your ${cityConfig?.name || 'Metro'} journey today?`,
        timestamp: new Date(),
      },
    ]);
  };

  const handleViewOnMap = (route: StructuredRoute) => {
    if (onJourneyResult) {
      const journeyResult = buildJourneyResult(route);
      onJourneyResult(journeyResult);
    }
    // On mobile, chat stays open so user can see the response
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: isMobile ? '50%' : 'auto',
        bottom: isMobile ? 'auto' : '20px',
        left: 'auto',
        right: isMobile ? '12px' : '20px',
        transform: isMobile ? 'translateY(-50%)' : 'none',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              width: isMobile ? 'calc(100vw - 24px)' : '380px',
              maxWidth: 'calc(100vw - 24px)',
              height: isMobile ? '460px' : '540px',
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: 'linear-gradient(90deg, rgba(124,58,237,0.22) 0%, rgba(18,20,36,0.4) 100%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '11px',
                    background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
                    position: 'relative',
                  }}
                >
                  <Bot size={20} color="#fff" />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#4ade80',
                      border: '2px solid rgba(18,20,36,0.95)',
                    }}
                  />
                </div>
                <div>
                  <h3
                    style={{
                      color: '#f8fafc',
                      fontSize: '15px',
                      fontWeight: 700,
                      margin: 0,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Metro AI Assistant
                  </h3>
                  <span style={{ color: '#a78bfa', fontSize: '11px', fontWeight: 500, display: 'block' }}>
                    Route planner · Station info · Timings
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  id="chat-clear-history-btn"
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
                    transition: 'all 0.15s',
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
                  id="chat-close-btn"
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
                    transition: 'all 0.15s',
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
            <div
              className="custom-scrollbar"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
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
                      maxWidth: '90%',
                      padding: '11px 14px',
                      borderRadius:
                        msg.sender === 'user'
                          ? '16px 16px 4px 16px'
                          : '16px 16px 16px 4px',
                      background:
                        msg.sender === 'user'
                          ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                          : 'rgba(255, 255, 255, 0.07)',
                      color: '#f8fafc',
                      fontSize: '13px',
                      lineHeight: '1.45',
                      border:
                        msg.sender === 'user'
                          ? '1px solid rgba(167, 139, 250, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow:
                        msg.sender === 'user'
                          ? '0 4px 14px rgba(124, 58, 237, 0.3)'
                          : '0 2px 8px rgba(0,0,0,0.2)',
                      width: msg.sender === 'bot' ? '100%' : undefined,
                    }}
                  >
                    <FormattedMessage text={msg.text} isUser={msg.sender === 'user'} />

                    {/* Route Card — only for bot messages with structured_route */}
                    {msg.sender === 'bot' && msg.structured_route && (
                      <RouteCard
                        route={msg.structured_route}
                        onViewOnMap={() => handleViewOnMap(msg.structured_route!)}
                      />
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#64748b',
                      marginTop: '4px',
                      padding: '0 4px',
                    }}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}

              {isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 4px' }}>
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '16px 16px 16px 4px',
                      background: 'rgba(255, 255, 255, 0.07)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#c4b5fd',
                      fontSize: '12px',
                    }}
                  >
                    <Loader2 size={14} className="animate-spin" />
                    <span>Metro AI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            {messages.length <= 2 && (
              <div
                style={{
                  padding: '0 16px 12px 16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  flexShrink: 0,
                }}
              >
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
                      textAlign: 'left',
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
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(15, 17, 30, 0.8)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
              }}
            >
              <input
                id="chat-input"
                type="text"
                placeholder="Ask about routes, timings, stations..."
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
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
              />
              <button
                id="chat-send-btn"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background:
                    input.trim() && !isLoading
                      ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                      : 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: input.trim() && !isLoading ? '#fff' : '#64748b',
                  cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                  boxShadow:
                    input.trim() && !isLoading
                      ? '0 4px 14px rgba(124, 58, 237, 0.4)'
                      : 'none',
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        id="chat-fab-btn"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? '0px' : '8px',
          width: isMobile ? '46px' : 'auto',
          height: isMobile ? '46px' : 'auto',
          padding: isMobile ? '0' : isOpen ? '12px' : '12px 18px',
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
          border: '1px solid rgba(255, 255, 255, 0.28)',
          borderRadius: isMobile ? '50%' : '9999px',
          color: '#ffffff',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(124, 58, 237, 0.5), 0 0 0 1px rgba(255,255,255,0.12)',
          transition: 'all 0.2s ease',
          alignSelf: 'flex-end',
          position: 'relative',
        }}
        title="Open Metro AI Assistant"
      >
        {isOpen ? (
          <X size={20} />
        ) : isMobile ? (
          <>
            <Bot size={22} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#4ade80',
                border: '2px solid #7c3aed',
                boxShadow: '0 0 8px #4ade80',
              }}
            />
          </>
        ) : (
          <>
            <MessageSquare size={18} />
            <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.01em' }}>
              Metro AI
            </span>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#4ade80',
                boxShadow: '0 0 8px #4ade80',
              }}
            />
          </>
        )}
      </motion.button>
    </div>
  );
}
