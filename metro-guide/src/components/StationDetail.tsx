import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, ArrowRightLeft, Wifi, Car, Accessibility, Clock, Navigation } from 'lucide-react';
import { CITY_CONFIGS, type CityConfig } from '../data/cityData';

const getIsMobile = () => window.innerWidth < 640;

interface StationDetailProps {
  stationId: string | null;
  onClose: () => void;
  onNavigate: (stationId: string) => void;
  cityConfig?: CityConfig;
}

const FACILITY_ICONS: Record<string, React.ReactNode> = {
  Parking: <Car size={13} />,
  Lift: <Accessibility size={13} />,
  Escalator: <Accessibility size={13} />,
  Restrooms: <MapPin size={13} />,
  'Ticket Counter': <Clock size={13} />,
  Interchange: <ArrowRightLeft size={13} />,
  WiFi: <Wifi size={13} />,
};

/* ─── small reusable label ─── */
function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{
      color: 'rgba(148,163,184,0.7)',
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.10em',
      textTransform: 'uppercase',
      margin: '0 0 8px 0',
    }}>
      {children}
    </p>
  );
}

export default function StationDetail({ stationId, onClose, onNavigate, cityConfig = CITY_CONFIGS.pune }: StationDetailProps) {
  const [mobile, setMobile] = useState(getIsMobile);
  useEffect(() => {
    const handler = () => setMobile(getIsMobile());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  if (!stationId) return null;
  const station = cityConfig.stations[stationId];
  if (!station) return null;

  const line  = cityConfig.lines.find(l => l.id === station.line);
  const color = cityConfig.lineColors[station.line] || { primary: '#a855f7', glow: '#c084fc', rgb: [168, 85, 247] };

  const connectedStations = station.connectedStations
    .map(id => cityConfig.stations[id])
    .filter(Boolean);

  /* positions */
  const posStyle: React.CSSProperties = mobile
    ? { bottom: 60, left: 0, right: 0, width: '100%' }
    : { bottom: '16px', left: '16px', width: '300px' };

  const animProps = mobile
    ? { initial: { y: '100%', opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: '100%', opacity: 0 } }
    : { initial: { opacity: 0, x: -40, scale: 0.95 }, animate: { opacity: 1, x: 0, scale: 1 }, exit: { opacity: 0, x: -40, scale: 0.95 } };

  return (
    <AnimatePresence>
      <motion.div
        key={stationId}
        {...animProps}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          position: 'fixed',
          zIndex: 30,
          ...posStyle,
          background: 'rgba(22, 24, 40, 0.88)',
          backdropFilter: 'blur(36px) saturate(180%)',
          WebkitBackdropFilter: 'blur(36px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: mobile ? '20px 20px 0 0' : '18px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Mobile drag handle */}
        {mobile && <div className="bottom-sheet-handle" style={{ marginTop: '10px', marginBottom: '4px' }} />}

        {/* ── Top color bar ── */}
        <div style={{
          height: '3px',
          width: '100%',
          background: `linear-gradient(90deg, ${color.primary}, ${color.glow})`,
        }} />

        <div style={{ padding: '16px' }}>

          {/* ── Header: dot + name + close ── */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '14px',
            gap: '8px',
          }}>
            {/* Left: dot + station info */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
              {/* Glowing dot */}
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: color.primary,
                boxShadow: `0 0 10px ${color.primary}90`,
                flexShrink: 0,
                marginTop: '3px', /* align with first text line */
              }} />
              {/* Station name + line */}
              <div style={{ minWidth: 0 }}>
                <h3 style={{
                  color: '#f1f5f9',
                  fontSize: '16px',
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.25,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {station.name}
                </h3>
                <p style={{
                  color: color.glow,
                  fontSize: '12px',
                  margin: '3px 0 0',
                  fontWeight: 500,
                }}>
                  {line?.name || station.line}
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                width: '26px',
                height: '26px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#94a3b8',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = '#f1f5f9'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              <X size={13} />
            </button>
          </div>

          {/* ── Interchange badge ── */}
          {station.isInterchange && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px',
              padding: '7px 10px',
              background: 'rgba(234,179,8,0.08)',
              border: '1px solid rgba(234,179,8,0.18)',
              borderRadius: '10px',
            }}>
              <ArrowRightLeft size={12} style={{ color: '#facc15', flexShrink: 0 }} />
              <span style={{ color: '#facc15', fontSize: '11px', fontWeight: 500 }}>
                Interchange — {station.interchangeLines?.map(l =>
                  cityConfig.lines.find(li => li.id === l)?.name
                ).join(', ')}
              </span>
            </div>
          )}

          {/* ── Facilities ── */}
          {station.facilities?.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <SectionLabel>Facilities</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {station.facilities.map(facility => (
                  <span
                    key={facility}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 9px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#cbd5e1',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                      {FACILITY_ICONS[facility] || <MapPin size={13} />}
                    </span>
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Nearby Places ── */}
          {station.nearbyPlaces?.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <SectionLabel>Nearby Places</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {station.nearbyPlaces.map(place => (
                  <div
                    key={place}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: '#cbd5e1',
                    }}
                  >
                    <MapPin
                      size={12}
                      style={{ color: '#64748b', flexShrink: 0 }}
                    />
                    <span>{place}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Connected Stations ── */}
          {connectedStations.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <SectionLabel>Connected Stations</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {connectedStations.map(s => {
                  const connectedLine = cityConfig.lines.find(l => l.id === s.line);
                  const sColor = cityConfig.lineColors[s.line] || { primary: '#a855f7', glow: '#c084fc' };
                  return (
                    <button
                      key={s.id}
                      onClick={() => onNavigate(s.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.12s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      {/* Line color dot */}
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: sColor.primary,
                        flexShrink: 0,
                        boxShadow: `0 0 6px ${sColor.primary}80`,
                      }} />
                      {/* Station name */}
                      <span style={{
                        fontSize: '12px',
                        color: '#e2e8f0',
                        fontWeight: 500,
                        flex: 1,
                      }}>
                        {s.name}
                      </span>
                      {/* Line badge */}
                      <span style={{
                        fontSize: '10px',
                        color: sColor.glow,
                        fontWeight: 500,
                        flexShrink: 0,
                      }}>
                        {connectedLine?.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Navigate Button ── */}
          <button
            onClick={() => onNavigate(stationId)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: `linear-gradient(135deg, ${color.primary}, ${color.glow})`,
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: 'Inter, system-ui, sans-serif',
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'filter 0.15s, transform 0.12s',
              boxShadow: `0 4px 18px ${color.primary}55`,
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Navigation size={15} />
            Navigate Here
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
