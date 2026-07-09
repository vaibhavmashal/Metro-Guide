import { Maximize2, Minimize2, Plus, Minus, Compass, LocateFixed, Mountain } from 'lucide-react';
import type { Map as MaplibreMap } from 'maplibre-gl';

interface MapControlsProps {
  map: MaplibreMap | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function MapControls({ map, isFullscreen, onToggleFullscreen }: MapControlsProps) {
  const handleZoomIn = () => map?.zoomIn({ duration: 300 });
  const handleZoomOut = () => map?.zoomOut({ duration: 300 });

  const handleResetBearing = () => {
    map?.easeTo({ bearing: 0, pitch: 0, duration: 500 });
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 15,
          pitch: 60,
          duration: 2000,
        });
      },
      (err) => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true }
    );
  };

  const handleReset3D = () => {
    map?.easeTo({ pitch: 60, bearing: -17, zoom: 13.5, center: [73.849, 18.527], duration: 1000 });
  };

  return (
    <div className="fixed right-[356px] bottom-5 z-10 flex flex-col gap-1.5">
      <button onClick={onToggleFullscreen} className="glass-btn" title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
        {isFullscreen ? <Minimize2 className="w-4 h-4 text-white/80" /> : <Maximize2 className="w-4 h-4 text-white/80" />}
      </button>
      <button onClick={handleZoomIn} className="glass-btn" title="Zoom in">
        <Plus className="w-4 h-4 text-white/80" />
      </button>
      <button onClick={handleZoomOut} className="glass-btn" title="Zoom out">
        <Minus className="w-4 h-4 text-white/80" />
      </button>
      <button onClick={handleResetBearing} className="glass-btn" title="Reset compass">
        <Compass className="w-4 h-4 text-white/80" />
      </button>
      <button onClick={handleReset3D} className="glass-btn" title="Reset 3D view">
        <Mountain className="w-4 h-4 text-white/80" />
      </button>
      <button onClick={handleLocate} className="glass-btn" title="My location">
        <LocateFixed className="w-4 h-4 text-white/80" />
      </button>
    </div>
  );
}
