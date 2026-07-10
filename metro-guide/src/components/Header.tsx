import { useState, useEffect } from 'react';
import { Train } from 'lucide-react';

const getIsMobile = () => window.innerWidth < 640;

export default function Header() {
  const [mobile, setMobile] = useState(getIsMobile);
  useEffect(() => {
    const handler = () => setMobile(getIsMobile());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 10 }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        padding: mobile ? '8px 14px 8px 8px' : '10px 18px 10px 10px',
        background: 'rgba(22, 24, 40, 0.88)',
        backdropFilter: 'blur(36px) saturate(180%)',
        WebkitBackdropFilter: 'blur(36px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>

        {/* ── Icon box ── */}
        <div style={{
          width: mobile ? '36px' : '42px',
          height: mobile ? '36px' : '42px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #5b4fcf 0%, #3730a3 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 16px rgba(91,79,207,0.45), inset 0 1px 0 rgba(255,255,255,0.20)',
        }}>
          <Train size={mobile ? 17 : 20} style={{ color: 'rgba(255,255,255,0.95)' }} />
        </div>

        {/* ── Text block ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <h1 style={{
            margin: 0,
            color: '#f1f5f9',
            fontSize: mobile ? '13px' : '16px',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
          }}>
            Pune Metro{' '}
            <span style={{ color: '#22d3ee' }}>3D</span>
          </h1>
          {/* Hide subtitle on very small screens */}
          {!mobile && (
            <p style={{ margin: 0, fontSize: '11px', lineHeight: 1, display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <span style={{ color: '#c084fc', fontWeight: 500 }}>Purple</span>
              <span style={{ color: 'rgba(148,163,184,0.5)', fontSize: '10px' }}>·</span>
              <span style={{ color: '#22d3ee', fontWeight: 500 }}>Aqua</span>
              <span style={{ color: 'rgba(148,163,184,0.5)', fontSize: '10px' }}>·</span>
              <span style={{ color: '#f472b6', fontWeight: 500 }}>Line 3</span>
              <span style={{ color: 'rgba(148,163,184,0.5)', fontSize: '10px' }}>·</span>
              <span style={{ color: 'rgba(148,163,184,0.65)', fontWeight: 400 }}>interactive 3D map</span>
            </p>
          )}
          {mobile && (
            <p style={{ margin: 0, fontSize: '10px', lineHeight: 1, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ color: '#c084fc', fontWeight: 600 }}>P</span>
              <span style={{ color: 'rgba(148,163,184,0.4)', fontSize: '9px' }}>·</span>
              <span style={{ color: '#22d3ee', fontWeight: 600 }}>A</span>
              <span style={{ color: 'rgba(148,163,184,0.4)', fontSize: '9px' }}>·</span>
              <span style={{ color: '#f472b6', fontWeight: 600 }}>L3</span>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
