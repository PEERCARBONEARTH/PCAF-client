import React from 'react';

export const ConnectionLines: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
            <stop offset="50%" stopColor="hsl(var(--finance))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main connection lines from preview area to sign-in */}
        <g className="animate-fade-in animation-delay-500">
          {/* Top preview card to sign-in connection */}
          <path
            d="M 600 200 Q 750 250 900 300"
            stroke="url(#connectionGradient)"
            strokeWidth="1"
            fill="none"
            filter="url(#glow)"
          />
          
          {/* Bottom preview card to sign-in connection */}
          <path
            d="M 600 400 Q 750 350 900 300"
            stroke="url(#connectionGradient)"
            strokeWidth="1"
            fill="none"
            filter="url(#glow)"
          />
          
          {/* Interconnecting web between preview cards */}
          <path
            d="M 300 250 Q 450 300 600 350"
            stroke="hsl(var(--primary) / 0.1)"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="4 8"
          />
          
          {/* Subtle background mesh */}
          <path
            d="M 200 150 Q 400 200 600 250 Q 800 300 1000 350"
            stroke="hsl(var(--muted-foreground) / 0.05)"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="2 10"
          />
          
          {/* Floating connection nodes */}
          <circle
            cx="650"
            cy="250"
            r="2"
            fill="hsl(var(--primary))"
            opacity="0.3"
          />
          <circle
            cx="750"
            cy="320"
            r="1.5"
            fill="hsl(var(--finance))"
            opacity="0.4"
          />
          <circle
            cx="850"
            cy="280"
            r="1"
            fill="hsl(var(--accent))"
            opacity="0.5"
          />
        </g>
      </svg>
    </div>
  );
};