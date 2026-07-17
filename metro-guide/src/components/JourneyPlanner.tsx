import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation, ArrowUpDown, X, MapPin, Loader2,
  Footprints, Train, ArrowRightLeft, Clock, Route, Sparkles,
  Car, Bus,
} from 'lucide-react';
import { CITY_CONFIGS, type CityConfig } from '../data/cityData';
import {
  searchLocations, planJourney,
  type LocationResult, type JourneyResult,
} from '../utils/journeyApi';
import { FormattedMessage } from './FormattedMessage';

// ── Types ───────────────────────────────────────────────────

interface JourneyLocation {
  lat: number;
  lng: number;
  name: string;
  displayName: string;
}

interface JourneyPlannerProps {
  onJourneyResult: (result: JourneyResult | null) => void;
  cityConfig?: CityConfig;
}

const getIsMobile = () => window.innerWidth < 640;

// ── LINE COLORS (duplicated small map for display) ──────────
const LINE_DISPLAY_COLORS: Record<string, string> = {
  purple: '#a855f7', aqua: '#06b6d4', line3: '#ec4899',
  blr_purple: '#9b30ff', blr_green: '#22c55e', blr_yellow: '#f59e0b',
};

// ── Component ───────────────────────────────────────────────

export default function JourneyPlanner({
  onJourneyResult,
  cityConfig = CITY_CONFIGS.pune,
}: JourneyPlannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mobile, setMobile] = useState(getIsMobile);

  // Location state
  const [sourceLocation, setSourceLocation] = useState<JourneyLocation | null>(null);
  const [destLocation, setDestLocation] = useState<JourneyLocation | null>(null);
  const [sourceSearch, setSourceSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [sourceResults, setSourceResults] = useState<LocationResult[]>([]);
  const [destResults, setDestResults] = useState<LocationResult[]>([]);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [activeSourceIndex, setActiveSourceIndex] = useState(-1);
  const [activeDestIndex, setActiveDestIndex] = useState(-1);

  // Journey state
  const [journey, setJourney] = useState<JourneyResult | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSourceMode, setSelectedSourceMode] = useState<'walking' | 'vehicle' | 'public_transport'>('walking');
  const [selectedDestMode, setSelectedDestMode] = useState<'walking' | 'vehicle' | 'public_transport'>('walking');

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (journey) {
      setSelectedSourceMode('walking');
      setSelectedDestMode('walking');
    }
  }, [journey]);

  useEffect(() => {
    const handler = () => setMobile(getIsMobile());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Clear when city changes
  useEffect(() => {
    setSourceLocation(null);
    setDestLocation(null);
    setSourceSearch('');
    setDestSearch('');
    setJourney(null);
    setError(null);
    onJourneyResult(null);
  }, [cityConfig.id]);

  // Debounced search
  const handleSearch = useCallback((query: string, field: 'source' | 'dest') => {
    if (field === 'source') {
      setSourceSearch(query);
      setSourceLocation(null);
      setActiveSourceIndex(-1);
    } else {
      setDestSearch(query);
      setDestLocation(null);
      setActiveDestIndex(-1);
    }

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (query.length < 2) {
      if (field === 'source') {
        setSourceResults([]);
        setShowSourceDropdown(false);
      } else {
        setDestResults([]);
        setShowDestDropdown(false);
      }
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      const results = await searchLocations(query, cityConfig.id);
      if (field === 'source') {
        setSourceResults(results);
        setShowSourceDropdown(true);
      } else {
        setDestResults(results);
        setShowDestDropdown(true);
      }
    }, 250);
  }, [cityConfig.id]);

  const handleSelectLocation = useCallback(
    (result: LocationResult, field: 'source' | 'dest') => {
      const loc: JourneyLocation = {
        lat: result.lat,
        lng: result.lng,
        name: result.shortName,
        displayName: result.displayName,
      };
      if (field === 'source') {
        setSourceLocation(loc);
        setSourceSearch(result.shortName);
        setShowSourceDropdown(false);
        setActiveSourceIndex(-1);
      } else {
        setDestLocation(loc);
        setDestSearch(result.shortName);
        setShowDestDropdown(false);
        setActiveDestIndex(-1);
      }
    }, []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, field: 'source' | 'dest') => {
      const results = field === 'source' ? sourceResults : destResults;
      const showDropdown = field === 'source' ? showSourceDropdown : showDestDropdown;
      const activeIdx = field === 'source' ? activeSourceIndex : activeDestIndex;
      const setActiveIdx = field === 'source' ? setActiveSourceIndex : setActiveDestIndex;

      if (!showDropdown || results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((prev) => (prev + 1 < results.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter' && activeIdx >= 0 && activeIdx < results.length) {
        e.preventDefault();
        handleSelectLocation(results[activeIdx], field);
      } else if (e.key === 'Escape') {
        if (field === 'source') setShowSourceDropdown(false);
        else setShowDestDropdown(false);
      }
    },
    [sourceResults, destResults, showSourceDropdown, showDestDropdown, activeSourceIndex, activeDestIndex, handleSelectLocation]
  );

  const handleSwap = useCallback(() => {
    const tmpLoc = sourceLocation;
    const tmpSearch = sourceSearch;
    setSourceLocation(destLocation);
    setSourceSearch(destSearch);
    setDestLocation(tmpLoc);
    setDestSearch(tmpSearch);
    setJourney(null);
    onJourneyResult(null);
  }, [sourceLocation, destLocation, sourceSearch, destSearch, onJourneyResult]);

  const handleClear = useCallback(() => {
    setSourceLocation(null);
    setDestLocation(null);
    setSourceSearch('');
    setDestSearch('');
    setJourney(null);
    setError(null);
    onJourneyResult(null);
  }, [onJourneyResult]);

  const handlePlanJourney = useCallback(async () => {
    if (!sourceLocation || !destLocation) return;
    setIsPlanning(true);
    setError(null);
    setJourney(null);

    try {
      const result = await planJourney(
        sourceLocation.lat,
        sourceLocation.lng,
        destLocation.lat,
        destLocation.lng,
        sourceLocation.name,
        destLocation.name,
        cityConfig.id,
      );
      setJourney(result);
      onJourneyResult(result);
    } catch (e: any) {
      setError(e.message || 'Failed to plan journey');
    } finally {
      setIsPlanning(false);
    }
  }, [sourceLocation, destLocation, cityConfig.id, onJourneyResult]);

  const effectiveOpen = mobile ? true : isOpen;

  // ── Styles ──────────────────────────────────────────────────

  const mobileContainerStyle: React.CSSProperties = {
    position: 'fixed', bottom: '60px', left: 0, right: 0, width: '100%',
    maxHeight: '70vh', zIndex: 25, overflowY: 'auto',
  };
  const desktopContainerStyle: React.CSSProperties = {
    position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
    width: isOpen ? '380px' : 'auto', maxHeight: 'calc(100vh - 100px)', zIndex: 30,
  };
  const cardStyle: React.CSSProperties = {
    background: 'rgba(22, 24, 40, 0.92)',
    backdropFilter: 'blur(36px) saturate(180%)', WebkitBackdropFilter: 'blur(36px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: mobile ? '20px 20px 0 0' : '18px',
    padding: mobile ? '12px 16px 14px' : '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
    display: 'flex', flexDirection: 'column' as const,
    maxHeight: mobile ? '78vh' : 'calc(100vh - 100px)', overflow: 'hidden',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px 9px 32px',
    background: 'rgba(10, 10, 26, 0.65)', border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '10px', color: '#f1f5f9', fontSize: '13px', outline: 'none',
    fontFamily: 'Inter, system-ui, sans-serif', transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box' as const,
  };
  const dotStyle = (color: string): React.CSSProperties => ({
    position: 'absolute' as const, left: '12px', top: '50%', transform: 'translateY(-50%)',
    width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color,
    boxShadow: `0 0 6px ${color}`, pointerEvents: 'none' as const,
  });
  const dropdownStyle: React.CSSProperties = {
    position: 'absolute' as const, top: '100%', left: 0, right: 0, marginTop: '4px',
    background: 'rgba(18, 20, 36, 0.97)', backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
    maxHeight: '180px', overflowY: 'auto' as const, zIndex: 50,
    boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
  };

  return (
    <div style={mobile ? mobileContainerStyle : desktopContainerStyle}>
      {/* Desktop Toggle */}
      {!mobile && !isOpen && (
        <motion.button
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px',
            background: 'rgba(22, 24, 40, 0.92)', backdropFilter: 'blur(36px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.14)', borderRadius: '24px',
            cursor: 'pointer', color: '#f1f5f9', fontSize: '14px', fontWeight: 600,
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: '0 12px 36px rgba(0,0,0,0.55), 0 0 20px rgba(6,182,212,0.15)',
          }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
        >
          <Navigation size={18} style={{ color: '#22d3ee' }} />
          <span>Journey Planner</span>
        </motion.button>
      )}

      {/* Expanded Planner */}
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

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation size={16} style={{ color: '#22d3ee' }} />
                <span style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Journey Planner
                </span>
              </div>
              {!mobile && (
                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Inputs */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch', flexShrink: 0 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Source */}
                <div style={{ position: 'relative' }}>
                  <span style={dotStyle('#4ade80')} />
                  <input
                    type="text" placeholder="Search source location..."
                    value={sourceSearch}
                    onChange={e => handleSearch(e.target.value, 'source')}
                    onKeyDown={e => handleKeyDown(e, 'source')}
                    onFocus={() => sourceResults.length > 0 && setShowSourceDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSourceDropdown(false), 200)}
                    style={{
                      ...inputStyle,
                      paddingRight: sourceSearch ? '32px' : '12px',
                    }}
                  />
                  {sourceSearch && (
                    <button
                      onClick={() => {
                        setSourceSearch('');
                        setSourceLocation(null);
                        setSourceResults([]);
                      }}
                      title="Clear"
                      style={{
                        position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px',
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                  <AnimatePresence>
                    {showSourceDropdown && sourceResults.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} style={dropdownStyle} className="custom-scrollbar">
                        {sourceResults.map((r, i) => (
                          <button key={i} onMouseDown={() => handleSelectLocation(r, 'source')}
                            style={{
                              width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: '12px',
                              color: '#f1f5f9', background: i === activeSourceIndex ? 'rgba(34,211,238,0.12)' : 'none',
                              border: 'none', borderBottom: i < sourceResults.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                              fontFamily: 'Inter, system-ui, sans-serif', transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = i === activeSourceIndex ? 'rgba(34,211,238,0.12)' : 'none'; }}
                          >
                            {r.type === 'station' ? (
                              <Train size={15} style={{ flexShrink: 0, color: '#22d3ee' }} />
                            ) : (
                              <MapPin size={15} style={{ flexShrink: 0, color: '#4ade80' }} />
                            )}
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <div style={{ fontWeight: 600, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {r.shortName}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                                {r.displayName}
                              </div>
                            </div>
                            {r.category && (
                              <span style={{
                                fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                                background: r.type === 'station' ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.06)',
                                color: r.type === 'station' ? '#22d3ee' : '#94a3b8',
                                flexShrink: 0, fontWeight: 500,
                              }}>
                                {r.category}
                              </span>
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Destination */}
                <div style={{ position: 'relative' }}>
                  <span style={dotStyle('#f87171')} />
                  <input
                    type="text" placeholder="Search destination..."
                    value={destSearch}
                    onChange={e => handleSearch(e.target.value, 'dest')}
                    onKeyDown={e => handleKeyDown(e, 'dest')}
                    onFocus={() => destResults.length > 0 && setShowDestDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
                    style={{
                      ...inputStyle,
                      paddingRight: destSearch ? '32px' : '12px',
                    }}
                  />
                  {destSearch && (
                    <button
                      onClick={() => {
                        setDestSearch('');
                        setDestLocation(null);
                        setDestResults([]);
                      }}
                      title="Clear"
                      style={{
                        position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px',
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                  <AnimatePresence>
                    {showDestDropdown && destResults.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} style={dropdownStyle} className="custom-scrollbar">
                        {destResults.map((r, i) => (
                          <button key={i} onMouseDown={() => handleSelectLocation(r, 'dest')}
                            style={{
                              width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: '12px',
                              color: '#f1f5f9', background: i === activeDestIndex ? 'rgba(34,211,238,0.12)' : 'none',
                              border: 'none', borderBottom: i < destResults.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                              fontFamily: 'Inter, system-ui, sans-serif', transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = i === activeDestIndex ? 'rgba(34,211,238,0.12)' : 'none'; }}
                          >
                            {r.type === 'station' ? (
                              <Train size={15} style={{ flexShrink: 0, color: '#22d3ee' }} />
                            ) : (
                              <MapPin size={15} style={{ flexShrink: 0, color: '#f87171' }} />
                            )}
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <div style={{ fontWeight: 600, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {r.shortName}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                                {r.displayName}
                              </div>
                            </div>
                            {r.category && (
                              <span style={{
                                fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                                background: r.type === 'station' ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.06)',
                                color: r.type === 'station' ? '#22d3ee' : '#94a3b8',
                                flexShrink: 0, fontWeight: 500,
                              }}>
                                {r.category}
                              </span>
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Swap */}
              <button onClick={handleSwap} title="Swap locations"
                style={{ width: '38px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '12px', cursor: 'pointer', color: '#94a3b8', alignSelf: 'stretch' }}
              >
                <ArrowUpDown size={16} />
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexShrink: 0 }}>
              <button
                onClick={handlePlanJourney}
                disabled={!sourceLocation || !destLocation || isPlanning}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                  background: sourceLocation && destLocation && !isPlanning
                    ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(255,255,255,0.06)',
                  color: sourceLocation && destLocation && !isPlanning ? '#fff' : '#64748b',
                  fontSize: '13px', fontWeight: 600,
                  cursor: sourceLocation && destLocation && !isPlanning ? 'pointer' : 'not-allowed',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                {isPlanning ? (
                  <><Loader2 size={14} className="animate-spin" /> Planning...</>
                ) : (
                  <><Route size={14} /> Plan Journey</>
                )}
              </button>
              {(sourceLocation || destLocation || journey) && (
                <button onClick={handleClear} style={{
                  padding: '10px 14px', borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.12)', background: 'transparent',
                  color: '#94a3b8', fontSize: '13px', cursor: 'pointer',
                }}>
                  Clear
                </button>
              )}
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '12px', flexShrink: 0 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Journey Result */}
            <AnimatePresence>
              {journey && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ marginTop: '14px', overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
                >
                  <div className="custom-scrollbar" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px', overflowY: 'auto', flex: 1, minHeight: 0, paddingRight: '4px' }}>
                    {/* Dynamic Mode Calculations */}
                    {(() => {
                      const srcOpt = journey.source_options?.find(o => o.mode === selectedSourceMode) || {
                        mode: 'walking',
                        mode_name: 'Walking',
                        distance_meters: journey.source_walking.distance_meters,
                        duration_minutes: journey.source_walking.duration_minutes,
                        fare_estimate: 'Free',
                        description: '',
                      };
                      const dstOpt = journey.dest_options?.find(o => o.mode === selectedDestMode) || {
                        mode: 'walking',
                        mode_name: 'Walking',
                        distance_meters: journey.dest_walking.distance_meters,
                        duration_minutes: journey.dest_walking.duration_minutes,
                        fare_estimate: 'Free',
                        description: '',
                      };
                      const dynamicTotalMinutes = Math.round(srcOpt.duration_minutes + journey.metro_time_minutes + dstOpt.duration_minutes);

                      const getModeIcon = (mode: string) => {
                        if (mode === 'vehicle') return <Car size={13} />;
                        if (mode === 'public_transport') return <Bus size={13} />;
                        return <Footprints size={13} />;
                      };

                      return (
                        <>
                          {/* Stats */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                            {[
                              { icon: <Train size={14} />, value: journey.total_stations, label: 'Stations', color: '#a855f7' },
                              { icon: <Clock size={14} />, value: dynamicTotalMinutes, label: 'Minutes', color: '#06b6d4' },
                              { icon: <Route size={14} />, value: journey.metro_distance_km, label: 'Km', color: '#ec4899' },
                            ].map(stat => (
                              <div key={stat.label} style={{
                                background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px 8px',
                                textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)',
                              }}>
                                <div style={{ color: stat.color, marginBottom: '2px', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
                                <p style={{ color: stat.color, fontSize: '18px', fontWeight: 700, margin: 0 }}>{stat.value}</p>
                                <p style={{ color: '#64748b', fontSize: '10px', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                              </div>
                            ))}
                          </div>

                          {/* Journey Timeline */}
                          <div className="custom-scrollbar" style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                            {/* First Mile to source station */}
                            <div style={{ marginBottom: '8px' }}>
                              <JourneyStep
                                icon={getModeIcon(selectedSourceMode)}
                                iconColor="#4ade80"
                                title={`${srcOpt.mode_name} to ${journey.source_station.name}`}
                                subtitle={`${Math.round(srcOpt.distance_meters)}m · ${Math.round(srcOpt.duration_minutes)} min${srcOpt.fare_estimate && srcOpt.fare_estimate !== 'Free' ? ` · ${srcOpt.fare_estimate}` : ''}`}
                                lineColor="#4ade80"
                                isFirst
                              />
                              {journey.source_options && journey.source_options.length > 0 && (
                                <div style={{ display: 'flex', gap: '4px', paddingLeft: '32px', marginTop: '-4px', marginBottom: '6px' }}>
                                  {journey.source_options.map(o => (
                                    <button
                                      key={o.mode}
                                      onClick={() => setSelectedSourceMode(o.mode as any)}
                                      style={{
                                        padding: '4px 8px', borderRadius: '6px', border: '1px solid',
                                        borderColor: selectedSourceMode === o.mode ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.08)',
                                        background: selectedSourceMode === o.mode ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.03)',
                                        color: selectedSourceMode === o.mode ? '#4ade80' : '#94a3b8',
                                        fontSize: '11px', fontWeight: selectedSourceMode === o.mode ? 600 : 400,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                      }}
                                    >
                                      {getModeIcon(o.mode)}
                                      <span>{o.mode === 'public_transport' ? 'Bus' : o.mode === 'vehicle' ? 'Auto/Bike' : 'Walk'}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Metro segments */}
                            {journey.metro_segments.map((seg, i) => (
                              <JourneyStep
                                key={i}
                                icon={i > 0 ? <ArrowRightLeft size={13} /> : <Train size={13} />}
                                iconColor={LINE_DISPLAY_COLORS[seg.line] || '#a855f7'}
                                title={i === 0 ? `Board ${seg.line_name}` : `Change to ${seg.line_name}`}
                                subtitle={`${seg.direction} · ${seg.station_count} station${seg.station_count > 1 ? 's' : ''}`}
                                lineColor={LINE_DISPLAY_COLORS[seg.line] || '#a855f7'}
                                badge={i > 0 ? 'Interchange' : undefined}
                              />
                            ))}

                            {/* Exit */}
                            <JourneyStep
                              icon={<MapPin size={13} />}
                              iconColor="#f87171"
                              title={`Exit at ${journey.dest_station.name}`}
                              subtitle="Metro Station"
                              lineColor="#f87171"
                            />

                            {/* Last Mile to destination */}
                            <div style={{ marginTop: '4px' }}>
                              <JourneyStep
                                icon={getModeIcon(selectedDestMode)}
                                iconColor="#f87171"
                                title={`${dstOpt.mode_name} to destination`}
                                subtitle={`${Math.round(dstOpt.distance_meters)}m · ${Math.round(dstOpt.duration_minutes)} min${dstOpt.fare_estimate && dstOpt.fare_estimate !== 'Free' ? ` · ${dstOpt.fare_estimate}` : ''}`}
                                lineColor="transparent"
                                isLast
                              />
                              {journey.dest_options && journey.dest_options.length > 0 && (
                                <div style={{ display: 'flex', gap: '4px', paddingLeft: '32px', marginTop: '-4px' }}>
                                  {journey.dest_options.map(o => (
                                    <button
                                      key={o.mode}
                                      onClick={() => setSelectedDestMode(o.mode as any)}
                                      style={{
                                        padding: '4px 8px', borderRadius: '6px', border: '1px solid',
                                        borderColor: selectedDestMode === o.mode ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.08)',
                                        background: selectedDestMode === o.mode ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.03)',
                                        color: selectedDestMode === o.mode ? '#f87171' : '#94a3b8',
                                        fontSize: '11px', fontWeight: selectedDestMode === o.mode ? 600 : 400,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                      }}
                                    >
                                      {getModeIcon(o.mode)}
                                      <span>{o.mode === 'public_transport' ? 'Bus' : o.mode === 'vehicle' ? 'Auto/Bike' : 'Walk'}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Time Summary */}
                          <div style={{
                            marginTop: '12px', padding: '10px 14px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(59,130,246,0.08))',
                            border: '1px solid rgba(6,182,212,0.15)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Clock size={13} style={{ color: '#22d3ee' }} />
                              <span style={{ color: '#94a3b8', fontSize: '12px' }}>Total Journey Time</span>
                            </div>
                            <span style={{ color: '#22d3ee', fontSize: '15px', fontWeight: 700 }}>
                              {dynamicTotalMinutes} min
                            </span>
                          </div>
                        </>
                      );
                    })()}

                    {/* AI Summary */}
                    {journey.ai_summary && (
                      <div style={{
                        marginTop: '12px', padding: '12px 14px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(79,70,229,0.06))',
                        border: '1px solid rgba(124,58,237,0.15)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <Sparkles size={13} style={{ color: '#c084fc' }} />
                          <span style={{ color: '#c084fc', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            AI Guide
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', lineHeight: '1.5', color: '#e2e8f0' }}>
                          <FormattedMessage text={journey.ai_summary} isUser={false} />
                        </div>
                      </div>
                    )}
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

// ── Journey Step Sub-component ───────────────────────────────

function JourneyStep({
  icon,
  iconColor,
  title,
  subtitle,
  lineColor,
  badge,
  isFirst,
  isLast,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  subtitle: string;
  lineColor: string;
  badge?: string;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: '10px', position: 'relative', minHeight: '44px' }}>
      {/* Timeline column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px', flexShrink: 0 }}>
        {!isFirst && (
          <div style={{ width: '2px', height: '8px', background: 'rgba(255,255,255,0.12)', borderRadius: '1px' }} />
        )}
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%',
          background: `${iconColor}18`, border: `2px solid ${iconColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: iconColor, flexShrink: 0,
        }}>
          {icon}
        </div>
        {!isLast && (
          <div style={{
            width: '2px', flex: 1, minHeight: '12px',
            background: lineColor === 'transparent' ? 'transparent' : `linear-gradient(to bottom, ${lineColor}60, ${lineColor}20)`,
            borderRadius: '1px',
          }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: isLast ? '0' : '4px', paddingTop: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: 600 }}>{title}</span>
          {badge && (
            <span style={{
              fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
              padding: '2px 6px', borderRadius: '6px',
              background: 'rgba(234,179,8,0.1)', color: '#facc15', border: '1px solid rgba(234,179,8,0.2)',
            }}>
              {badge}
            </span>
          )}
        </div>
        <span style={{ color: '#64748b', fontSize: '11px' }}>{subtitle}</span>
      </div>
    </div>
  );
}
