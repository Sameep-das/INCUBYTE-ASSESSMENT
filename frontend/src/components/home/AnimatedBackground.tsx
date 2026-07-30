import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20 bg-slate-950">
      <svg className="w-full h-full">
        {/* Floating Outline Gear / Alloy Wheel */}
        <g className="animate-spin-slow transform-gpu origin-center stroke-cyan-400 fill-none stroke-[1.5]">
          <circle cx="15%" cy="25%" r="60" strokeDasharray="4 4" />
          <circle cx="15%" cy="25%" r="40" />
          <path d="M 15% 15% L 15% 35% M 5% 25% L 25% 25%" />
        </g>

        {/* Floating Piston Outline Sketch */}
        <g className="animate-bounce-slow transform-gpu stroke-amber-400 fill-none stroke-[1.5]">
          <rect x="75%" y="18%" width="70" height="90" rx="6" />
          <path d="M 77% 28% H 83% M 77% 35% H 83% M 80% 48% L 80% 85%" />
          <circle cx="80%" cy="85%" r="12" />
        </g>

        {/* Floating Steering Wheel Outline Sketch */}
        <g className="animate-pulse-slow stroke-indigo-400 fill-none stroke-[1.5]">
          <circle cx="80%" cy="70%" r="75" />
          <circle cx="80%" cy="70%" r="20" />
          <path d="M 80% 50% V 65% M 65% 75% L 77% 72% M 95% 75% L 83% 72%" />
        </g>

        {/* Aerodynamic Car Silhouette Contour Wireframe */}
        <path
          d="M 10% 80% Q 25% 78% 35% 65% T 55% 62% T 70% 75% L 88% 78%"
          className="stroke-sky-400 fill-none stroke-[2] animate-dash-flow"
          strokeDasharray="12 6"
        />

        {/* Turbocharger Blueprint Sketch */}
        <g className="animate-float-slow stroke-rose-400 fill-none stroke-[1.5]">
          <circle cx="30%" cy="70%" r="50" />
          <path d="M 30% 70% m -30, 0 a 30,30 0 1,0 60,0 a 30,30 0 1,0 -60,0" />
          <path d="M 30% 70% L 42% 60% M 30% 70% L 18% 80%" />
        </g>
      </svg>
    </div>
  );
};
