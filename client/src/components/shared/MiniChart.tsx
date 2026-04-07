import { useState } from 'react';
import { cn } from '@/lib/utils';

/* ─── Bar Chart ─────────────────────────────────────────────── */

interface BarChartData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  color?: string;
  className?: string;
}

export function BarChart({ data, height = 180, color = 'from-[var(--primary)] to-[var(--accent)]', className }: BarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn('flex items-end gap-2', className)} style={{ height }}>
      {data.map((d, i) => {
        const pct = (d.value / maxVal) * 100;
        return (
          <div
            key={d.label}
            className="flex-1 flex flex-col items-center gap-1.5 group relative"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* Tooltip */}
            {hoveredIdx === i && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-[var(--bg-base)] border border-[var(--surface-border)] shadow-lg z-10 whitespace-nowrap">
                <span className="text-[11px] font-semibold text-[var(--text-primary)]">{d.value.toLocaleString()}</span>
              </div>
            )}
            <span className="text-[10px] font-semibold text-[var(--text-secondary)]">{d.value}</span>
            <div className="w-full relative rounded-t-lg overflow-hidden bg-[var(--surface)] border border-[var(--surface-border)]" style={{ height: '100%' }}>
              <div
                className={`absolute bottom-0 left-0 right-0 rounded-t-lg bg-gradient-to-t ${color} transition-all duration-700 ease-out`}
                style={{ height: `${pct}%`, animationDelay: `${i * 50}ms` }}
              />
            </div>
            <span className="text-[9px] font-medium text-[var(--text-tertiary)]">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Line Chart (SVG) ──────────────────────────────────────── */

interface LineChartData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  className?: string;
}

export function LineChart({
  data,
  width = 400,
  height = 180,
  color = 'var(--primary)',
  fillColor = 'var(--primary)',
  className,
}: LineChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const padding = 24;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * chartW,
    y: padding + chartH - (d.value / maxVal) * chartH,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className={cn('relative', className)}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id="lineChartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padding}
            y1={padding + chartH * (1 - f)}
            x2={width - padding}
            y2={padding + chartH * (1 - f)}
            stroke="var(--surface-border)"
            strokeDasharray="4,4"
            strokeWidth="0.5"
          />
        ))}
        {/* Area fill */}
        <path d={areaD} fill="url(#lineChartFill)" className="transition-all duration-500" />
        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" className="transition-all duration-500" />
        {/* Data points */}
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
            <circle cx={p.x} cy={p.y} r={hoveredIdx === i ? 5 : 3} fill={color} stroke="var(--bg-base)" strokeWidth="2" className="transition-all duration-200 cursor-pointer" />
            {hoveredIdx === i && (
              <g>
                <rect x={p.x - 30} y={p.y - 28} width="60" height="20" rx="4" fill="var(--bg-base)" stroke="var(--surface-border)" />
                <text x={p.x} y={p.y - 15} textAnchor="middle" className="text-[10px] font-semibold" fill="var(--text-primary)">
                  {data[i].value.toLocaleString()}
                </text>
              </g>
            )}
          </g>
        ))}
        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={d.label}
            x={points[i].x}
            y={height - 4}
            textAnchor="middle"
            className="text-[9px]"
            fill="var(--text-tertiary)"
          >
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ─── Donut Chart (SVG) ─────────────────────────────────────── */

interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
  className?: string;
}

export function DonutChart({ data, size = 160, thickness = 3.5, centerLabel, centerValue, className }: DonutChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let offset = 0;

  return (
    <div className={cn('relative inline-block', className)}>
      <svg viewBox="0 0 36 36" width={size} height={size} className="-rotate-90">
        {data.map((d, i) => {
          const pct = (d.value / total) * 100;
          const gap = 100 - pct;
          const currentOffset = offset;
          offset += pct;
          return (
            <circle
              key={d.label}
              cx="18" cy="18" r="15.9155"
              fill="transparent"
              stroke={d.color}
              strokeWidth={hovered === i ? thickness + 1 : thickness}
              strokeDasharray={`${pct} ${gap}`}
              strokeDashoffset={-currentOffset}
              strokeLinecap="round"
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              opacity={hovered !== null && hovered !== i ? 0.4 : 1}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {centerValue && <span className="text-lg font-bold text-[var(--text-primary)]">{centerValue}</span>}
        {centerLabel && <span className="text-[10px] text-[var(--text-tertiary)]">{centerLabel}</span>}
      </div>
      {hovered !== null && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-[var(--bg-base)] border border-[var(--surface-border)] shadow-lg z-10 whitespace-nowrap">
          <span className="text-[11px] font-semibold text-[var(--text-primary)]">
            {data[hovered].label}: {data[hovered].value}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Spark Line ────────────────────────────────────────────── */

interface SparkLineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function SparkLine({ data, width = 80, height = 24, color = 'var(--primary)', className }: SparkLineProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg width={width} height={height} className={cn('inline-block', className)}>
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2" fill={color} />
    </svg>
  );
}
