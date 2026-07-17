import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, RotateCcw, X } from 'lucide-react';
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

/* ── reusable section heading ── */
function SectionHeading({ children }: { children: string }) {
  return (
    <p style={{
      color: '#f1f5f9',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      margin: '0 0 10px 0',
    }}>
      {children}
    </p>
  );
}

export default function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = <K extends keyof SceneSettings>(key: K, value: SceneSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const toggles: { key: keyof SceneSettings; label: string }[] = [
    { key: 'show3DBuildings',   label: '3D buildings'   },
    { key: 'showMetroGuideway', label: 'Metro guideway' },
    { key: 'showStationHalos', label: 'Station halos'  },
    { key: 'showStationLabels', label: 'Station labels' },
    { key: 'showNeonGlow',      label: 'Neon line glow' },
  ];

  const lightingModes = Object.keys(LIGHTING_PRESETS) as LightingMode[];

  /* slider fill % */
  const sliderFill = ((settings.stationSize - 0.5) / 1.5) * 100;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '72px',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '8px',
    }}>

      {/* ── Settings Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              width: '268px',
              background: 'rgba(22, 24, 40, 0.90)',
              backdropFilter: 'blur(36px) saturate(180%)',
              WebkitBackdropFilter: 'blur(36px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '18px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
              padding: '18px',
              marginBottom: '6px',
              position: 'relative',
            }}
          >
            {/* ── Close button ── */}
            <button
              onClick={() => setIsOpen(false)}
              title="Close"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(148,163,184,0.8)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(148,163,184,0.8)';
              }}
            >
              <X size={15} />
            </button>

            {/* ── LIGHTING ── */}
            <SectionHeading>Lighting</SectionHeading>
            <div style={{
              display: 'flex',
              gap: '4px',
              marginBottom: '18px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '4px',
            }}>
              {lightingModes.map(mode => {
                const active = settings.lighting === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => updateSetting('lighting', mode)}
                    style={{
                      flex: 1,
                      padding: '7px 4px',
                      borderRadius: '9px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: active ? 600 : 500,
                      fontFamily: 'Inter, system-ui, sans-serif',
                      cursor: 'pointer',
                      transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
                      background: active
                        ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                        : 'transparent',
                      color: active ? '#fff' : 'rgba(148,163,184,0.85)',
                      boxShadow: active ? '0 2px 12px rgba(124,58,237,0.35)' : 'none',
                    }}
                    onMouseEnter={e => {
                      if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    }}
                    onMouseLeave={e => {
                      if (!active) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {LIGHTING_PRESETS[mode].name}
                  </button>
                );
              })}
            </div>

            {/* ── SCENE ── */}
            <SectionHeading>Scene</SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '18px' }}>
              {toggles.map(({ key, label }) => {
                const checked = settings[key] as boolean;
                return (
                  <label
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '6px 8px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Custom checkbox */}
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        minWidth: '18px',
                        borderRadius: '5px',
                        border: checked
                          ? '2px solid #a855f7'
                          : '2px solid rgba(255,255,255,0.18)',
                        background: checked
                          ? '#a855f7'
                          : 'rgba(255,255,255,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'background 0.15s, border-color 0.15s',
                      }}
                    >
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 3.5L3.8 6.5L9 1"
                            stroke="white"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    {/* Hidden real checkbox for proper onChange */}
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => updateSetting(key, e.target.checked as never)}
                      style={{ display: 'none' }}
                    />
                    <span style={{
                      fontSize: '13px',
                      color: checked ? '#e2e8f0' : '#94a3b8',
                      fontWeight: checked ? 500 : 400,
                      fontFamily: 'Inter, system-ui, sans-serif',
                      userSelect: 'none',
                      transition: 'color 0.15s',
                    }}>
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* ── STATION SIZE ── */}
            <SectionHeading>Station Size</SectionHeading>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
              padding: '0 2px',
            }}>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.stationSize}
                onChange={e => updateSetting('stationSize', parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  height: '4px',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  background: `linear-gradient(to right,
                    #a855f7 0%,
                    #a855f7 ${sliderFill}%,
                    rgba(255,255,255,0.10) ${sliderFill}%,
                    rgba(255,255,255,0.10) 100%)`,
                  borderRadius: '2px',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
              <span style={{
                fontSize: '12px',
                color: '#94a3b8',
                fontWeight: 600,
                minWidth: '38px',
                textAlign: 'right',
                fontFamily: 'Inter, system-ui, sans-serif',
                flexShrink: 0,
              }}>
                {Math.round(settings.stationSize * 100)}%
              </span>
            </div>

            {/* ── Reset button ── */}
            <button
              onClick={() => onSettingsChange({ ...DEFAULT_SCENE_SETTINGS })}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                padding: '11px 16px',
                background: 'rgba(168,85,247,0.12)',
                border: '1px solid rgba(168,85,247,0.25)',
                borderRadius: '12px',
                color: '#c4b5fd',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: 'Inter, system-ui, sans-serif',
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s, color 0.15s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(168,85,247,0.22)';
                e.currentTarget.style.borderColor = 'rgba(168,85,247,0.45)';
                e.currentTarget.style.color = '#ddd6fe';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(168,85,247,0.12)';
                e.currentTarget.style.borderColor = 'rgba(168,85,247,0.25)';
                e.currentTarget.style.color = '#c4b5fd';
              }}
            >
              <RotateCcw size={13} />
              Reset to defaults
            </button>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB toggle button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fab-btn ${isOpen ? 'fab-btn-active' : ''}`}
        title="Customize scene"
      >
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.3 }}>
          <Settings size={20} style={{ color: 'rgba(255,255,255,0.8)' }} />
        </motion.div>
      </button>
    </div>
  );
}
