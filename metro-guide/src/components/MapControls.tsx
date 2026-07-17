import { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Plus, Minus, Compass, LocateFixed, Mountain } from 'lucide-react';
import type { Map as MaplibreMap } from 'maplibre-gl';

interface MapControlsProps {
  map: MaplibreMap | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const getIsMobile = () => window.innerWidth < 640;

export default function MapControls({ map, isFullscreen, onToggleFullscreen }: MapControlsProps) {
  const [mobile, setMobile] = useState(getIsMobile);
  useEffect(() => {
    const handler = () => setMobile(getIsMobile());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleZoomIn       = () => map?.zoomIn({ duration: 300 });
  const handleZoomOut      = () => map?.zoomOut({ duration: 300 });
  const handleResetBearing = () => map?.easeTo({ bearing: 0, pitch: 0, duration: 500 });
  const handleReset3D      = () =>
    map?.easeTo({ pitch: 60, bearing: -17, zoom: 13.5, center: [73.849, 18.527], duration: 1000 });

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => map?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 15, pitch: 60, duration: 2000 }),
      err => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true }
    );
  };

  /* ── shared button base ── */
  const baseBtn: React.CSSProperties = {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(18, 20, 36, 0.92)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: 'none',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.78)',
    transition: 'background 0.14s, color 0.14s, transform 0.10s',
    flexShrink: 0,
    outline: 'none',
  };

  /* divider between buttons inside a group */
  const divider: React.CSSProperties = {
    height: '1px',
    background: 'rgba(255,255,255,0.07)',
    flexShrink: 0,
  };

  /* pill/card that groups buttons together */
  const group: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '13px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.09)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.50)',
  };

  const hoverIn  = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(255,255,255,0.11)';
    e.currentTarget.style.color      = '#fff';
  };
  const hoverOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'rgba(18,20,36,0.92)';
    e.currentTarget.style.color      = 'rgba(255,255,255,0.78)';
    e.currentTarget.style.transform  = 'scale(1)';
  };
  const pressIn  = (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = 'scale(0.92)'; };
  const pressOut = (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = 'scale(1)'; };

  const wrapperStyle: React.CSSProperties = {
    position: 'fixed',
    top:    mobile ? '76px' : 'auto',
    bottom: mobile ? 'auto' : '20px',
    right:  mobile ? '12px' : '16px',
    zIndex: 15,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  };

  return (
    <div style={wrapperStyle}>

      {/* ── Group 1: Fullscreen toggle ── */}
      <div style={group}>
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          style={baseBtn}
          onMouseEnter={hoverIn}
          onMouseLeave={hoverOut}
          onMouseDown={pressIn}
          onMouseUp={pressOut}
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      {/* ── Group 2: Zoom ── */}
      <div style={group}>
        <button onClick={handleZoomIn} title="Zoom in" style={baseBtn}
          onMouseEnter={hoverIn} onMouseLeave={hoverOut} onMouseDown={pressIn} onMouseUp={pressOut}>
          <Plus size={16} />
        </button>
        <div style={divider} />
        <button onClick={handleZoomOut} title="Zoom out" style={baseBtn}
          onMouseEnter={hoverIn} onMouseLeave={hoverOut} onMouseDown={pressIn} onMouseUp={pressOut}>
          <Minus size={16} />
        </button>
      </div>

      {/* ── Group 3: Navigation utilities ── */}
      <div style={group}>
        <button onClick={handleResetBearing} title="Reset compass" style={baseBtn}
          onMouseEnter={hoverIn} onMouseLeave={hoverOut} onMouseDown={pressIn} onMouseUp={pressOut}>
          <Compass size={15} />
        </button>
        <div style={divider} />
        <button onClick={handleReset3D} title="Reset 3D view" style={baseBtn}
          onMouseEnter={hoverIn} onMouseLeave={hoverOut} onMouseDown={pressIn} onMouseUp={pressOut}>
          <Mountain size={15} />
        </button>
        <div style={divider} />
        <button onClick={handleLocate} title="My location" style={baseBtn}
          onMouseEnter={hoverIn} onMouseLeave={hoverOut} onMouseDown={pressIn} onMouseUp={pressOut}>
          <LocateFixed size={15} />
        </button>
      </div>

    </div>
  );
}
