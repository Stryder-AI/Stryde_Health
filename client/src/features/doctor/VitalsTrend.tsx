import { useRef, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────

export interface VitalsDataPoint {
  date: string;       // e.g. "29 Mar"
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  weight?: number;
}

interface ReferenceRange {
  min: number;
  max: number;
  warn: number;
  high?: number;
}

const BP_SYSTOLIC_RANGE: ReferenceRange = { min: 90, max: 120, warn: 140, high: 180 };
const BP_DIASTOLIC_RANGE: ReferenceRange = { min: 60, max: 80, warn: 90, high: 110 };
const PULSE_RANGE: ReferenceRange = { min: 60, max: 100, warn: 110 };

// ── Sparkline Component ───────────────────────────────────────

interface SparklineProps {
  data: number[];
  labels: string[];
  range?: ReferenceRange;
  color?: string;
  width?: number;
  height?: number;
}

function Sparkline({ data, labels, range, color = '#0D9488', width = 300, height = 80 }: SparklineProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);

  const padding = { top: 8, right: 12, bottom: 24, left: 28 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minVal = Math.min(...data) - 5;
  const maxVal = Math.max(...data) + 5;
  const valRange = maxVal - minVal || 1;

  const toX = (i: number) => padding.left + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => padding.top + chartH - ((v - minVal) / valRange) * chartH;

  // Build SVG path
  const points = data.map((v, i) => ({ x: toX(i), y: toY(v) }));
  const pathD = points
    .map((p, i) => {
      if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      const prev = points[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `C${cpx.toFixed(1)},${prev.y.toFixed(1)} ${cpx.toFixed(1)},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(' ');

  // Fill path (area under line)
  const fillD = `${pathD} L${points[points.length - 1].x.toFixed(1)},${(padding.top + chartH).toFixed(1)} L${points[0].x.toFixed(1)},${(padding.top + chartH).toFixed(1)} Z`;

  // Get color for value
  const getValueColor = (v: number): string => {
    if (!range) return color;
    if (v > (range.high ?? range.warn + 20)) return '#ef4444';
    if (v > range.warn) return '#f59e0b';
    if (v < range.min) return '#f59e0b';
    return '#10b981';
  };

  // Ref range shading positions
  const refTop = range ? toY(range.max) : null;
  const refBottom = range ? Math.min(toY(range.min), padding.top + chartH) : null;

  // Animate on mount
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Stroke-dasharray for animation
  const pathLength = pathRef.current?.getTotalLength() ?? 1000;

  return (
    <div className="relative select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        style={{ overflow: 'visible' }}
        role="img"
        aria-label="Vitals sparkline chart"
      >
        {/* Reference range shading */}
        {refTop !== null && refBottom !== null && (
          <rect
            x={padding.left}
            y={refTop}
            width={chartW}
            height={Math.max(0, refBottom - refTop)}
            fill="#10b981"
            opacity="0.08"
            rx="2"
          />
        )}

        {/* Y-axis grid lines + labels */}
        {[0, 0.5, 1].map((t) => {
          const v = minVal + t * valRange;
          const y = toY(v);
          return (
            <g key={t}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartW}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeWidth="1"
              />
              <text
                x={padding.left - 4}
                y={y + 4}
                textAnchor="end"
                fontSize="8"
                fill="currentColor"
                opacity="0.4"
              >
                {Math.round(v)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={fillD} fill={color} opacity="0.06" />

        {/* Line */}
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={
            animated
              ? { strokeDasharray: 'none', transition: 'stroke-dashoffset 0.8s ease-out' }
              : { strokeDasharray: pathLength, strokeDashoffset: pathLength }
          }
        />

        {/* Data points */}
        {points.map((p, i) => {
          const ptColor = getValueColor(data[i]);
          const isHovered = hovered === i;
          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 5 : 3.5}
                fill={ptColor}
                stroke="var(--background)"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              {/* Hover tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={Math.min(p.x - 22, chartW + padding.left - 44)}
                    y={p.y - 28}
                    width={44}
                    height={20}
                    rx={4}
                    fill="var(--surface)"
                    stroke="var(--surface-border)"
                    strokeWidth="1"
                  />
                  <text
                    x={Math.min(p.x - 22, chartW + padding.left - 44) + 22}
                    y={p.y - 14}
                    textAnchor="middle"
                    fontSize="9"
                    fill="currentColor"
                    fontWeight="600"
                  >
                    {data[i]}
                  </text>
                </g>
              )}
              {/* X-axis label */}
              <text
                x={p.x}
                y={padding.top + chartH + 14}
                textAnchor="middle"
                fontSize="8"
                fill="currentColor"
                opacity="0.4"
              >
                {labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Trend Arrow ───────────────────────────────────────────────

function TrendArrow({ values, range }: { values: number[]; range?: ReferenceRange }) {
  if (values.length < 2) return null;
  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  const diff = last - prev;

  let colorClass = 'text-[var(--text-tertiary)]';
  if (range) {
    if (last > (range.high ?? range.warn + 20)) colorClass = 'text-red-500';
    else if (last > range.warn || last < range.min) colorClass = 'text-amber-500';
    else colorClass = 'text-emerald-500';
  }

  if (Math.abs(diff) < 1) return <Minus className={`w-4 h-4 ${colorClass}`} />;
  if (diff > 0) return <TrendingUp className={`w-4 h-4 ${colorClass}`} />;
  return <TrendingDown className={`w-4 h-4 ${colorClass}`} />;
}

function valueColor(v: number, range?: ReferenceRange): string {
  if (!range) return 'text-[var(--text-primary)]';
  if (v > (range.high ?? range.warn + 20)) return 'text-red-500';
  if (v > range.warn || v < range.min) return 'text-amber-500';
  return 'text-emerald-500';
}

// ── VitalsTrend Component ─────────────────────────────────────

interface VitalsTrendProps {
  data: VitalsDataPoint[];
}

export default function VitalsTrend({ data }: VitalsTrendProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-10">
        <Activity className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
        <p className="text-sm text-[var(--text-tertiary)]">No vitals history available.</p>
      </div>
    );
  }

  const labels = data.map((d) => d.date.replace(/\s+\d{4}$/, '').replace(/^\d+\s+/, (m) => m.trim().slice(0, 3) + ' ').slice(0, 6));

  const systolicValues = data.map((d) => d.systolic).filter((v): v is number => v !== undefined);
  const diastolicValues = data.map((d) => d.diastolic).filter((v): v is number => v !== undefined);
  const pulseValues = data.map((d) => d.pulse).filter((v): v is number => v !== undefined);
  const weightValues = data.map((d) => d.weight).filter((v): v is number => v !== undefined);

  const latestSystolic = systolicValues[systolicValues.length - 1];
  const latestDiastolic = diastolicValues[diastolicValues.length - 1];
  const latestPulse = pulseValues[pulseValues.length - 1];
  const latestWeight = weightValues[weightValues.length - 1];

  const bpLabels = data.filter((d) => d.systolic !== undefined).map((d) => d.date.split(' ').slice(0, 2).join(' '));
  const pulseLabels = data.filter((d) => d.pulse !== undefined).map((d) => d.date.split(' ').slice(0, 2).join(' '));
  const weightLabels = data.filter((d) => d.weight !== undefined).map((d) => d.date.split(' ').slice(0, 2).join(' '));

  return (
    <div className="space-y-6">
      {/* Blood Pressure */}
      {systolicValues.length >= 2 && (
        <ChartCard
          title="Blood Pressure"
          subtitle="Systolic / Diastolic"
          currentLabel={latestSystolic !== undefined && latestDiastolic !== undefined
            ? `${latestSystolic}/${latestDiastolic} mmHg`
            : '—'}
          currentColor={valueColor(latestSystolic ?? 0, BP_SYSTOLIC_RANGE)}
          trend={<TrendArrow values={systolicValues} range={BP_SYSTOLIC_RANGE} />}
          refRangeLabel="Normal: 90–120 / 60–80 mmHg"
        >
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Systolic</p>
              <Sparkline
                data={systolicValues}
                labels={bpLabels}
                range={BP_SYSTOLIC_RANGE}
                color="#ef4444"
              />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Diastolic</p>
              <Sparkline
                data={diastolicValues}
                labels={bpLabels}
                range={BP_DIASTOLIC_RANGE}
                color="#f97316"
              />
            </div>
          </div>
        </ChartCard>
      )}

      {/* Pulse */}
      {pulseValues.length >= 2 && (
        <ChartCard
          title="Pulse Rate"
          subtitle="Beats per minute"
          currentLabel={latestPulse !== undefined ? `${latestPulse} bpm` : '—'}
          currentColor={valueColor(latestPulse ?? 0, PULSE_RANGE)}
          trend={<TrendArrow values={pulseValues} range={PULSE_RANGE} />}
          refRangeLabel="Normal: 60–100 bpm"
        >
          <Sparkline
            data={pulseValues}
            labels={pulseLabels}
            range={PULSE_RANGE}
            color="#8B5CF6"
          />
        </ChartCard>
      )}

      {/* Weight */}
      {weightValues.length >= 2 && (
        <ChartCard
          title="Weight"
          subtitle="Kilograms"
          currentLabel={latestWeight !== undefined ? `${latestWeight} kg` : '—'}
          currentColor="text-[var(--primary)]"
          trend={<TrendArrow values={weightValues} />}
          refRangeLabel="Trend only — no standard range"
        >
          <Sparkline
            data={weightValues}
            labels={weightLabels}
            color="#0D9488"
          />
        </ChartCard>
      )}
    </div>
  );
}

// ── Chart Card ────────────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  currentLabel,
  currentColor,
  trend,
  refRangeLabel,
  children,
}: {
  title: string;
  subtitle: string;
  currentLabel: string;
  currentColor: string;
  trend: React.ReactNode;
  refRangeLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card-static p-4 rounded-[var(--radius-sm)]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">{title}</h4>
          <p className="text-[10px] text-[var(--text-tertiary)]">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${currentColor}`}>{currentLabel}</span>
          {trend}
        </div>
      </div>

      {children}

      <div className="flex items-center gap-2 mt-2">
        <div className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/40" />
        <span className="text-[10px] text-[var(--text-tertiary)]">{refRangeLabel}</span>
      </div>
    </div>
  );
}
