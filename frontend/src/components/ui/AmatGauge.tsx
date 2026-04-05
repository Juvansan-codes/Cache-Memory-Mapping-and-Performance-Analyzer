import React from 'react';
import { motion } from 'framer-motion';

// Helper to convert polar to cartesian coordinates
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
};

interface AmatGaugeProps {
  value: number;
}

export default function AmatGauge({ value }: AmatGaugeProps) {
  // Mapping domain: value 1 -> 11 maps to angle 220 -> -40
  // Note: Standard SVG coordinates evaluate 0 degrees at top (with our polarToCartesian logic adjusting -90).
  // Wait, standard polar coordinate: 0 is right. Our adjusted polarToCartesian puts 0 at top.
  // 220 degrees rotated to top means bottom-left. -40 degrees is bottom-right.
  // Actually, angle math: 0 is top, 90 is right, 180 is bottom, 270 is left.
  // So 220 is bottom-left, -40 (or 320) is bottom-right. Total sweep = 260 degrees.
  const startAngle = 220;
  const endAngle = 360 - 40; // 320. Wait, 220 to 320 goes the short way (100 deg) if we draw sweeping right.
  // Let's redefine angles. If we go clockwise from 220 to 320, we cross 270 (left), 0 (top), 90 (right), 180 (bottom).
  // Actually, it's easier to use a standard domain: -130 to 130 where 0 is top.
  // Let's define the arc from angle -130 to +130. Total sweep: 260 deg.
  const arcStart = -130;
  const arcEnd = 130;
  const numSegments = 28;
  const sweep = arcEnd - arcStart;
  const step = sweep / numSegments;
  
  // Needle mapping: value 1 = -130, value 11 = +130
  const maxVal = 11;
  const minVal = 1;
  const clampedValue = Math.max(minVal, Math.min(maxVal, value));
  
  const mapValueToAngle = (val: number) => {
    return arcStart + ((val - minVal) / (maxVal - minVal)) * sweep;
  };
  
  const needleAngle = mapValueToAngle(clampedValue);

  const getStatus = (val: number) => {
    if (val <= 2.5) return { label: 'Optimal', color: '#34D399' };
    if (val <= 6) return { label: 'Warning', color: '#FBBF24' };
    return { label: 'Critical', color: '#F87171' };
  };

  const status = getStatus(value);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Ticks */}
        {Array.from({ length: 11 }).map((_, i) => {
          const val = i + 1;
          const angle = mapValueToAngle(val);
          const outer = polarToCartesian(100, 100, 95, angle);
          const inner = polarToCartesian(100, 100, 90, angle);
          return (
            <line key={`tick-${i}`} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          );
        })}

        {/* Segmented Arc */}
        {Array.from({ length: numSegments }).map((_, i) => {
          const segStart = arcStart + i * step;
          const segEnd = segStart + step - 2.5; // 2.5 degree gap
          // Color shift based on index: green -> yellow -> red
          const ratio = i / (numSegments - 1);
          const r = Math.floor(ratio > 0.5 ? 248 : 52 + (248 - 52) * (ratio * 2));
          const g = Math.floor(ratio < 0.5 ? 211 : 211 - (140) * ((ratio - 0.5) * 2));
          const b = Math.floor(ratio > 0.5 ? 113 : 153 - (153 - 36) * (ratio * 2));
          const strokeColor = `rgb(${r},${g},${b})`;
          
          return (
            <path
              key={`seg-${i}`}
              d={describeArc(100, 100, 80, segStart, segEnd)}
              fill="none"
              stroke={strokeColor}
              strokeWidth="10"
              strokeLinecap="round"
              className="opacity-80"
            />
          );
        })}

        {/* Animated Needle */}
        <motion.g
          animate={{ rotate: needleAngle }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          style={{ transformOrigin: '100px 100px' }}
        >
          {/* Base dot */}
          <circle cx="100" cy="100" r="4" fill={status.color} />
          {/* Needle body */}
          <line x1="100" y1="100" x2="100" y2="30" stroke={status.color} strokeWidth="2" strokeLinecap="round" />
          {/* Glowing tip */}
          <circle cx="100" cy="30" r="3" fill="#FFF" filter="url(#glow)" />
        </motion.g>

        {/* Center Text */}
        <text
          x="100"
          y="125"
          textAnchor="middle"
          fill="#FFF"
          className="font-mono text-3xl font-bold font-['JetBrains_Mono'] tracking-tight"
        >
          {value.toFixed(2)}
        </text>
        
        {/* Status Label */}
        <text
          x="100"
          y="150"
          textAnchor="middle"
          fill={status.color}
          className="font-sans text-xs tracking-wider uppercase font-semibold"
          style={{ filter: 'brightness(1.2)' }}
        >
          {status.label}
        </text>
      </svg>
    </div>
  );
}
