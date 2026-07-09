import { useState, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import type maplibregl from 'maplibre-gl';

import MetroMap, { type MetroMapHandle } from './components/MetroMap';
import Header from './components/Header';
import StationPanel from './components/StationPanel';
import StationDetail from './components/StationDetail';
import MapStyleSwitcher from './components/MapStyleSwitcher';
import SettingsPanel from './components/SettingsPanel';
import RoutePlanner from './components/RoutePlanner';
import MapControls from './components/MapControls';
import LoadingScreen from './components/LoadingScreen';
import { DEFAULT_SCENE_SETTINGS, type SceneSettings } from './utils/mapStyles';
import type { RouteResult } from './utils/pathfinding';

import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState('dark');
  const [settings, setSettings] = useState<SceneSettings>({ ...DEFAULT_SCENE_SETTINGS });
  const [is3DTerrain, setIs3DTerrain] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [detailStation, setDetailStation] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);

  const mapRef = useRef<MetroMapHandle>(null);

  const handleMapReady = useCallback((map: maplibregl.Map) => {
    setMapInstance(map);
  }, []);

  const handleStationSelect = useCallback((stationId: string) => {
    setSelectedStation(stationId);
    setDetailStation(stationId);
    mapRef.current?.flyToStation(stationId);
  }, []);

  const handleStationClick = useCallback((stationId: string) => {
    setSelectedStation(stationId);
    setDetailStation(stationId);
    mapRef.current?.flyToStation(stationId);
  }, []);

  const handleRouteCalculated = useCallback((route: RouteResult | null) => {
    mapRef.current?.highlightRoute(route);
  }, []);

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
  }, []);

  return (
    <div className="app-container">
      {/* Loading screen */}
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      {/* 3D Map */}
      <MetroMap
        ref={mapRef}
        mapStyle={mapStyle}
        settings={settings}
        selectedStation={selectedStation}
        onStationClick={handleStationClick}
        onMapReady={handleMapReady}
      />

      {/* UI Overlays — show after loading */}
      {!isLoading && (
        <>
          {/* Top-left: Header branding */}
          <Header />

          {/* Top-center: Route planner */}
          <RoutePlanner
            onRouteCalculated={handleRouteCalculated}
            onStationFocus={handleNavigateStation}
          />

          {/* Right side: Station list panel */}
          <StationPanel
            onStationSelect={handleStationSelect}
            selectedStation={selectedStation}
          />

          {/* Bottom-left: Station detail card (when station is clicked) */}
          <StationDetail
            stationId={detailStation}
            onClose={handleCloseDetail}
            onNavigate={handleNavigateStation}
          />

          {/* Bottom-left: Map style switcher FAB */}
          <MapStyleSwitcher
            currentStyle={mapStyle}
            onStyleChange={setMapStyle}
            is3DTerrain={is3DTerrain}
            onToggle3DTerrain={setIs3DTerrain}
          />

          {/* Bottom-left: Settings FAB (next to layers) */}
          <SettingsPanel
            settings={settings}
            onSettingsChange={setSettings}
          />

          {/* Bottom-right: Map controls */}
          <MapControls
            map={mapInstance}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </>
      )}
    </div>
  );
}

export default App;
