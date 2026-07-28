import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Train, Navigation, ListFilter } from 'lucide-react';
import type maplibregl from 'maplibre-gl';

import MetroMap, { type MetroMapHandle } from './components/MetroMap';
import Header from './components/Header';
import StationPanel from './components/StationPanel';
import StationDetail from './components/StationDetail';
import MapStyleSwitcher from './components/MapStyleSwitcher';
import SettingsPanel from './components/SettingsPanel';
import JourneyPlanner from './components/JourneyPlanner';
import MapControls from './components/MapControls';
import LoadingScreen from './components/LoadingScreen';
import CitySelector from './components/CitySelector';
import ChatPanel from './components/ChatPanel';
import { CITY_CONFIGS, type CityId } from './data/cityData';
import { DEFAULT_SCENE_SETTINGS, type SceneSettings } from './utils/mapStyles';
import type { JourneyResult } from './utils/journeyApi';

import './App.css';

/* ── hook to detect mobile breakpoint ── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

type MobileTab = 'map' | 'stations' | 'journey';

function App() {
  const [selectedCity, setSelectedCity] = useState<CityId>('pune');
  const [isLoading, setIsLoading]       = useState(true);
  const [mapStyle, setMapStyle]         = useState('dark');
  const [settings, setSettings]         = useState<SceneSettings>({ ...DEFAULT_SCENE_SETTINGS });
  const [is3DTerrain, setIs3DTerrain]   = useState(false);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [detailStation, setDetailStation]     = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapInstance, setMapInstance]   = useState<maplibregl.Map | null>(null);
  const [activeTab, setActiveTab]       = useState<MobileTab>('map');

  const isMobile = useIsMobile();
  const mapRef   = useRef<MetroMapHandle>(null);
  const cityConfig = CITY_CONFIGS[selectedCity];

  const handleCityChange = useCallback((newCity: CityId) => {
    setSelectedCity(newCity);
    setSelectedStation(null);
    setDetailStation(null);
  }, []);

  const handleMapReady = useCallback((map: maplibregl.Map) => {
    setMapInstance(map);
  }, []);

  const handleStationSelect = useCallback((stationId: string) => {
    setSelectedStation(stationId);
    setDetailStation(stationId);
    mapRef.current?.flyToStation(stationId);
    if (isMobile) setActiveTab('map');
  }, [isMobile]);

  const handleStationClick = useCallback((stationId: string) => {
    setSelectedStation(stationId);
    setDetailStation(stationId);
    mapRef.current?.flyToStation(stationId);
  }, []);

  const handleJourneyResult = useCallback((result: JourneyResult | null) => {
    mapRef.current?.showJourney(result);
    if (isMobile && result) setActiveTab('map');
  }, [isMobile]);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailStation(null);
    setSelectedStation(null);
  }, []);

  const handleNavigateStation = useCallback((stationId: string) => {
    setSelectedStation(stationId);
    setDetailStation(stationId);
    mapRef.current?.flyToStation(stationId);
    if (isMobile) setActiveTab('map');
  }, [isMobile]);

  return (
    <div className="app-container">
      {/* Loading screen */}
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {/* 3D Map — full viewport */}
      <MetroMap
        ref={mapRef}
        mapStyle={mapStyle}
        settings={settings}
        selectedStation={selectedStation}
        onStationClick={handleStationClick}
        onMapReady={handleMapReady}
        cityConfig={cityConfig}
      />

      {/* UI Overlays */}
      {!isLoading && (
        <>
          {/* ── Header (always visible) ── */}
          <Header cityConfig={cityConfig} />

          {/* ── City Selector (always visible) ── */}
          <CitySelector currentCity={selectedCity} onCityChange={handleCityChange} />

          {/* ── AI Chatbot Assistant Panel ── */}
          <ChatPanel cityConfig={cityConfig} isMobile={isMobile} activeTab={activeTab} onJourneyResult={handleJourneyResult} />

          {/* ── Desktop-only overlays ── */}
          {!isMobile && (
            <>
              {/* Bottom-center: Journey planner */}
              <JourneyPlanner
                onJourneyResult={handleJourneyResult}
                cityConfig={cityConfig}
              />

              {/* Right: Station list panel */}
              <StationPanel
                onStationSelect={handleStationSelect}
                selectedStation={selectedStation}
                cityConfig={cityConfig}
              />

              {/* Bottom-left: Station detail */}
              <StationDetail
                stationId={detailStation}
                onClose={handleCloseDetail}
                onNavigate={handleNavigateStation}
                cityConfig={cityConfig}
              />

              {/* Map controls */}
              <MapControls
                map={mapInstance}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
              />
            </>
          )}

          {/* ── Mobile layout ── */}
          {isMobile && (
            <>
              {/* Map controls — compact top-right */}
              <MapControls
                map={mapInstance}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
              />

              {/* Stations tab panel — bottom sheet */}
              {activeTab === 'stations' && (
                <StationPanel
                  onStationSelect={handleStationSelect}
                  selectedStation={selectedStation}
                  cityConfig={cityConfig}
                />
              )}

              {/* Journey planner — always mounted on mobile so compact route bar and state persist */}
              <JourneyPlanner
                onJourneyResult={handleJourneyResult}
                cityConfig={cityConfig}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {/* Bottom nav bar */}
              <nav className="mobile-nav-bar">
                <button
                  className={`mobile-nav-btn ${activeTab === 'map' ? 'active' : ''}`}
                  onClick={() => setActiveTab('map')}
                >
                  <Train size={18} />
                  Map
                </button>
                <button
                  className={`mobile-nav-btn ${activeTab === 'stations' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stations')}
                >
                  <ListFilter size={18} />
                  Stations
                </button>
                <button
                  className={`mobile-nav-btn ${activeTab === 'journey' ? 'active' : ''}`}
                  onClick={() => setActiveTab('journey')}
                >
                  <Navigation size={18} />
                  Journey
                </button>
              </nav>
            </>
          )}

          {/* ── FABs (always visible, repositioned on mobile via CSS) ── */}
          <MapStyleSwitcher
            currentStyle={mapStyle}
            onStyleChange={setMapStyle}
            is3DTerrain={is3DTerrain}
            onToggle3DTerrain={setIs3DTerrain}
          />
          <SettingsPanel
            settings={settings}
            onSettingsChange={setSettings}
          />
        </>
      )}
    </div>
  );
}

export default App;
