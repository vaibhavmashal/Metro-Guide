import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, Check } from 'lucide-react';
import { CITIES, CITY_CONFIGS, type CityId } from '../data/cityData';

interface CitySelectorProps {
  currentCity: CityId;
  onCityChange: (city: CityId) => void;
}

const getIsMobile = () => window.innerWidth < 640;

export default function CitySelector({ currentCity, onCityChange }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mobile, setMobile] = useState(getIsMobile);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setMobile(getIsMobile());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = CITY_CONFIGS[currentCity];

  const containerStyle: React.CSSProperties = mobile
    ? {
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }
    : {
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      };

  return (
    <div ref={ref} style={containerStyle}>
      {/* ── Toggle Button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: mobile ? '6px' : '8px',
          padding: mobile ? '8px 12px' : '9px 16px',
          background: 'rgba(22, 24, 40, 0.88)',
          backdropFilter: 'blur(36px) saturate(180%)',
          WebkitBackdropFilter: 'blur(36px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '14px',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
          transition: 'border-color 0.15s, background 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.40)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
      >
        {/* Line color dots */}
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          {current.lineColorsDef.map(l => (
            <span
              key={l.name}
              style={{
                width: '7px', height: '7px',
                borderRadius: '50%',
                backgroundColor: l.color,
                display: 'block',
                boxShadow: `0 0 5px ${l.color}`,
              }}
            />
          ))}
        </div>

        <MapPin size={mobile ? 12 : 13} style={{ color: '#a855f7' }} />

        <span style={{
          color: '#f1f5f9',
          fontSize: mobile ? '12px' : '13px',
          fontWeight: 600,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          {current.name}
        </span>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} style={{ color: '#94a3b8' }} />
        </motion.div>
      </button>

      {/* ── Dropdown Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{
              marginTop: '8px',
              width: '240px',
              background: 'rgba(22, 24, 40, 0.96)',
              backdropFilter: 'blur(36px) saturate(180%)',
              WebkitBackdropFilter: 'blur(36px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
              overflow: 'hidden',
              padding: '8px',
            }}
          >
            <p style={{
              color: 'rgba(148,163,184,0.6)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '4px 10px 8px',
              margin: 0,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              Select City
            </p>

            {CITIES.map(city => {
              const config = CITY_CONFIGS[city.id];
              const isActive = city.id === currentCity;

              return (
                <button
                  key={city.id}
                  onClick={() => { onCityChange(city.id); setIsOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isActive ? 'rgba(168,85,247,0.14)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.12s',
                    marginBottom: '2px',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {/* Line color strip */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                    flexShrink: 0,
                  }}>
                    {config.lineColorsDef.map(l => (
                      <span
                        key={l.name}
                        style={{
                          width: '4px', height: '14px',
                          borderRadius: '2px',
                          backgroundColor: l.color,
                          display: 'block',
                        }}
                      />
                    ))}
                  </div>

                  {/* City info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0,
                      color: isActive ? '#f1f5f9' : '#cbd5e1',
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 500,
                      fontFamily: 'Inter, system-ui, sans-serif',
                      lineHeight: 1.2,
                    }}>
                      {config.name}
                    </p>
                    <p style={{
                      margin: '2px 0 0',
                      color: 'rgba(148,163,184,0.6)',
                      fontSize: '11px',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      lineHeight: 1,
                    }}>
                      {config.lines.length} lines · {Object.keys(config.stations).length} stations
                    </p>
                  </div>

                  {/* Active checkmark */}
                  {isActive && (
                    <Check size={14} style={{ color: '#a855f7', flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
