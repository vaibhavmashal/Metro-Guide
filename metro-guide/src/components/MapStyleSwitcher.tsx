import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers } from 'lucide-react';
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
    <div className="fixed bottom-5 left-5 z-10 flex flex-col items-start gap-2">
      {/* Panel — opens above the button */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="glass-card p-4 w-[220px] mb-1"
          >
            <h3 className="text-white text-[11px] font-semibold uppercase tracking-[0.15em] mb-3">
              BASE MAP
            </h3>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {MAP_STYLES.map(style => (
                <button
                  key={style.id}
                  onClick={() => onStyleChange(style.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer ${
                    currentStyle === style.id
                      ? 'ring-2 ring-purple-500/60 bg-white/5'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div
                    className="w-full h-14 rounded-lg"
                    style={{ background: style.preview }}
                  />
                  <span className={`text-[11px] font-medium ${
                    currentStyle === style.id ? 'text-white' : 'text-gray-400'
                  }`}>
                    {style.name}
                  </span>
                </button>
              ))}
            </div>

            {/* 3D Terrain */}
            <label className="flex items-center gap-2.5 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={is3DTerrain}
                onChange={(e) => onToggle3DTerrain(e.target.checked)}
              />
              <span className="text-[13px] text-gray-300">3D terrain</span>
            </label>
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
