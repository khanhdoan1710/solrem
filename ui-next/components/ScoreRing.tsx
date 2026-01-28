import React, { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
}

const ScoreRing: React.FC<ScoreRingProps> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const increment = score / (duration / 16); 
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [score]);

  // Tachometer geometry
  const radius = 90;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // We want a 240 degree arc (leaving bottom open)
  const arcLength = circumference * 0.75; 
  const strokeDashoffset = arcLength - (displayScore / 100) * arcLength;

  return (
    <div className="relative flex items-center justify-center w-64 h-64 mx-auto my-4">
      {/* Inner Decoration */}
      <div className="absolute w-40 h-40 rounded-full border border-border/50 border-dashed animate-[spin_60s_linear_infinite]"></div>
      
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform rotate-[135deg] relative z-10"
      >
        {/* Track */}
        <circle
          stroke="#27272A"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="butt"
        />
        {/* Progress */}
        <circle
          stroke={displayScore > 80 ? '#CCFF00' : '#6366F1'}
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      
      {/* Data Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pt-4">
        <div className="flex items-baseline">
          <span className={`text-7xl font-mono font-bold tracking-tighter ${
            displayScore > 80 ? 'text-sport glow-text' : 'text-white'
          }`}>
            {displayScore}
          </span>
          <span className="text-xl text-gray-500 font-mono">/100</span>
        </div>
        <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mt-2 border border-accent/20 px-2 py-1 rounded">Proof of REM</span>
      </div>
    </div>
  );
};

export default ScoreRing;