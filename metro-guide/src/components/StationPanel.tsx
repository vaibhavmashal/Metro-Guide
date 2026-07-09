import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import { STATIONS, LINES, LINE_COLORS, type MetroLine } from '../data/metroData';

interface StationPanelProps {
  onStationSelect: (stationId: string) => void;
  selectedStation: string | null;
}

export default function StationPanel({ onStationSelect, selectedStation }: StationPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<MetroLine | 'all'>('all');

  const allStations = useMemo(() => {
    const stationMap = new Map<string, { id: string; name: string; line: MetroLine; lineName: string }>();

    Object.values(STATIONS).forEach(station => {
      const displayName = station.name;
      if (!stationMap.has(displayName)) {
        let lineName = 'Purple Line';
        if (station.line === 'aqua') lineName = 'Aqua Line';
        else if (station.line === 'line3') lineName = 'Line 3';

        stationMap.set(displayName, {
          id: station.id,
          name: displayName,
          line: station.line,
          lineName,
        });
      }
    });

    return Array.from(stationMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredStations = useMemo(() => {
    return allStations.filter(station => {
      const matchesSearch = station.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === 'all' || station.line === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [allStations, search, activeFilter]);

  return (
    <>
      {/* Collapsed toggle button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed top-4 right-4 z-20 glass-card p-3.5 cursor-pointer hover:bg-white/10 transition-colors rounded-2xl shadow-xl"
            title="Open stations panel"
          >
            <ChevronRight className="w-5 h-5 text-white rotate-180" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Station Sidebar Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed top-4 right-4 h-[calc(100vh-32px)] w-[336px] z-20 station-panel rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header section */}
            <div className="p-5 pb-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-white text-[15px] font-bold tracking-wider uppercase">
                    STATIONS
                  </h2>
                  <span className="bg-white/10 text-gray-300 text-[12px] font-medium px-2.5 py-0.5 rounded-full">
                    50
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-gray-400 hover:text-white"
                  title="Collapse"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Search Box */}
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
              </div>

              {/* Line Legend */}
              <div className="flex items-center gap-5 pt-1 pb-1">
                {LINES.map(line => {
                  const color = LINE_COLORS[line.id];
                  const isActive = activeFilter === line.id;
                  const displayName = line.id === 'purple' ? 'Purple' : line.id === 'aqua' ? 'Aqua' : 'Line 3';
                  return (
                    <button
                      key={line.id}
                      onClick={() => setActiveFilter(activeFilter === line.id ? 'all' : line.id)}
                      className={`flex items-center gap-2 cursor-pointer transition-opacity ${
                        isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border-2"
                        style={{
                          borderColor: color.primary,
                          backgroundColor: color.primary,
                        }}
                      />
                      <span className="text-[12px] text-gray-300 font-medium">
                        {displayName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subtle separator */}
            <div className="h-px bg-white/10 mx-5 mb-2" />

            {/* Scrollable station list exactly like reference */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
              {filteredStations.map((station) => {
                const color = LINE_COLORS[station.line];
                const isSelected = selectedStation === station.id;

                if (isSelected) {
                  return (
                    <motion.button
                      key={station.id}
                      onClick={() => onStationSelect(station.id)}
                      className="w-full text-left px-4 py-3 my-1.5 rounded-xl bg-purple-500/20 border border-purple-500/45 flex items-center gap-3.5 transition-all cursor-pointer shadow-lg"
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.1 }}
                    >
                      {/* Selected circle icon matching reference */}
                      <div className="flex-shrink-0">
                        <div
                          className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                          style={{ borderColor: color.primary }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: color.primary }}
                          />
                        </div>
                      </div>

                      {/* Station Info */}
                      <div className="min-w-0">
                        <p className="text-white text-[14px] font-semibold leading-tight">
                          {station.name}
                        </p>
                        <p className="text-gray-400 text-[12px] mt-0.5 leading-tight">
                          {station.lineName}
                        </p>
                      </div>
                    </motion.button>
                  );
                }

                return (
                  <motion.button
                    key={station.id}
                    onClick={() => onStationSelect(station.id)}
                    className="w-full text-left px-4 py-3 my-0.5 rounded-xl hover:bg-white/[0.04] flex items-center gap-3.5 transition-all cursor-pointer"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.1 }}
                  >
                    {/* Unselected circular ring icon matching reference */}
                    <div className="flex-shrink-0">
                      <div
                        className="w-4 h-4 rounded-full border-2"
                        style={{
                          borderColor: color.primary,
                          backgroundColor: 'transparent',
                        }}
                      />
                    </div>

                    {/* Station Info */}
                    <div className="min-w-0">
                      <p className="text-white text-[14px] font-medium leading-tight">
                        {station.name}
                      </p>
                      <p className="text-gray-400 text-[12px] mt-0.5 leading-tight">
                        {station.lineName}
                      </p>
                    </div>
                  </motion.button>
                );
              })}

              {filteredStations.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No stations found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
