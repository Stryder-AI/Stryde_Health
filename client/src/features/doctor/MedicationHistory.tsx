import { useState, useMemo } from 'react';
import { Pill, AlertTriangle, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Medicine } from './PrescriptionForm';

// ── Drug Class Database ───────────────────────────────────────

const DRUG_CLASSES: Record<string, string[]> = {
  NSAID: ['ibuprofen', 'diclofenac', 'naproxen', 'aspirin', 'indomethacin', 'celecoxib', 'piroxicam', 'meloxicam'],
  'Beta-blocker': ['metoprolol', 'atenolol', 'bisoprolol', 'propranolol', 'carvedilol', 'labetalol', 'nebivolol'],
  'ACE inhibitor': ['lisinopril', 'enalapril', 'ramipril', 'captopril', 'perindopril', 'quinapril', 'trandolapril'],
  Statin: ['atorvastatin', 'rosuvastatin', 'simvastatin', 'pravastatin', 'lovastatin', 'fluvastatin'],
  PPI: ['omeprazole', 'pantoprazole', 'esomeprazole', 'lansoprazole', 'rabeprazole'],
  Antibiotic: ['amoxicillin', 'ciprofloxacin', 'azithromycin', 'clarithromycin', 'doxycycline', 'metronidazole', 'ceftriaxone', 'vancomycin', 'levofloxacin'],
  CCB: ['amlodipine', 'verapamil', 'diltiazem', 'nifedipine', 'felodipine', 'lercanidipine'],
  'ARB': ['losartan', 'valsartan', 'telmisartan', 'irbesartan', 'candesartan', 'olmesartan'],
  'Diuretic': ['furosemide', 'hydrochlorothiazide', 'spironolactone', 'indapamide', 'chlorthalidone'],
  'Anticoagulant': ['warfarin', 'apixaban', 'rivaroxaban', 'dabigatran', 'heparin', 'enoxaparin'],
  Biguanide: ['metformin'],
  'Sulfonylurea': ['glimepiride', 'glibenclamide', 'glipizide', 'gliclazide'],
};

// ── Types ─────────────────────────────────────────────────────

export interface PastMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedDate: string;
  doctor: string;
}

interface MedicationHistoryProps {
  pastMedicines: PastMedicine[];
  currentMedicines: Medicine[];
}

// ── Utility ───────────────────────────────────────────────────

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\d+(\.\d+)?\s*(mg|mcg|ml|g|iu|mmol|%|units?)\b.*/gi, '')
    .trim();
}

function getDrugClass(name: string): string | null {
  const normalized = normalizeName(name);
  for (const [cls, drugs] of Object.entries(DRUG_CLASSES)) {
    if (drugs.includes(normalized)) return cls;
  }
  return null;
}

function daysBetween(dateStr: string): number {
  const now = new Date();
  const date = new Date(dateStr);
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Component ─────────────────────────────────────────────────

export default function MedicationHistory({ pastMedicines, currentMedicines }: MedicationHistoryProps) {
  const [expanded, setExpanded] = useState(true);

  const currentNames = useMemo(
    () => currentMedicines.map((m) => m.name).filter(Boolean),
    [currentMedicines]
  );

  const currentMedicines30d = useMemo(
    () => pastMedicines.filter((m) => daysBetween(m.prescribedDate) <= 30),
    [pastMedicines]
  );

  const recentMedicines = useMemo(
    () => pastMedicines.filter((m) => {
      const days = daysBetween(m.prescribedDate);
      return days > 30 && days <= 90;
    }),
    [pastMedicines]
  );

  const getWarnings = (med: PastMedicine): string[] => {
    const warnings: string[] = [];
    const normalizedPast = normalizeName(med.name);
    const pastClass = getDrugClass(med.name);

    for (const currentName of currentNames) {
      const normalizedCurrent = normalizeName(currentName);
      if (normalizedCurrent === normalizedPast) {
        warnings.push('Already Prescribed');
        break;
      }
    }

    if (pastClass && !warnings.includes('Already Prescribed')) {
      for (const currentName of currentNames) {
        const currentClass = getDrugClass(currentName);
        if (currentClass === pastClass) {
          warnings.push(`Similar Class (${pastClass})`);
          break;
        }
      }
    }

    return warnings;
  };

  if (pastMedicines.length === 0) return null;

  const totalWarnings = pastMedicines.filter((m) => getWarnings(m).length > 0).length;

  return (
    <div className={`rounded-[var(--radius-sm)] border overflow-hidden transition-all ${
      totalWarnings > 0 ? 'border-amber-500/40 bg-amber-500/5' : 'border-[var(--surface-border)] bg-[var(--surface)]/30'
    }`}>
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 gap-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2.5">
          <Pill className={`w-4 h-4 shrink-0 ${totalWarnings > 0 ? 'text-amber-500' : 'text-[var(--primary)]'}`} />
          <span className={`text-sm font-semibold ${totalWarnings > 0 ? 'text-amber-600' : 'text-[var(--text-primary)]'}`}>
            Medication History
          </span>
          <Badge variant="default" className="text-[10px]">{pastMedicines.length} medicines</Badge>
          {totalWarnings > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {totalWarnings} warning{totalWarnings !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" />
          : <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
        }
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-[var(--surface-border)]/50">

          {/* Current Medications (within 30 days) */}
          {currentMedicines30d.length > 0 && (
            <div className="pt-3">
              <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                Current Medications (last 30 days)
              </p>
              <div className="space-y-2">
                {currentMedicines30d.map((med, i) => {
                  const warnings = getWarnings(med);
                  return (
                    <MedRow key={i} med={med} warnings={warnings} />
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Medications (30-90 days) */}
          {recentMedicines.length > 0 && (
            <div className={currentMedicines30d.length > 0 ? 'pt-2 border-t border-[var(--surface-border)]/50' : 'pt-3'}>
              <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                Recent Medications (last 3 months)
              </p>
              <div className="space-y-2">
                {recentMedicines.map((med, i) => {
                  const warnings = getWarnings(med);
                  return (
                    <MedRow key={i} med={med} warnings={warnings} dimmed />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Med Row ───────────────────────────────────────────────────

function MedRow({ med, warnings, dimmed = false }: { med: PastMedicine; warnings: string[]; dimmed?: boolean }) {
  return (
    <div className={`glass-card-static p-3 rounded-[var(--radius-xs)] transition-all ${
      warnings.length > 0 ? 'border-amber-500/30' : ''
    } ${dimmed ? 'opacity-70' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[var(--text-primary)]">{med.name}</span>
            <span className="text-xs text-[var(--text-tertiary)]">{med.dosage}</span>
            <span className="text-xs text-[var(--text-secondary)]">{med.frequency}</span>
            {med.duration && (
              <span className="text-xs text-[var(--text-tertiary)]">· {med.duration}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock className="w-3 h-3 text-[var(--text-tertiary)]" />
            <span className="text-[10px] text-[var(--text-tertiary)]">
              {med.prescribedDate} · {med.doctor}
            </span>
          </div>
        </div>
        {warnings.length > 0 && (
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {warnings.map((w) => (
              <span
                key={w}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30"
              >
                <AlertTriangle className="w-3 h-3" />
                {w}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
