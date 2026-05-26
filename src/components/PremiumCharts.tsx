import React, { useState } from 'react';

// Help interpolate smooth curves for SVG paths
const getCurvePath = (points: { x: number; y: number }[]) => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX1 = p0.x + (p1.x - p0.x) / 2;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (p1.x - p0.x) / 2;
    const cpY2 = p1.y;
    path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }
  return path;
};

interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface AreaChartProps {
  data: ChartDataPoint[];
  height?: number;
  colorTheme?: 'indigo' | 'emerald' | 'amber' | 'violet';
  valueSuffix?: string;
}

export const PremiumAreaChart: React.FC<AreaChartProps> = ({
  data,
  height = 200,
  colorTheme = 'indigo',
  valueSuffix = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const colors = {
    indigo: {
      line: '#6366f1',
      gradStart: 'rgba(99, 102, 241, 0.4)',
      gradEnd: 'rgba(99, 102, 241, 0.0)',
      dot: '#818cf8',
    },
    emerald: {
      line: '#10b981',
      gradStart: 'rgba(16, 185, 129, 0.4)',
      gradEnd: 'rgba(16, 185, 129, 0.0)',
      dot: '#34d399',
    },
    amber: {
      line: '#f59e0b',
      gradStart: 'rgba(245, 158, 11, 0.4)',
      gradEnd: 'rgba(245, 158, 11, 0.0)',
      dot: '#fbbf24',
    },
    violet: {
      line: '#8b5cf6',
      gradStart: 'rgba(139, 92, 246, 0.4)',
      gradEnd: 'rgba(139, 92, 246, 0.0)',
      dot: '#a78bfa',
    },
  }[colorTheme];

  const padding = { top: 15, right: 15, bottom: 30, left: 35 };
  const graphWidth = 500;
  const graphHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.value), 4);
  const maxScaled = Math.ceil(maxVal * 1.15);

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(1, data.length - 1)) * (graphWidth * 0.9);
    const y = padding.top + graphHeight - (d.value / maxScaled) * graphHeight;
    return { x, y, ...d, index: i };
  });

  const curvePath = getCurvePath(points);
  
  // Close the area path for shading under the curve
  let areaPath = '';
  if (points.length > 0) {
    const first = points[0];
    const last = points[points.length - 1];
    areaPath = `${curvePath} L ${last.x} ${padding.top + graphHeight} L ${first.x} ${padding.top + graphHeight} Z`;
  }

  // Guidelines for Y-axis
  const yTicks = [0, Math.round(maxScaled / 2), maxScaled];

  return (
    <div className="relative w-full" id={`area-chart-container-${colorTheme}`}>
      <svg
        viewBox={`0 0 ${graphWidth + padding.left + padding.right} ${height}`}
        className="w-full h-auto overflow-visible font-sans select-none"
      >
        <defs>
          <linearGradient id={`grad-${colorTheme}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.line} stopOpacity="0.35" />
            <stop offset="100%" stopColor={colors.line} stopOpacity="0.0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Grid lines */}
        {yTicks.map((tick, i) => {
          const y = padding.top + graphHeight - (tick / maxScaled) * graphHeight;
          return (
            <g key={i} className="opacity-10">
              <line
                x1={padding.left}
                y1={y}
                x2={graphWidth + padding.left}
                y2={y}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-400"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - 8}
            textAnchor="middle"
            className="text-[10px] font-medium fill-slate-400 opacity-80"
          >
            {p.label}
          </text>
        ))}

        {/* Area segment */}
        {areaPath && (
          <path
            d={areaPath}
            fill={`url(#grad-${colorTheme})`}
            className="transition-all duration-300"
          />
        )}

        {/* Line segment */}
        {curvePath && (
          <path
            d={curvePath}
            fill="none"
            stroke={colors.line}
            strokeWidth={2.5}
            strokeLinecap="round"
            filter="url(#glow)"
            className="transition-all duration-300"
          />
        )}

        {/* Data points & Interaction anchors */}
        {points.map((p, i) => {
          const isHovered = hoveredIndex === i;
          return (
            <g key={i}>
              {/* Invisible touch target */}
              <circle
                cx={p.x}
                cy={p.y}
                r={16}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />

              {/* Glowing anchor point */}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 6 : 4}
                fill="#0f172a"
                stroke={colors.line}
                strokeWidth={isHovered ? 3 : 2}
                className="transition-all duration-150 pointer-events-none"
              />
            </g>
          );
        })}
      </svg>

      {/* HTML absolute overlay tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          className="absolute z-10 px-2.5 py-1.5 text-xs text-white rounded-lg shadow-xl bg-slate-950/90 border border-slate-700/60 backdrop-blur-md pointer-events-none animate-fade-in"
          style={{
            left: `${(points[hoveredIndex].x / (graphWidth + padding.left + padding.right)) * 100}%`,
            top: `${(points[hoveredIndex].y / height) * 100 - 24}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <span className="font-semibold block text-slate-300">
            {data[hoveredIndex].label}
          </span>
          <span className="text-sm font-bold text-white">
            {data[hoveredIndex].value}
            <span className="text-[10px] text-slate-400 font-normal ml-0.5">
              {valueSuffix}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};

interface BarChartProps {
  data: ChartDataPoint[];
  height?: number;
  colorTheme?: 'emerald' | 'amber' | 'indigo' | 'violet';
  valueSuffix?: string;
}

export const PremiumBarChart: React.FC<BarChartProps> = ({
  data,
  height = 160,
  colorTheme = 'emerald',
  valueSuffix = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const colors = {
    emerald: { bar: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
    amber: { bar: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
    indigo: { bar: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)' },
    violet: { bar: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' },
  }[colorTheme];

  const padding = { top: 10, right: 10, bottom: 25, left: 35 };
  const graphWidth = 460;
  const graphHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => d.value), 4);
  const maxScaled = Math.ceil(maxVal * 1.1);

  const ticks = [0, Math.round(maxScaled / 2), maxScaled];

  return (
    <div className="relative w-full" id={`bar-chart-container-${colorTheme}`}>
      <svg
        viewBox={`0 0 ${graphWidth + padding.left + padding.right} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <g stroke="#ffffff" strokeOpacity="0.05">
          {ticks.map((t, idx) => {
            const y = padding.top + graphHeight - (t / maxScaled) * graphHeight;
            return (
              <line
                key={idx}
                x1={padding.left}
                y1={y}
                x2={graphWidth + padding.left}
                y2={y}
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            );
          })}
        </g>

        {/* Render bars */}
        {data.map((d, i) => {
          const labelCount = data.length;
          const colWidth = (graphWidth / labelCount) * 0.55;
          const spacing = graphWidth / labelCount;
          const x = padding.left + i * spacing + (spacing - colWidth) / 2;

          const barHeight = (d.value / maxScaled) * graphHeight;
          const y = padding.top + graphHeight - barHeight;

          const isHovered = hoveredIdx === i;

          return (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Bar background gap for easy selection */}
              <rect
                x={x - 4}
                y={padding.top}
                width={colWidth + 8}
                height={graphHeight}
                fill="transparent"
              />

              {/* Main Bar block with rounded border radius */}
              <rect
                x={x}
                y={y}
                width={colWidth}
                height={Math.max(barHeight, 2)}
                rx={Math.min(colWidth / 2, 4)}
                fill={colors.bar}
                className="transition-all duration-200"
                opacity={isHovered ? 1.0 : 0.85}
                style={{
                  filter: isHovered ? `drop-shadow(0 0 4px ${colors.glow})` : 'none',
                }}
              />

              {/* Text label underneath */}
              <text
                x={x + colWidth / 2}
                y={height - 6}
                textAnchor="middle"
                className="text-[10px] font-medium fill-slate-400"
              >
                {d.label}
              </text>
            </g>
          );
        })}

        {/* Left Y Labels */}
        {ticks.map((t, idx) => {
          const y = padding.top + graphHeight - (t / maxScaled) * graphHeight;
          return (
            <text
              key={idx}
              x={padding.left - 8}
              y={y + 3}
              textAnchor="end"
              className="text-[9px] font-mono fill-slate-500"
            >
              {t}
            </text>
          );
        })}
      </svg>

      {/* Floating HTML tooltip */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div
          className="absolute z-10 px-2.5 py-1.5 text-xs text-white rounded-lg shadow-xl bg-slate-950/90 border border-slate-700/60 backdrop-blur-md pointer-events-none transition-all duration-100"
          style={{
            left: `${((padding.left + hoveredIdx * (graphWidth / data.length) + (graphWidth / data.length) / 2) / (graphWidth + padding.left + padding.right)) * 100}%`,
            top: `${((padding.top + graphHeight - (data[hoveredIdx].value / maxScaled) * graphHeight) / height) * 100 - 15}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <span className="font-semibold block text-slate-300">
            {data[hoveredIdx].label}
          </span>
          <span className="text-sm font-bold text-white">
            {data[hoveredIdx].value}
            <span className="text-[10px] text-slate-400 font-normal ml-0.5">
              {valueSuffix}
            </span>
          </span>
        </div>
      )}
    </div>
  );
};

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  colorTheme?: 'emerald' | 'amber' | 'indigo' | 'violet' | 'cyan';
  label?: string;
  sublabel?: string;
}

export const CircularRingProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 120,
  strokeWidth = 10,
  colorTheme = 'cyan',
  label = '',
  sublabel = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(Math.max(value, 0), max);
  const percentage = max > 0 ? clampedValue / max : 0;
  const strokeDashoffset = circumference - percentage * circumference;

  const colorMap = {
    cyan: '#06b6d4',
    emerald: '#10b981',
    amber: '#f59e0b',
    indigo: '#6366f1',
    violet: '#8b5cf6',
  };

  const ringColor = colorMap[colorTheme];

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }} id={`ring-${colorTheme}`}>
      <svg width={size} height={size} className="-rotate-95">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-800"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="transition-all duration-700 ease-out"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        {label ? (
          <span className="text-xl font-bold text-white tracking-tight leading-none">
            {label}
          </span>
        ) : (
          <span className="text-xl font-bold text-white tracking-tight leading-none">
            {Math.round(percentage * 100)}%
          </span>
        )}
        {sublabel && (
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
