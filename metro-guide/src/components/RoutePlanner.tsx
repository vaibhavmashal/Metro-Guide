import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, Search, ArrowUpDown, ArrowRightLeft, X } from 'lucide-react';
import { STATIONS, LINE_COLORS } from '../data/metroData';
import { findRoute, type RouteResult } from '../utils/pathfinding';

interface RoutePlannerProps {
  onRouteCalculated: (route: RouteResult | null) => void;
  onStationFocus: (stationId: string) => void;
}

const getIsMobile = () => window.innerWidth < 640;

export default function RoutePlanner({ onRouteCalculated, onStationFocus }: RoutePlannerProps) {
  const [isOpen, setIsOpen]                   = useState(false);
  const [source, setSource]                   = useState('');
  const [dest, setDest]                       = useState('');
  const [sourceSearch, setSourceSearch]       = useState('');
  const [destSearch, setDestSearch]           = useState('');
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown]     = useState(false);
  const [route, setRoute]                     = useState<RouteResult | null>(null);
  const [mobile, setMobile]                   = useState(getIsMobile);

  useEffect(() => {
    const handler = () => setMobile(getIsMobile());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // On mobile the parent controls visibility via tab switching — always show
  const effectiveOpen = mobile ? true : isOpen;

  const allStations = useMemo(() =>
    Object.values(STATIONS).sort((a, b) => a.name.localeCompare(b.name)), []);

  const filteredSourceStations = useMemo(() =>
    allStations.filter(s => s.name.toLowerCase().includes(sourceSearch.toLowerCase())),
    [allStations, sourceSearch]);

  const filteredDestStations = useMemo(() =>
    allStations.filter(s => s.name.toLowerCase().includes(destSearch.toLowerCase())),
    [allStations, destSearch]);

  const handleFindRoute = () => {
    if (!source || !dest) return;
    const result = findRoute(source, dest);
    setRoute(result);
    onRouteCalculated(result);
  };

  const handleSwap = () => {
    const tmpId = source; const tmpSearch = sourceSearch;
    setSource(dest); setSourceSearch(destSearch);
    setDest(tmpId); setDestSearch(tmpSearch);
    setRoute(null); onRouteCalculated(null);
  };

  const handleClear = () => {
    setSource(''); setDest(''); setSourceSearch(''); setDestSearch('');
    setRoute(null); onRouteCalculated(null);
  };

  /* ── shared input style ── */
  const inputStyle: React.CSSProperties = {
    width: '100%',
    paddingLeft: '30px',
    paddingRight: '12px',
    paddingTop: '10px',
    paddingBottom: '10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1.5px solid rgba(255,255,255,0.10)',
    borderRadius: '12px',
    color: '#f1f5f9',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'Inter, system-ui, sans-serif',
    boxSizing: 'border-box',
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0, right: 0,
    background: 'rgba(22,24,40,0.96)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '12px',
    maxHeight: '160px',
    overflowY: 'auto',
    zIndex: 50,
    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
  };

  const dotStyle = (color: string): React.CSSProperties => ({
    position: 'absolute', left: '12px', top: '50%',
    transform: 'translateY(-50%)', width: '9px', height: '9px',
    borderRadius: '50%', backgroundColor: color,
    flexShrink: 0, display: 'block', zIndex: 1,
  });

  /* ── Wrapper position based on device ── */
  const wrapperStyle: React.CSSProperties = mobile
    ? { position: 'fixed', bottom: 60, left: 0, right: 0, zIndex: 20 }
    : { position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 20 };

  const panelStyle: React.CSSProperties = {
    width: mobile ? '100%' : '400px',
    background: 'rgba(22, 24, 40, 0.88)',
    backdropFilter: 'blur(36px) saturate(180%)',
    WebkitBackdropFilter: 'blur(36px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: mobile ? '20px 20px 0 0' : '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
    padding: mobile ? '0 16px 20px' : '18px',
    maxHeight: mobile ? '80vh' : 'none',
    overflowY: mobile ? 'auto' : 'visible',
  };

  return (
    <div style={wrapperStyle}>
      {/* Desktop toggle pill */}
      {!mobile && !isOpen && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 18px',
            background: 'rgba(22, 24, 40, 0.82)',
            backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '14px', cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(22,24,40,0.82)')}
        >
          <Route size={16} style={{ color: '#a855f7' }} />
          <span style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 600 }}>Route Planner</span>
        </motion.button>
      )}

      {/* Panel */}
      <AnimatePresence>
        {effectiveOpen && (
          <motion.div
            initial={mobile ? { y: '100%', opacity: 0 } : { opacity: 0, y: -16, scale: 0.96 }}
            animate={mobile ? { y: 0, opacity: 1 }   : { opacity: 1, y: 0, scale: 1 }}
            exit={mobile   ? { y: '100%', opacity: 0 } : { opacity: 0, y: -16, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            style={panelStyle}
          >
            {/* Mobile drag handle */}
            {mobile && <div className="bottom-sheet-handle" style={{ marginBottom: '14px' }} />}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Route size={16} style={{ color: '#a855f7' }} />
                <span style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 700 }}>Route Planner</span>
              </div>
              {!mobile && (
                <button
                  onClick={() => { setIsOpen(false); handleClear(); }}
                  style={{
                    width: '28px', height: '28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px', cursor: 'pointer', color: '#94a3b8',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = '#f1f5f9'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Station inputs + swap */}
            <div style={{ display: 'flex', alignItems: 'stretch', gap: '10px', marginBottom: '12px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>

                {/* From */}
                <div style={{ position: 'relative' }}>
                  <span style={dotStyle('#4ade80')} />
                  <input
                    type="text"
                    placeholder="From station..."
                    value={sourceSearch}
                    onChange={e => { setSourceSearch(e.target.value); setShowSourceDropdown(true); setSource(''); }}
                    onFocus={() => setShowSourceDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSourceDropdown(false), 200)}
                    style={inputStyle}
                    onFocusCapture={e => { e.currentTarget.style.borderColor = 'rgba(138,92,246,0.75)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(138,92,246,0.18)'; }}
                    onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  <AnimatePresence>
                    {showSourceDropdown && sourceSearch && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} style={dropdownStyle} className="custom-scrollbar">
                        {filteredSourceStations.map(s => (
                          <button key={s.id} onMouseDown={() => { setSource(s.id); setSourceSearch(s.name); setShowSourceDropdown(false); }}
                            style={{ width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: '13px', color: '#cbd5e1', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Inter, system-ui, sans-serif' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#f1f5f9'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#cbd5e1'; }}
                          >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, backgroundColor: LINE_COLORS[s.line].primary }} />
                            {s.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* To */}
                <div style={{ position: 'relative' }}>
                  <span style={dotStyle('#f87171')} />
                  <input
                    type="text"
                    placeholder="To station..."
                    value={destSearch}
                    onChange={e => { setDestSearch(e.target.value); setShowDestDropdown(true); setDest(''); }}
                    onFocus={() => setShowDestDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
                    style={inputStyle}
                    onFocusCapture={e => { e.currentTarget.style.borderColor = 'rgba(138,92,246,0.75)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(138,92,246,0.18)'; }}
                    onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  <AnimatePresence>
                    {showDestDropdown && destSearch && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} style={dropdownStyle} className="custom-scrollbar">
                        {filteredDestStations.map(s => (
                          <button key={s.id} onMouseDown={() => { setDest(s.id); setDestSearch(s.name); setShowDestDropdown(false); }}
                            style={{ width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: '13px', color: '#cbd5e1', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Inter, system-ui, sans-serif' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#f1f5f9'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#cbd5e1'; }}
                          >
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, backgroundColor: LINE_COLORS[s.line].primary }} />
                            {s.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Swap */}
              <button onClick={handleSwap} title="Swap stations"
                style={{ width: '38px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '12px', cursor: 'pointer', color: '#94a3b8', alignSelf: 'stretch' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.14)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.35)'; e.currentTarget.style.color = '#a855f7'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <ArrowUpDown size={16} />
              </button>
            </div>

            {/* Find Route */}
            <button
              onClick={handleFindRoute}
              disabled={!source || !dest}
              style={{
                width: '100%', padding: '11px 16px',
                background: source && dest ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : 'rgba(109,40,217,0.35)',
                border: 'none', borderRadius: '12px',
                color: source && dest ? '#fff' : 'rgba(255,255,255,0.4)',
                fontSize: '14px', fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif',
                cursor: source && dest ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: source && dest ? '0 4px 18px rgba(124,58,237,0.35)' : 'none',
              }}
              onMouseEnter={e => { if (source && dest) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Search size={15} />
              Find Route
            </button>

            {/* Route result */}
            <AnimatePresence>
              {route && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: '14px', overflow: 'hidden' }}
                >
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px' }}>
                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                      {[
                        { value: route.path.length, label: 'Stations', color: '#a855f7' },
                        { value: route.estimatedTime, label: 'Minutes', color: '#06b6d4' },
                        { value: route.totalDistance, label: 'Km', color: '#ec4899' },
                      ].map(stat => (
                        <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <p style={{ color: stat.color, fontSize: '18px', fontWeight: 700, margin: 0 }}>{stat.value}</p>
                          <p style={{ color: '#64748b', fontSize: '11px', margin: '2px 0 0' }}>{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Interchanges */}
                    {route.interchanges.length > 0 && (
                      <div style={{ marginBottom: '10px', padding: '8px 12px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.18)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowRightLeft size={13} style={{ color: '#facc15', flexShrink: 0 }} />
                        <span style={{ color: '#facc15', fontSize: '12px', fontWeight: 500 }}>
                          {route.interchanges.length} interchange{route.interchanges.length > 1 ? 's' : ''}: {route.interchanges.map(id => STATIONS[id]?.name).join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Station list */}
                    <div className="custom-scrollbar" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {route.path.map((stationId, idx) => {
                        const station = STATIONS[stationId];
                        const color = LINE_COLORS[station.line];
                        const isFirst = idx === 0;
                        const isLast = idx === route.path.length - 1;
                        const isInterchange = route.interchanges.includes(stationId);
                        return (
                          <button key={`${stationId}-${idx}`} onClick={() => onStationFocus(stationId)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px', background: 'none', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '14px', flexShrink: 0 }}>
                              {!isFirst && <div style={{ width: '2px', height: '8px', background: 'rgba(255,255,255,0.12)', borderRadius: '1px' }} />}
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color.primary, border: isFirst || isLast ? '2px solid rgba(255,255,255,0.8)' : '2px solid transparent', boxShadow: isInterchange ? `0 0 8px ${color.primary}` : 'none', flexShrink: 0 }} />
                              {!isLast && <div style={{ width: '2px', height: '8px', background: 'rgba(255,255,255,0.12)', borderRadius: '1px' }} />}
                            </div>
                            <span style={{ fontSize: '12px', color: isFirst || isLast ? '#f1f5f9' : '#94a3b8', fontWeight: isFirst || isLast ? 600 : 400, flex: 1 }}>{station.name}</span>
                            {isInterchange && <ArrowRightLeft size={12} style={{ color: '#facc15', flexShrink: 0 }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
