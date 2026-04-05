import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface HeatmapCellData {
  address: number;
  count: number;
}

interface HeatmapGridProps {
  data: Record<number, number>;
  gridSize?: number;
}

export default function HeatmapGrid({ data, gridSize = 16 }: HeatmapGridProps) {
  const totalCells = gridSize * gridSize;

  const { cells, maxCount } = useMemo(() => {
    let max = 0;
    const cellData: HeatmapCellData[] = [];
    for (let i = 0; i < totalCells; i++) {
        const count = data[i] || 0;
        if (count > max) max = count;
        cellData.push({ address: i, count });
    }
    return { cells: cellData, maxCount: max };
  }, [data, totalCells]);

  // Interpolate #1C1C27 -> #6366F1 -> #A78BFA
  const getColor = (count: number) => {
    if (count === 0) return '#1C1C27'; // surfaceHigh token
    const intensity = maxCount > 0 ? count / maxCount : 0;
    
    // Low intensity (0 -> 0.5) interpolates surfaceHigh to accent (#6366F1)
    // High intensity (0.5 -> 1.0) interpolates accent to accentSoft (#818CF8) or a warmer tone
    if (intensity < 0.5) {
      const r = intensity * 2;
      return `color-mix(in srgb, #6366F1 ${r * 100}%, #1C1C27)`;
    } else {
      const r = (intensity - 0.5) * 2;
      return `color-mix(in srgb, #A78BFA ${r * 100}%, #6366F1)`;
    }
  };

  const cellSize = 12;
  const gap = 2;
  const svgWidth = gridSize * (cellSize + gap) - gap;
  const svgHeight = svgWidth;

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <svg 
        viewBox={`-20 -20 ${svgWidth + 30} ${svgHeight + 30}`} 
        className="w-full h-auto max-w-sm drop-shadow-xl"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Axes */}
        <g className="font-mono text-[8px] fill-textMuted select-none">
          {[0, 4, 8, 12].map(num => (
            <React.Fragment key={`axis-${num}`}>
              <text x={num * (cellSize + gap) + cellSize/2} y="-6" textAnchor="middle">{num}</text>
              <text x="-6" y={num * (cellSize + gap) + cellSize/2 + 3} textAnchor="end">{num}</text>
            </React.Fragment>
          ))}
        </g>

        {/* Cells */}
        <g>
          {cells.map((cell, i) => {
            const x = (i % gridSize) * (cellSize + gap);
            const y = Math.floor(i / gridSize) * (cellSize + gap);
            return (
              <g key={cell.address} className="group cursor-crosshair">
                <motion.rect
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  rx="3"
                  initial={{ fill: '#1C1C27' }}
                  animate={{ fill: getColor(cell.count) }}
                  transition={{ duration: 0.3 }}
                  className="stroke-border stroke-[0.5] hover:stroke-accent hover:stroke-[1.5] transition-all"
                />
                
                {/* Tooltip via foreignObject */}
                <foreignObject x={x - 40} y={y - 45} width="90" height="40" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 overflow-visible">
                  <div className="bg-surfaceHigh border border-border rounded-lg shadow-card p-1 text-center whitespace-nowrap">
                    <div className="text-[9px] text-textMuted uppercase">Addr: <span className="font-mono text-textCode">{cell.address}</span></div>
                    <div className="text-[10px] font-bold text-textMain">Hits: {cell.count}</div>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-2 w-full max-w-sm px-4">
        <span className="text-[10px] text-textMuted uppercase font-semibold">Cold</span>
        <svg height="8" width="100%" className="flex-1 rounded-full overflow-hidden">
          <defs>
            <linearGradient id="heatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1C1C27" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#heatGrad)" />
        </svg>
        <span className="text-[10px] text-textMuted uppercase font-semibold">Hot</span>
      </div>
    </div>
  );
}
