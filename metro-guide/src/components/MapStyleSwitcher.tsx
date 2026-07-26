import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, X } from 'lucide-react';
import { MAP_STYLES } from '../utils/mapStyles';

interface MapStyleSwitcherProps {
  currentStyle: string;
  onStyleChange: (styleId: string) => void;
  is3DTerrain: boolean;
  onToggle3DTerrain: (enabled: boolean) => void;
}

export default function MapStyleSwitcher({
  currentStyle,
  onStyleChange,
  is3DTerrain,
  onToggle3DTerrain,
}: MapStyleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-[80px] sm:bottom-5 left-4 sm:left-5 z-10 flex flex-col items-start gap-2">
      {/* Panel — opens above the button */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              width: '240px',
              background: 'rgba(22, 24, 40, 0.90)',
              backdropFilter: 'blur(36px) saturate(180%)',
              WebkitBackdropFilter: 'blur(36px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '18px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
              padding: '18px',
              marginBottom: '6px',
              position: 'relative',
            }}
          >
            {/* ── Close button ── */}
            <button
              onClick={() => setIsOpen(false)}
              title="Close"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(148,163,184,0.8)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(148,163,184,0.8)';
              }}
            >
              <X size={15} />
            </button>

            <p style={{
              color: '#f1f5f9',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              margin: '0 0 14px 0',
            }}>
              Base Map
            </p>

            <div className="grid grid-cols-2 gap-2 mb-2">
              {MAP_STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => onStyleChange(style.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: currentStyle === style.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: currentStyle === style.id 
                      ? '1px solid rgba(168,85,247,0.45)' 
                      : '1px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (currentStyle !== style.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                  onMouseLeave={e => {
                    if (currentStyle !== style.id) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div
                    className="w-full h-12 rounded-lg"
                    style={{ background: style.preview }}
                  />
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: currentStyle === style.id ? '#fff' : '#94a3b8',
                    fontFamily: 'Inter, system-ui, sans-serif'
                  }}>
                    {style.name}
                  </span>
                </button>
              ))}
            </div>

            {/* ── 3D Terrain Toggle ── */}
            <div style={{ marginTop: '12px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 8px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    minWidth: '18px',
                    borderRadius: '5px',
                    border: is3DTerrain
                      ? '2px solid #a855f7'
                      : '2px solid rgba(255,255,255,0.18)',
                    background: is3DTerrain
                      ? '#a855f7'
                      : 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                >
                  {is3DTerrain && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 3.5L3.8 6.5L9 1"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={is3DTerrain}
                  onChange={e => onToggle3DTerrain(e.target.checked)}
                  style={{ display: 'none' }}
                />
                <span style={{
                  fontSize: '13px',
                  color: is3DTerrain ? '#e2e8f0' : '#94a3b8',
                  fontWeight: is3DTerrain ? 500 : 400,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  userSelect: 'none',
                  transition: 'color 0.15s',
                }}>
                  3D terrain
                </span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fab-btn ${isOpen ? 'fab-btn-active' : ''}`}
        title="Map layers"
      >
        <Layers className="w-5 h-5 text-white/80" />
      </button>
    </div>
  );
}
