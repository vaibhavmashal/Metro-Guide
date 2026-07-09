import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, Search, ArrowRightLeft, Clock, MapPin, X, ChevronDown, Navigation2 } from 'lucide-react';
import { STATIONS, LINES, LINE_COLORS } from '../data/metroData';
import { findRoute, type RouteResult } from '../utils/pathfinding';

interface RoutePlannerProps {
  onRouteCalculated: (route: RouteResult | null) => void;
  onStationFocus: (stationId: string) => void;
}

export default function RoutePlanner({ onRouteCalculated, onStationFocus }: RoutePlannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState('');
  const [dest, setDest] = useState('');
  const [sourceSearch, setSourceSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [route, setRoute] = useState<RouteResult | null>(null);

  const allStations = useMemo(() =>
    Object.values(STATIONS).sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const filteredSourceStations = useMemo(() =>
    allStations.filter(s => s.name.toLowerCase().includes(sourceSearch.toLowerCase())),
    [allStations, sourceSearch]
  );

  const filteredDestStations = useMemo(() =>
    allStations.filter(s => s.name.toLowerCase().includes(destSearch.toLowerCase())),
    [allStations, destSearch]
  );

  const handleFindRoute = () => {
    if (!source || !dest) return;
    const result = findRoute(source, dest);
    setRoute(result);
    onRouteCalculated(result);
  };

  const handleSwap = () => {
    const tmpId = source;
    const tmpSearch = sourceSearch;
    setSource(dest);
    setSourceSearch(destSearch);
    setDest(tmpId);
    setDestSearch(tmpSearch);
    setRoute(null);
    onRouteCalculated(null);
  };

  const handleClear = () => {
    setSource('');
    setDest('');
    setSourceSearch('');
    setDestSearch('');
    setRoute(null);
    onRouteCalculated(null);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
      {/* Toggle button */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setIsOpen(true)}
          className="glass-card px-4 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-white/15 transition-colors"
        >
          <Route className="w-4 h-4 text-purple-400" />
          <span className="text-white text-sm font-medium">Route Planner</span>
        </motion.button>
      )}

      {/* Route planner panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="glass-card p-4 w-[380px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-purple-400" />
                <h3 className="text-white text-sm font-semibold">Route Planner</h3>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleClear();
                }}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Station inputs */}
            <div className="flex items-stretch gap-2 mb-3">
              <div className="flex-1 space-y-2">
                {/* Source */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-green-400" />
                  <input
                    type="text"
                    placeholder="From station..."
                    value={sourceSearch}
                    onChange={(e) => {
                      setSourceSearch(e.target.value);
                      setShowSourceDropdown(true);
                      setSource('');
                    }}
                    onFocus={() => setShowSourceDropdown(true)}
                    onBlur={() => setTimeout(() => setShowSourceDropdown(false), 200)}
                    className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                  <AnimatePresence>
                    {showSourceDropdown && sourceSearch && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full mt-1 left-0 right-0 glass-card max-h-40 overflow-y-auto custom-scrollbar z-50"
                      >
                        {filteredSourceStations.map(s => (
                          <button
                            key={s.id}
                            onMouseDown={() => {
                              setSource(s.id);
                              setSourceSearch(s.name);
                              setShowSourceDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2 cursor-pointer"
                          >
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: LINE_COLORS[s.line].primary }}
                            />
                            {s.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Destination */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-red-400" />
                  <input
                    type="text"
                    placeholder="To station..."
                    value={destSearch}
                    onChange={(e) => {
                      setDestSearch(e.target.value);
                      setShowDestDropdown(true);
                      setDest('');
                    }}
                    onFocus={() => setShowDestDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
                    className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                  <AnimatePresence>
                    {showDestDropdown && destSearch && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full mt-1 left-0 right-0 glass-card max-h-40 overflow-y-auto custom-scrollbar z-50"
                      >
                        {filteredDestStations.map(s => (
                          <button
                            key={s.id}
                            onMouseDown={() => {
                              setDest(s.id);
                              setDestSearch(s.name);
                              setShowDestDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-2 cursor-pointer"
                          >
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: LINE_COLORS[s.line].primary }}
                            />
                            {s.name}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Swap button */}
              <button
                onClick={handleSwap}
                className="flex items-center justify-center w-9 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer self-stretch"
                title="Swap stations"
              >
                <ArrowRightLeft className="w-4 h-4 text-gray-400 rotate-90" />
              </button>
            </div>

            {/* Find route button */}
            <button
              onClick={handleFindRoute}
              disabled={!source || !dest}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Find Route
            </button>

            {/* Route result */}
            <AnimatePresence>
              {route && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="border-t border-white/10 pt-3">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-white/5 rounded-lg p-2 text-center">
                        <p className="text-purple-400 text-lg font-bold">{route.path.length}</p>
                        <p className="text-gray-500 text-xs">Stations</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 text-center">
                        <p className="text-cyan-400 text-lg font-bold">{route.estimatedTime}</p>
                        <p className="text-gray-500 text-xs">Minutes</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 text-center">
                        <p className="text-pink-400 text-lg font-bold">{route.totalDistance}</p>
                        <p className="text-gray-500 text-xs">Km</p>
                      </div>
                    </div>

                    {/* Interchanges */}
                    {route.interchanges.length > 0 && (
                      <div className="mb-3 px-2.5 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-center gap-1.5">
                          <ArrowRightLeft className="w-3.5 h-3.5 text-yellow-400" />
                          <span className="text-yellow-400 text-xs font-medium">
                            {route.interchanges.length} interchange{route.interchanges.length > 1 ? 's' : ''}: {route.interchanges.map(id => STATIONS[id]?.name).join(', ')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Station list */}
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                      {route.path.map((stationId, idx) => {
                        const station = STATIONS[stationId];
                        const color = LINE_COLORS[station.line];
                        const isFirst = idx === 0;
                        const isLast = idx === route.path.length - 1;
                        const isInterchange = route.interchanges.includes(stationId);

                        return (
                          <button
                            key={`${stationId}-${idx}`}
                            onClick={() => onStationFocus(stationId)}
                            className="w-full flex items-center gap-2.5 py-1.5 px-2 hover:bg-white/5 rounded-md transition-colors cursor-pointer"
                          >
                            {/* Timeline dot */}
                            <div className="flex flex-col items-center w-4">
                              {!isFirst && <div className="w-0.5 h-2 bg-gray-600" />}
                              <div
                                className={`w-3 h-3 rounded-full border-2 ${
                                  isFirst || isLast ? 'border-white' : 'border-transparent'
                                }`}
                                style={{
                                  backgroundColor: color.primary,
                                  boxShadow: isInterchange ? `0 0 8px ${color.primary}` : 'none',
                                }}
                              />
                              {!isLast && <div className="w-0.5 h-2 bg-gray-600" />}
                            </div>
                            <span className={`text-xs ${isFirst || isLast ? 'text-white font-medium' : 'text-gray-400'}`}>
                              {station.name}
                            </span>
                            {isInterchange && (
                              <ArrowRightLeft className="w-3 h-3 text-yellow-400 ml-auto" />
                            )}
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
