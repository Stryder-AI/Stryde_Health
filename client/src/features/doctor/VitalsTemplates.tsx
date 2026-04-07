import { useState } from 'react';
import { Zap, Check, Heart, Thermometer, Baby, UserRound } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────

interface Vitals {
  bpSystolic: string;
  bpDiastolic: string;
  pulse: string;
  temperature: string;
  spo2: string;
  weight: string;
}

interface VitalPreset {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  vitals: Vitals;
}

interface VitalsTemplatesProps {
  onApply: (vitals: Vitals) => void;
}

// ── Presets ───────────────────────────────────────────────────

const presets: VitalPreset[] = [
  {
    id: 'normal-adult',
    label: 'Normal Adult',
    icon: Heart,
    color: 'text-emerald-500',
    vitals: { bpSystolic: '120', bpDiastolic: '80', pulse: '72', temperature: '98.6', spo2: '98', weight: '' },
  },
  {
    id: 'hypertensive',
    label: 'Hypertensive',
    icon: Heart,
    color: 'text-red-500',
    vitals: { bpSystolic: '160', bpDiastolic: '100', pulse: '88', temperature: '98.6', spo2: '97', weight: '' },
  },
  {
    id: 'febrile',
    label: 'Febrile',
    icon: Thermometer,
    color: 'text-orange-500',
    vitals: { bpSystolic: '110', bpDiastolic: '70', pulse: '96', temperature: '101.2', spo2: '97', weight: '' },
  },
  {
    id: 'post-op',
    label: 'Post-Op',
    icon: Zap,
    color: 'text-blue-500',
    vitals: { bpSystolic: '130', bpDiastolic: '85', pulse: '78', temperature: '99.1', spo2: '96', weight: '' },
  },
  {
    id: 'pediatric',
    label: 'Pediatric Normal',
    icon: Baby,
    color: 'text-purple-500',
    vitals: { bpSystolic: '90', bpDiastolic: '60', pulse: '100', temperature: '98.6', spo2: '99', weight: '' },
  },
  {
    id: 'elderly',
    label: 'Elderly',
    icon: UserRound,
    color: 'text-amber-600',
    vitals: { bpSystolic: '140', bpDiastolic: '85', pulse: '68', temperature: '97.8', spo2: '95', weight: '' },
  },
];

// ── Component ────────────────────────────────────────────────

export default function VitalsTemplates({ onApply }: VitalsTemplatesProps) {
  const [applied, setApplied] = useState<string | null>(null);

  const handleApply = (preset: VitalPreset) => {
    onApply(preset.vitals);
    setApplied(preset.id);
    setTimeout(() => setApplied(null), 2000);
  };

  return (
    <div className="glass-card-static p-3 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-3.5 h-3.5 text-[var(--primary)]" />
        <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
          Quick Vitals Presets
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => {
          const Icon = preset.icon;
          const isApplied = applied === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleApply(preset)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all duration-300 ${
                isApplied
                  ? 'bg-[var(--primary)] text-white shadow-[0_0_12px_var(--primary-glow)]'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--surface-border)] hover:border-[var(--primary)]/40 hover:bg-[var(--primary-light)] hover:text-[var(--primary)]'
              }`}
            >
              {isApplied ? (
                <Check className="w-3 h-3" />
              ) : (
                <Icon className={`w-3 h-3 ${preset.color}`} />
              )}
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
