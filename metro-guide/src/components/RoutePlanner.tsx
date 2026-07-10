import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, ArrowUpDown, ArrowRightLeft, X } from 'lucide-react';
import { CITY_CONFIGS, type CityConfig } from '../data/cityData';
import { findRoute, type RouteResult } from '../utils/pathfinding';

interface RoutePlannerProps {
  onRouteCalculated: (route: RouteResult | null) => void;
  onStationFocus: (stationId: string) => void;
  cityConfig?: CityConfig;
}

const getIsMobile = () => window.innerWidth < 640;

export default function RoutePlanner({
  onRouteCalculated,
  onStationFocus,
  cityConfig = CITY_CONFIGS.pune,
}: RoutePlannerProps) {
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

  // Clear planner when city changes
  useEffect(() => {
    setSource(''); setDest('');
    setSourceSearch(''); setDestSearch('');
    setRoute(null);
    onRouteCalculated(null);
  }, [cityConfig.id]);

  // On mobile the parent controls visibility via tab switching — always show
  const effectiveOpen = mobile ? true : isOpen;

  const allStations = useMemo(() =>
    Object.values(cityConfig.stations).sort((a, b) => a.name.localeCompare(b.name)),
    [cityConfig]
  );

  const filteredSourceStations = useMemo(() =>
    allStations.filter(s => s.name.toLowerCase().includes(sourceSearch.toLowerCase())),
    [allStations, sourceSearch]);

  const filteredDestStations = useMemo(() =>
    allStations.filter(s => s.name.toLowerCase().includes(destSearch.toLowerCase())),
    [allStations, destSearch]);

  const handleFindRoute = () => {
    if (!source || !dest) return;
    const result = findRoute(source, dest, cityConfig.stations);
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

  /* Responsive styles */
  const mobileContainerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '60px',
    left: 0,
    right: 0,
    width: '100%',
    maxHeight: '60vh',
    zIndex: 25,
  };

  const desktopContainerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: isOpen ? '340px' : 'auto',
    zIndex: 30,
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(22, 24, 40, 0.88)',
    backdropFilter: 'blur(36px) saturate(180%)',
    WebkitBackdropFilter: 'blur(36px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: mobile ? '20px 20px 0 0' : '18px',
    padding: mobile ? '12px 16px 14px' : '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px 8px 32px',
    background: 'rgba(10, 10, 26, 0.65)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'Inter, system-ui, sans-serif',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
  };

  const dotStyle = (color: string): React.CSSProperties => ({
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: color,
    boxShadow: `0 0 6px ${color}`,
    pointerEvents: 'none',
  });

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    background: 'rgba(18, 20, 36, 0.95)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    maxHeight: '180px',
    overflowY: 'auto',
    zIndex: 50,
    boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
  };

  return (
    <div style={mobile ? mobileContainerStyle : desktopContainerStyle}>
      {/* Desktop Toggle Button */}
      {!mobile && !isOpen && (
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 22px',
            background: 'rgba(22, 24, 40, 0.92)',
            backdropFilter: 'blur(36px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '24px',
            cursor: 'pointer',
            color: '#f1f5f9',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: '0 12px 36px rgba(0,0,0,0.55), 0 0 20px rgba(34, 211, 238, 0.15)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
        >
          <Route size={18} style={{ color: '#22d3ee' }} />
          <span>Route Planner</span>
        </motion.button>
      )}

      {/* Expanded Planner Card */}
      <AnimatePresence>
        {effectiveOpen && (
          <motion.div
            initial={mobile ? { y: '100%', opacity: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
            animate={mobile ? { y: 0, opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={mobile ? { y: '100%', opacity: 0 } : { opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={cardStyle}
          >
            {mobile && <div className="bottom-sheet-handle" style={{ marginTop: '4px', marginBottom: '10px' }} />}

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Route size={16} style={{ color: '#22d3ee' }} />
                <span style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Route Planner</span>
              </div>
              {!mobile && (
                <button
                  onClick={() => setIsOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Source / Destination Inputs */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, backgroundColor: (cityConfig.lineColors[s.line] || { primary: '#a855f7' }).primary }} />
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
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, backgroundColor: (cityConfig.lineColors[s.line] || { primary: '#a855f7' }).primary }} />
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
              >
                <ArrowUpDown size={16} />
              </button>
            </div>

            {/* Find Route Button */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={handleFindRoute}
                disabled={!source || !dest}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '10px',
                  border: 'none',
                  background: source && dest ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(255,255,255,0.06)',
                  color: source && dest ? '#fff' : '#64748b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: source && dest ? 'pointer' : 'not-allowed',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  transition: 'opacity 0.15s',
                }}
              >
                Find Route
              </button>
              {(source || dest || route) && (
                <button
                  onClick={handleClear}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              )}
            </div>

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
                          {route.interchanges.length} interchange{route.interchanges.length > 1 ? 's' : ''}: {route.interchanges.map(id => cityConfig.stations[id]?.name).join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Station list */}
                    <div className="custom-scrollbar" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                      {route.path.map((stationId, idx) => {
                        const station = cityConfig.stations[stationId];
                        if (!station) return null;
                        const color = cityConfig.lineColors[station.line] || { primary: '#a855f7' };
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
