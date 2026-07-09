import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, RotateCcw } from 'lucide-react';
import {
  type SceneSettings,
  DEFAULT_SCENE_SETTINGS,
  type LightingMode,
  LIGHTING_PRESETS,
} from '../utils/mapStyles';

interface SettingsPanelProps {
  settings: SceneSettings;
  onSettingsChange: (settings: SceneSettings) => void;
}

export default function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = <K extends keyof SceneSettings>(key: K, value: SceneSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const toggles: { key: keyof SceneSettings; label: string }[] = [
    { key: 'show3DBuildings', label: '3D buildings' },
    { key: 'showMetroGuideway', label: 'Metro guideway' },
    { key: 'showStationHalos', label: 'Station halos' },
    { key: 'showStationLabels', label: 'Station labels' },
    { key: 'showNeonGlow', label: 'Neon line glow' },
  ];

  return (
    <div className="fixed bottom-5 left-[72px] z-10 flex flex-col items-start gap-2">
      {/* Panel — opens above the button */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="glass-card p-4 w-[260px] mb-1"
          >
            {/* Lighting */}
            <h3 className="text-white text-[11px] font-semibold uppercase tracking-[0.15em] mb-2.5">
              LIGHTING
            </h3>
            <div className="flex gap-1.5 mb-5">
              {(Object.keys(LIGHTING_PRESETS) as LightingMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => updateSetting('lighting', mode)}
                  className={`flex-1 py-2 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                    settings.lighting === mode
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-white/[0.06] text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {LIGHTING_PRESETS[mode].name}
                </button>
              ))}
            </div>

            {/* Scene */}
            <h3 className="text-white text-[11px] font-semibold uppercase tracking-[0.15em] mb-2.5">
              SCENE
            </h3>
            <div className="space-y-1 mb-5">
              {toggles.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 cursor-pointer hover:bg-white/[0.03] px-2 py-2 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={settings[key] as boolean}
                    onChange={(e) => updateSetting(key, e.target.checked as never)}
                  />
                  <span className="text-[13px] text-gray-300">{label}</span>
                </label>
              ))}
            </div>

            {/* Station size */}
            <h3 className="text-white text-[11px] font-semibold uppercase tracking-[0.15em] mb-2.5">
              STATION SIZE
            </h3>
            <div className="flex items-center gap-3 mb-5 px-1">
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.stationSize}
                onChange={(e) => updateSetting('stationSize', parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-[12px] text-gray-400 w-10 text-right font-medium">
                {Math.round(settings.stationSize * 100)}%
              </span>
            </div>

            {/* Reset */}
            <button
              onClick={() => onSettingsChange({ ...DEFAULT_SCENE_SETTINGS })}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/20 rounded-xl text-[12px] font-medium text-gray-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to defaults
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fab-btn ${isOpen ? 'fab-btn-active' : ''}`}
        title="Customize scene"
      >
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.3 }}>
          <Settings className="w-5 h-5 text-white/80" />
        </motion.div>
      </button>
    </div>
  );
}
