import React from 'react';

export const NetworkBackground: React.FC = () => {
  // Generate network nodes
  const nodes = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 1200,
    y: Math.random() * 800,
    connections: Math.floor(Math.random() * 4) + 1
  }));

  // Generate connections between nearby nodes
  const connections = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nearbyNodes = nodes
      .filter((other, j) => {
        if (i === j) return false;
        const distance = Math.sqrt(
          Math.pow(node.x - other.x, 2) + Math.pow(node.y - other.y, 2)
        );
        return distance < 200;
      })
      .slice(0, node.connections);

    nearbyNodes.forEach(other => {
      connections.push({
        x1: node.x,
        y1: node.y,
        x2: other.x,
        y2: other.y,
        id: `${i}-${other.id}`
      });
    });
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Light mode gradients */}
          <linearGradient id="networkGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(var(--finance))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.1" />
          </linearGradient>
          
          {/* Dark mode gradients */}
          <linearGradient id="networkGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="50%" stopColor="hsl(var(--finance))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
          </linearGradient>
          
          {/* Glow filters */}
          <filter id="networkGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Network connections */}
        <g className="animate-fade-in animation-delay-300">
          {connections.map((connection, index) => (
            <line
              key={connection.id}
              x1={connection.x1}
              y1={connection.y1}
              x2={connection.x2}
              y2={connection.y2}
              stroke="url(#networkGradientLight)"
              className="dark:stroke-[url(#networkGradientDark)]"
              strokeWidth="1"
              filter="url(#networkGlow)"
              opacity={0.6}
              style={{
                animationDelay: `${index * 0.05}s`
              }}
            />
          ))}
        </g>
        
        {/* Network nodes */}
        <g className="animate-fade-in animation-delay-500">
          {nodes.map((node, index) => (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={node.connections > 2 ? "3" : "2"}
              fill="hsl(var(--primary))"
              className="dark:fill-white"
              opacity={node.connections > 2 ? "0.8" : "0.6"}
              filter="url(#nodeGlow)"
              style={{
                animationDelay: `${index * 0.02}s`
              }}
            />
          ))}
        </g>
        
        {/* Additional subtle background mesh */}
        <g opacity="0.3" className="animate-fade-in animation-delay-700">
          <path
            d="M 0 200 Q 300 150 600 200 Q 900 250 1200 200"
            stroke="hsl(var(--muted-foreground) / 0.1)"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="3 12"
            filter="url(#networkGlow)"
          />
          <path
            d="M 0 400 Q 300 350 600 400 Q 900 450 1200 400"
            stroke="hsl(var(--muted-foreground) / 0.08)"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="3 12"
            filter="url(#networkGlow)"
          />
          <path
            d="M 0 600 Q 300 550 600 600 Q 900 650 1200 600"
            stroke="hsl(var(--muted-foreground) / 0.06)"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="3 12"
            filter="url(#networkGlow)"
          />
        </g>
      </svg>
    </div>
  );
};