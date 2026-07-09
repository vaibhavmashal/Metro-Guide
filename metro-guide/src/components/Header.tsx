import { Train } from 'lucide-react';

export default function Header() {
  return (
    <div className="fixed top-4 left-4 z-10">
      <div className="glass-card px-5 py-3.5 flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4a6fa5] to-[#2d4a7a] flex items-center justify-center shadow-lg shadow-blue-900/30">
          <Train className="w-6 h-6 text-white/90" />
        </div>
        <div>
          <h1 className="text-white text-[17px] font-bold leading-tight tracking-wide">
            Pune Metro <span className="text-cyan-400">3D</span>
          </h1>
          <p className="text-gray-400 text-[11px] leading-tight mt-0.5 tracking-wide">
            <span className="text-purple-400">Purple</span>
            {' · '}
            <span className="text-cyan-400">Aqua</span>
            {' · '}
            <span className="text-pink-400">Line 3</span>
            {' · interactive 3D map'}
          </p>
        </div>
      </div>
    </div>
  );
}
