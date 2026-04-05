import React from 'react';
import { motion } from 'framer-motion';

interface SparkLineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export default function SparkLine({ data, color = '#6366F1', width = 120, height = 40 }: SparkLineProps) {
  if (data.length === 0) {
    data = [0, 0];
  }
  if (data.length === 1) {
    data = [data[0], data[0]];
  }

  const padding = 4;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const min = Math.min(...data);
  const max = Math.max(...data) || 1; // prevent div by zero
  const range = max - min;
  
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * innerWidth;
    const y = padding + innerHeight - ((d - min) / range) * innerHeight;
    return `${x},${y}`;
  });

  const pathStr = points.join(' ');
  const lastPoint = points[points.length - 1].split(',');
  const lx = parseFloat(lastPoint[0]);
  const ly = parseFloat(lastPoint[1]);

  const fillPolygon = `${points[0].split(',')[0]},${height} ${pathStr} ${lx},${height}`;

  // Unique ID for gradient
  const gradId = `spark-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible pt-1">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Fill Area */}
      <polygon points={fillPolygon} fill={`url(#${gradId})`} />

      {/* Main Line */}
      <polyline points={pathStr} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Pulsing End Dot */}
      <motion.circle 
        cx={lx} cy={ly} r="3" fill={color}
        initial={{ scale: 0.8, opacity: 0.8 }}
        animate={{ scale: [1, 1.8, 1], opacity: [1, 0.4, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}
