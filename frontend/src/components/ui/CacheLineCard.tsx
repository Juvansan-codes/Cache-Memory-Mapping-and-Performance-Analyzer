import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CacheLineStatus } from '../../types';

interface CacheLineCardProps {
  index: number;
  valid: boolean;
  tag: number | null;
  data: number | null;
  hits: number;
  status: CacheLineStatus;
  isNewStatus: boolean;
}

const statusColors: Record<CacheLineStatus, string> = {
  empty: 'var(--tw-colors-empty, #374151)',
  hit: 'var(--tw-colors-hit, #34D399)',
  miss: 'var(--tw-colors-miss, #F87171)',
  evicted: 'var(--tw-colors-evict, #FBBF24)',
};

const bgColors: Record<CacheLineStatus, string> = {
  empty: 'bg-surfaceHigh/80',
  hit: 'bg-hit/10',
  miss: 'bg-miss/10',
  evicted: 'bg-evict/10',
};

const getBoxShadow = (status: CacheLineStatus, isNew: boolean) => {
  if (!isNew) return 'var(--tw-shadows-card)';
  switch (status) {
    case 'hit': return 'var(--tw-shadows-glow-hit), var(--tw-shadows-card)';
    case 'miss': return 'var(--tw-shadows-glow-miss), var(--tw-shadows-card)';
    default: return 'var(--tw-shadows-card)';
  }
};

export default function CacheLineCard({ index, valid, tag, data, hits, status, isNewStatus }: CacheLineCardProps) {
  const color = statusColors[status];
  
  // Organic noise background generator
  const patternId = `noise-${index}`;

  return (
    <motion.div
      layoutId={`cache-line-${index}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: isNewStatus ? (status === 'miss' ? [0.95, 1] : status === 'evicted' ? [0.95, 1] : 1) : 1,
        opacity: 1,
        boxShadow: getBoxShadow(status, isNewStatus)
      }}
      transition={{ 
        type: 'spring', 
        stiffness: isNewStatus ? 400 : 200, 
        damping: isNewStatus ? 20 : 30 
      }}
      className={`relative overflow-hidden rounded-xl border border-border backdrop-blur-md p-4 flex flex-col h-full transition-colors duration-300 ${bgColors[status]}`}
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDEiLz4KPHBhdGggZD0iTTAgMEw0IDRNMCA0TDQgMCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIvPgo8L3N2Zz4=')]"></div>

      {/* Ripple on HIT */}
      <AnimatePresence>
        {isNewStatus && status === 'hit' && (
          <motion.div
            key={`ripple-${index}-${hits}`} // Force re-render on new hit count
            className="absolute inset-0 bg-hit/20 rounded-xl"
            initial={{ scale: 0.5, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Header Badge */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-[10px] font-mono font-medium text-textMuted select-none">
          #{index}
        </span>
        <div className="flex items-center gap-2">
          {/* Animated SVG Badge */}
          <div className="w-4 h-4 relative">
            <svg viewBox="0 0 24 24" className="w-full h-full -rotate-90">
              <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
              <motion.circle 
                cx="12" cy="12" r="10" 
                fill="none" 
                stroke={color} 
                strokeWidth="4" 
                strokeLinecap="round"
                strokeDasharray="62.83" // 2 * pi * 10
                initial={{ strokeDashoffset: 62.83 }}
                animate={{ strokeDashoffset: status !== 'empty' ? 0 : 62.83 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </svg>
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase select-none" style={{ color }}>
            {status}
          </span>
        </div>
      </div>

      {/* Data Rows */}
      <div className="mt-auto space-y-1.5 relative z-10 flex-1 flex flex-col justify-end">
        <div className="flex justify-between items-baseline">
          <span className="text-[10px] text-textMuted uppercase font-semibold">Tag</span>
          <span className="text-[11px] font-mono font-medium text-textMain">
            {valid && tag !== null ? `0x${tag.toString(16).toUpperCase()}` : '—'}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-[10px] text-textMuted uppercase font-semibold">Data</span>
          <span className="text-[11px] font-mono font-medium text-textMain">
            {valid && data !== null ? data : '—'}
          </span>
        </div>
        <div className="flex justify-between items-baseline pt-1 mt-1 border-t border-border/50">
          <span className="text-[10px] text-textMuted uppercase font-semibold">Hits</span>
          <motion.span 
            key={`hitc-${hits}`}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-[11px] font-mono font-medium text-textMain"
          >
            {hits}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
