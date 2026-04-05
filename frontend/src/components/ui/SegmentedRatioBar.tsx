import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Segment {
  id: string; // unique identifier
  hit: boolean;
  address: number;
}

interface SegmentedRatioBarProps {
  segments: Segment[]; // Last N segments to display
  maxSegments?: number;
}

export default function SegmentedRatioBar({ segments, maxSegments = 50 }: SegmentedRatioBarProps) {
  const visibleSegments = segments.slice(-maxSegments);
  const strokeWidth = 1;
  
  return (
    <div className="w-full h-8 relative group">
      <svg 
        width="100%" 
        height="100%" 
        preserveAspectRatio="none"
        className="rounded-md overflow-hidden bg-surfaceHigh border border-border shadow-inner"
      >
        <AnimatePresence initial={false}>
          {visibleSegments.map((seg, index) => {
            // Calculate width dynamically assuming equal split over maxSegments
            // But we actually want them to pack left to right. 
            // Width is a percentage: 100 / maxSegments
            const segmentWidthPct = 100 / maxSegments;
            const xPos = `${index * segmentWidthPct}%`;
            
            return (
              <motion.g key={seg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              >
                <rect
                  x={xPos}
                  y="0"
                  width={`${segmentWidthPct}%`}
                  height="100%"
                  fill={seg.hit ? 'var(--tw-colors-hit, #34D399)' : 'var(--tw-colors-miss, #F87171)'}
                  stroke="var(--tw-colors-bg-surface, #1C1C27)"
                  strokeWidth={strokeWidth}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <title>Addr: {seg.address} | {seg.hit ? 'HIT' : 'MISS'}</title>
                </rect>
              </motion.g>
            );
          })}
        </AnimatePresence>
      </svg>
    </div>
  );
}
