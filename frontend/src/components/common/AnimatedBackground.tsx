import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-[#07090E]">
      {/* Glow Orbs behind waves for ambient light */}
      <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] rounded-full bg-cat-yellow/10 blur-[150px]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[650px] h-[650px] rounded-full bg-blue-600/10 blur-[160px]" />

      {/* Wave Layer 1 — Caterpillar Amber/Gold Flowing Wave */}
      <svg
        className="absolute top-[-20%] left-[-25%] w-[250%] h-[160%] opacity-20 wave-layer-1"
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0,160 C320,300 420,0 740,180 C1060,360 1120,40 1440,200 L1440,600 L0,600 Z"
          fill="url(#goldWaveGradient)"
        />
        <defs>
          <linearGradient id="goldWaveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB800" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#07090E" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wave Layer 2 — Electric Blue Flowing Wave */}
      <svg
        className="absolute top-[10%] left-[-20%] w-[240%] h-[150%] opacity-18 wave-layer-2"
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M0,280 C240,100 480,380 720,200 C960,20 1200,320 1440,140 L1440,600 L0,600 Z"
          fill="url(#blueWaveGradient)"
        />
        <defs>
          <linearGradient id="blueWaveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#6366F1" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#07090E" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Wave Layer 3 — Geometric Topographic Wave Line Curves */}
      <svg
        className="absolute inset-0 w-full h-full opacity-35 wave-layer-3"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="none"
      >
        <path d="M0 180 Q 360 380 720 180 T 1440 180" stroke="url(#waveLineGrad1)" strokeWidth="2.5" />
        <path d="M0 320 Q 360 120 720 320 T 1440 320" stroke="url(#waveLineGrad2)" strokeWidth="2" />
        <path d="M0 480 Q 360 680 720 480 T 1440 480" stroke="url(#waveLineGrad1)" strokeWidth="1.8" />
        <path d="M0 620 Q 360 420 720 620 T 1440 620" stroke="url(#waveLineGrad2)" strokeWidth="2.2" />

        <defs>
          <linearGradient id="waveLineGrad1" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFB800" stopOpacity="0.7" />
            <stop offset="0.5" stopColor="#3B82F6" stopOpacity="0.5" />
            <stop offset="1" stopColor="#10B981" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="waveLineGrad2" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" stopOpacity="0.6" />
            <stop offset="0.5" stopColor="#8B5CF6" stopOpacity="0.5" />
            <stop offset="1" stopColor="#FFB800" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Subtle Dot Grid Overlay for Depth */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }}
      />
    </div>
  );
};
