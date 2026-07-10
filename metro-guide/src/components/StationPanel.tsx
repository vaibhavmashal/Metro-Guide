import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';
import { CITY_CONFIGS, type CityConfig } from '../data/cityData';

interface StationPanelProps {
  onStationSelect: (stationId: string) => void;
  selectedStation: string | null;
  cityConfig?: CityConfig;
}

const isMobile = () => window.innerWidth < 640;

export default function StationPanel({
  onStationSelect,
  selectedStation,
  cityConfig = CITY_CONFIGS.pune,
}: StationPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [mobile, setMobile] = useState(isMobile);

  useEffect(() => {
    const handler = () => setMobile(isMobile());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Reset line filter when city changes
  useEffect(() => {
    setActiveFilter('all');
    setSearch('');
  }, [cityConfig.id]);

  const allStations = useMemo(() => {
    const stationMap = new Map<string, { id: string; name: string; line: string; lineName: string }>();
    Object.values(cityConfig.stations).forEach(station => {
      const displayName = station.name;
      const lineObj = cityConfig.lines.find(l => l.id === station.line);
      const lineName = lineObj ? lineObj.name + ' Line' : station.line;
      if (!stationMap.has(displayName)) {
        stationMap.set(displayName, {
          id: station.id,
          name: displayName,
          line: station.line,
          lineName,
        });
      }
    });
    return Array.from(stationMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [cityConfig]);

  const filteredStations = useMemo(() =>
    allStations.filter(station => {
      const matchesSearch = station.name.toLowerCase().includes(search.toLowerCase());
      const matchesLine = activeFilter === 'all' || station.line === activeFilter;
      return matchesSearch && matchesLine;
    }),
    [allStations, search, activeFilter]
  );

  /* Shared positions for collapsed button and open panel */
  const mobileStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '60px', // above mobile nav bar
    left: 0,
    right: 0,
    width: '100%',
    maxHeight: '60vh',
    zIndex: 25,
  };

  const desktopStyle: React.CSSProperties = {
    position: 'fixed',
    top: 16,
    right: 16,
    height: 'calc(100vh - 136px)', // leaves room at bottom for map controls
    width: '320px',
    zIndex: 20,
  };

  const panelStyle = mobile ? mobileStyle : desktopStyle;

  return (
    <>
      {/* Desktop-only collapsed toggle button */}
      <AnimatePresence>
        {!isOpen && !mobile && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed top-4 right-4 z-20 glass-card p-3.5 cursor-pointer hover:bg-white/10 transition-colors rounded-2xl shadow-xl"
            style={{
              background: 'rgba(22, 24, 40, 0.88)',
              backdropFilter: 'blur(36px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
            title="Open Stations"
          >
            <ChevronDown size={18} className="text-purple-400 transform -rotate-90" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Panel */}
      <AnimatePresence>
        {(isOpen || mobile) && (
          <motion.div
            initial={mobile ? { y: '100%', opacity: 0 } : { x: 360, opacity: 0 }}
            animate={mobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
            exit={mobile ? { y: '100%', opacity: 0 } : { x: 360, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="station-panel"
            style={{
              ...panelStyle,
              borderRadius: mobile ? '20px 20px 0 0' : '16px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Mobile drag handle */}
            {mobile && <div className="bottom-sheet-handle" style={{ marginTop: '10px' }} />}

            {/* Header section */}
            <div style={{ padding: mobile ? '12px 16px 10px' : '20px 20px 12px 20px' }}>
              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{
                    color: '#f1f5f9',
                    fontSize: mobile ? '12px' : '13px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    margin: 0,
                  }}>
                    STATIONS
                  </h2>
                  <span className="count-badge">{filteredStations.length}</span>
                </div>
                {!mobile && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="collapse-btn"
                    title="Collapse"
                  >
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '13px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'rgba(148,163,184,0.75)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search stations..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="station-search-input"
                  style={{
                    paddingLeft: '38px',
                    paddingRight: '12px',
                    paddingTop: '9px',
                    paddingBottom: '9px',
                  }}
                />
              </div>

              {/* Line filter buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {cityConfig.lines.map(line => {
                  const color    = cityConfig.lineColors[line.id] || { primary: '#a855f7' };
                  const isActive = activeFilter === line.id;
                  return (
                    <button
                      key={line.id}
                      onClick={() => setActiveFilter(activeFilter === line.id ? 'all' : line.id)}
                      className="line-filter-btn"
                      style={{ opacity: isActive || activeFilter === 'all' ? 1 : 0.45 }}
                    >
                      <span className="line-dot" style={{ backgroundColor: color.primary }} />
                      <span>{line.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Separator */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 16px 4px' }} />

            {/* Station list */}
            <div
              className="custom-scrollbar"
              style={{ flex: 1, overflowY: 'auto', padding: '6px 10px 16px' }}
            >
              {filteredStations.map(station => {
                const color      = cityConfig.lineColors[station.line] || { primary: '#a855f7' };
                const isSelected = selectedStation === station.id;
                return (
                  <motion.button
                    key={station.id}
                    onClick={() => onStationSelect(station.id)}
                    className={`station-item${isSelected ? ' selected' : ''}`}
                    style={{ padding: '9px 12px', marginBottom: '2px' }}
                    whileHover={!isSelected ? { x: 2 } : {}}
                    transition={{ duration: 0.1 }}
                  >
                    <div className="station-dot" style={{ borderColor: color.primary }}>
                      <span className="dot-inner" style={{ backgroundColor: color.primary }} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{
                        color: '#f1f5f9',
                        fontSize: '14px',
                        fontWeight: isSelected ? 600 : 500,
                        lineHeight: 1.3,
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {station.name}
                      </p>
                      <p style={{
                        color: 'rgba(148,163,184,0.7)',
                        fontSize: '11px',
                        lineHeight: 1.2,
                        margin: '2px 0 0',
                      }}>
                        {station.lineName}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
