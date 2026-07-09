import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, ArrowRightLeft, Wifi, Car, Accessibility, Clock, Navigation } from 'lucide-react';
import { STATIONS, LINES, LINE_COLORS } from '../data/metroData';

interface StationDetailProps {
  stationId: string | null;
  onClose: () => void;
  onNavigate: (stationId: string) => void;
}

const FACILITY_ICONS: Record<string, React.ReactNode> = {
  Parking: <Car className="w-3.5 h-3.5" />,
  Lift: <Accessibility className="w-3.5 h-3.5" />,
  Escalator: <Accessibility className="w-3.5 h-3.5" />,
  Restrooms: <MapPin className="w-3.5 h-3.5" />,
  'Ticket Counter': <Clock className="w-3.5 h-3.5" />,
  Interchange: <ArrowRightLeft className="w-3.5 h-3.5" />,
  WiFi: <Wifi className="w-3.5 h-3.5" />,
};

export default function StationDetail({ stationId, onClose, onNavigate }: StationDetailProps) {
  if (!stationId) return null;
  const station = STATIONS[stationId];
  if (!station) return null;

  const line = LINES.find(l => l.id === station.line);
  const color = LINE_COLORS[station.line];

  const connectedStations = station.connectedStations
    .map(id => STATIONS[id])
    .filter(Boolean);

  return (
    <AnimatePresence>
      <motion.div
        key={stationId}
        initial={{ opacity: 0, x: -40, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -40, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 z-30 w-80 glass-card overflow-hidden"
      >
        {/* Header bar with line color */}
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${color.primary}, ${color.glow})` }}
        />

        <div className="p-4">
          {/* Title row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: color.primary,
                  boxShadow: `0 0 12px ${color.primary}80`,
                }}
              />
              <div>
                <h3 className="text-white font-semibold text-base leading-tight">
                  {station.name}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: color.glow }}>
                  {line?.name || station.line}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Interchange badge */}
          {station.isInterchange && (
            <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <ArrowRightLeft className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-medium">
                Interchange Station — {station.interchangeLines?.map(l =>
                  LINES.find(li => li.id === l)?.name
                ).join(', ')}
              </span>
            </div>
          )}

          {/* Facilities */}
          <div className="mb-3">
            <p className="text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Facilities</p>
            <div className="flex flex-wrap gap-1.5">
              {station.facilities.map(facility => (
                <span
                  key={facility}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 rounded-md text-xs text-gray-300"
                >
                  {FACILITY_ICONS[facility] || <MapPin className="w-3.5 h-3.5" />}
                  {facility}
                </span>
              ))}
            </div>
          </div>

          {/* Nearby places */}
          <div className="mb-3">
            <p className="text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Nearby Places</p>
            <div className="space-y-1">
              {station.nearbyPlaces.map(place => (
                <div key={place} className="flex items-center gap-2 text-xs text-gray-300">
                  <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
                  {place}
                </div>
              ))}
            </div>
          </div>

          {/* Connected stations */}
          <div className="mb-3">
            <p className="text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Connected Stations</p>
            <div className="space-y-1">
              {connectedStations.map(s => (
                <button
                  key={s.id}
                  onClick={() => onNavigate(s.id)}
                  className="w-full flex items-center gap-2 text-xs text-gray-300 hover:text-white px-2 py-1.5 hover:bg-white/5 rounded-md transition-colors cursor-pointer"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: LINE_COLORS[s.line].primary }}
                  />
                  {s.name}
                  <span className="ml-auto text-gray-500">
                    {LINES.find(l => l.id === s.line)?.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigate button */}
          <button
            onClick={() => onNavigate(stationId)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white transition-all cursor-pointer hover:brightness-110"
            style={{
              background: `linear-gradient(135deg, ${color.primary}, ${color.glow})`,
            }}
          >
            <Navigation className="w-4 h-4" />
            Navigate Here
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
