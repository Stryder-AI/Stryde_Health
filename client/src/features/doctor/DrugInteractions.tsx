import { useState, useMemo } from 'react';
import { Shield, AlertTriangle, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Medicine } from './PrescriptionForm';

// ── Drug Interaction Database ─────────────────────────────────

interface InteractionEntry {
  drug: string;
  severity: 'major' | 'moderate' | 'minor';
  description: string;
}

const DRUG_INTERACTIONS: Record<string, InteractionEntry[]> = {
  aspirin: [
    { drug: 'warfarin', severity: 'major', description: 'Increased bleeding risk — combined antiplatelet + anticoagulant effect. Avoid or monitor INR closely.' },
    { drug: 'ibuprofen', severity: 'moderate', description: 'NSAIDs may decrease antiplatelet effect of aspirin and increase GI bleeding risk.' },
    { drug: 'methotrexate', severity: 'major', description: 'Aspirin reduces methotrexate elimination, increasing toxicity risk.' },
    { drug: 'clopidogrel', severity: 'moderate', description: 'Increased bleeding risk. Combination sometimes intentional in ACS but monitor carefully.' },
  ],
  metformin: [
    { drug: 'alcohol', severity: 'major', description: 'Risk of lactic acidosis increases with alcohol use.' },
    { drug: 'contrast dye', severity: 'major', description: 'Hold metformin 48hrs before/after IV contrast due to renal impairment risk.' },
  ],
  amlodipine: [
    { drug: 'simvastatin', severity: 'moderate', description: 'Amlodipine increases simvastatin levels — limit simvastatin to 20mg/day.' },
    { drug: 'cyclosporine', severity: 'major', description: 'Amlodipine levels may increase, risk of severe hypotension.' },
    { drug: 'atorvastatin', severity: 'moderate', description: 'Amlodipine may increase atorvastatin concentrations.' },
  ],
  atorvastatin: [
    { drug: 'clarithromycin', severity: 'major', description: 'Clarithromycin inhibits atorvastatin metabolism, increasing myopathy risk.' },
    { drug: 'gemfibrozil', severity: 'major', description: 'Risk of severe myopathy/rhabdomyolysis. Avoid combination.' },
    { drug: 'amlodipine', severity: 'moderate', description: 'Amlodipine may increase atorvastatin concentrations.' },
  ],
  lisinopril: [
    { drug: 'potassium', severity: 'moderate', description: 'ACE inhibitors can cause hyperkalemia. Monitor potassium levels.' },
    { drug: 'spironolactone', severity: 'moderate', description: 'Combined use can cause dangerous hyperkalemia.' },
    { drug: 'ibuprofen', severity: 'moderate', description: 'NSAIDs reduce ACE inhibitor efficacy and increase renal toxicity risk.' },
  ],
  omeprazole: [
    { drug: 'clopidogrel', severity: 'moderate', description: 'Omeprazole reduces antiplatelet effect of clopidogrel. Use pantoprazole instead.' },
    { drug: 'methotrexate', severity: 'moderate', description: 'PPIs may increase methotrexate toxicity.' },
  ],
  warfarin: [
    { drug: 'aspirin', severity: 'major', description: 'Major bleeding risk. Avoid unless specifically indicated (e.g., mechanical heart valve).' },
    { drug: 'amoxicillin', severity: 'moderate', description: 'Antibiotics can alter gut flora, affecting Vitamin K production and INR.' },
    { drug: 'ibuprofen', severity: 'major', description: 'NSAIDs + warfarin = high bleeding risk. Avoid. Use paracetamol instead.' },
    { drug: 'fluconazole', severity: 'major', description: 'Azole antifungals dramatically increase warfarin levels. Reduce warfarin dose and monitor.' },
    { drug: 'ciprofloxacin', severity: 'moderate', description: 'May increase anticoagulant effect. Monitor INR.' },
    { drug: 'paracetamol', severity: 'moderate', description: 'High-dose/chronic paracetamol can increase INR. Monitor if >2g/day.' },
    { drug: 'diclofenac', severity: 'major', description: 'Increased bleeding risk. Use paracetamol instead.' },
  ],
  clarithromycin: [
    { drug: 'atorvastatin', severity: 'major', description: 'Risk of statin myopathy. Temporarily suspend statin during clarithromycin course.' },
    { drug: 'carbamazepine', severity: 'major', description: 'Clarithromycin markedly increases carbamazepine levels — toxicity risk.' },
  ],
  ciprofloxacin: [
    { drug: 'theophylline', severity: 'major', description: 'Ciprofloxacin increases theophylline levels 2-3x. Reduce theophylline dose.' },
    { drug: 'antacids', severity: 'moderate', description: 'Antacids reduce ciprofloxacin absorption. Separate doses by 2 hours.' },
    { drug: 'warfarin', severity: 'moderate', description: 'May increase anticoagulant effect. Monitor INR.' },
  ],
  paracetamol: [
    { drug: 'warfarin', severity: 'moderate', description: 'High-dose/chronic paracetamol can increase INR. Monitor if >2g/day.' },
    { drug: 'alcohol', severity: 'major', description: 'Alcohol + paracetamol = hepatotoxicity risk. Avoid in chronic alcohol users.' },
  ],
  diclofenac: [
    { drug: 'aspirin', severity: 'moderate', description: 'Increased GI bleeding risk. Combined NSAIDs generally avoided.' },
    { drug: 'lithium', severity: 'moderate', description: 'NSAIDs reduce lithium excretion, increasing toxicity risk.' },
    { drug: 'warfarin', severity: 'major', description: 'Increased bleeding risk. Use paracetamol instead.' },
  ],
  metoprolol: [
    { drug: 'verapamil', severity: 'major', description: 'Combined negative chronotropic/inotropic effect — risk of heart block and cardiac arrest.' },
    { drug: 'clonidine', severity: 'major', description: 'Sudden clonidine withdrawal with beta-blocker can cause rebound hypertension.' },
  ],
  spironolactone: [
    { drug: 'lisinopril', severity: 'moderate', description: 'Combined use can cause dangerous hyperkalemia.' },
    { drug: 'potassium', severity: 'moderate', description: 'Risk of hyperkalemia, especially in renal impairment.' },
  ],
  ibuprofen: [
    { drug: 'aspirin', severity: 'moderate', description: 'NSAIDs may decrease antiplatelet effect of aspirin and increase GI bleeding risk.' },
    { drug: 'warfarin', severity: 'major', description: 'NSAIDs + warfarin = high bleeding risk. Avoid. Use paracetamol instead.' },
    { drug: 'lisinopril', severity: 'moderate', description: 'NSAIDs reduce ACE inhibitor efficacy and increase renal toxicity risk.' },
  ],
  clopidogrel: [
    { drug: 'aspirin', severity: 'moderate', description: 'Increased bleeding risk. Combination sometimes intentional in ACS but monitor carefully.' },
    { drug: 'omeprazole', severity: 'moderate', description: 'Omeprazole reduces antiplatelet effect of clopidogrel. Use pantoprazole instead.' },
  ],
};

// ── Types ─────────────────────────────────────────────────────

export interface Interaction {
  drugA: string;
  drugB: string;
  severity: 'major' | 'moderate' | 'minor';
  description: string;
}

// ── Utility Functions ─────────────────────────────────────────

function normalizeDrugName(name: string): string {
  // Remove dosage (e.g. "Paracetamol 500mg" → "paracetamol")
  return name
    .toLowerCase()
    .replace(/\s*\d+(\.\d+)?\s*(mg|mcg|ml|g|iu|mmol|%|units?)\b.*/gi, '')
    .trim();
}

export function checkInteractions(medicines: string[]): Interaction[] {
  const normalized = medicines.map((m) => normalizeDrugName(m));
  const found: Interaction[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < normalized.length; i++) {
    for (let j = i + 1; j < normalized.length; j++) {
      const drugA = normalized[i];
      const drugB = normalized[j];
      const key = [drugA, drugB].sort().join('||');
      if (seen.has(key)) continue;

      const interactionsA = DRUG_INTERACTIONS[drugA];
      if (interactionsA) {
        const match = interactionsA.find((e) => e.drug === drugB);
        if (match) {
          found.push({ drugA: medicines[i], drugB: medicines[j], severity: match.severity, description: match.description });
          seen.add(key);
          continue;
        }
      }

      const interactionsB = DRUG_INTERACTIONS[drugB];
      if (interactionsB) {
        const match = interactionsB.find((e) => e.drug === drugA);
        if (match) {
          found.push({ drugA: medicines[i], drugB: medicines[j], severity: match.severity, description: match.description });
          seen.add(key);
        }
      }
    }
  }

  // Sort: major first, then moderate, then minor
  const order = { major: 0, moderate: 1, minor: 2 };
  return found.sort((a, b) => order[a.severity] - order[b.severity]);
}

// ── Sub-components ────────────────────────────────────────────

interface SeverityBadgeProps {
  severity: 'major' | 'moderate' | 'minor';
}

function SeverityBadge({ severity }: SeverityBadgeProps) {
  if (severity === 'major') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-500 border border-red-500/30 uppercase tracking-wide">
        <AlertTriangle className="w-3 h-3" />
        Major
      </span>
    );
  }
  if (severity === 'moderate') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 uppercase tracking-wide">
        Moderate
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30 uppercase tracking-wide">
      Minor
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────

interface DrugInteractionAlertProps {
  medicines: Medicine[];
}

export default function DrugInteractionAlert({ medicines }: DrugInteractionAlertProps) {
  const [expanded, setExpanded] = useState(false);
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const medicineNames = useMemo(() => medicines.map((m) => m.name).filter(Boolean), [medicines]);

  const interactions = useMemo(() => checkInteractions(medicineNames), [medicineNames]);

  const majorCount = interactions.filter((i) => i.severity === 'major').length;
  const allMajorsAcknowledged = interactions
    .filter((i) => i.severity === 'major')
    .every((i) => acknowledged.has(`${i.drugA}||${i.drugB}`));

  const toggleAcknowledge = (key: string) => {
    setAcknowledged((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (medicineNames.length < 2) {
    return null;
  }

  return (
    <div className={`rounded-[var(--radius-sm)] border overflow-hidden transition-all duration-300 ${
      interactions.length === 0
        ? 'border-emerald-500/30 bg-emerald-500/5'
        : majorCount > 0
        ? 'border-red-500/40 bg-red-500/5'
        : 'border-amber-500/40 bg-amber-500/5'
    }`}>
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 gap-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2.5">
          {interactions.length === 0 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : majorCount > 0 ? (
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span className={`text-sm font-semibold ${
            interactions.length === 0
              ? 'text-emerald-600'
              : majorCount > 0
              ? 'text-red-500'
              : 'text-amber-600'
          }`}>
            {interactions.length === 0
              ? 'No drug interactions detected'
              : `${interactions.length} drug interaction${interactions.length !== 1 ? 's' : ''} detected`}
          </span>
          {interactions.length > 0 && (
            <div className="flex items-center gap-1.5">
              {majorCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                  {majorCount} major
                </span>
              )}
              {interactions.filter((i) => i.severity === 'moderate').length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {interactions.filter((i) => i.severity === 'moderate').length} moderate
                </span>
              )}
            </div>
          )}
        </div>
        {interactions.length > 0 && (
          expanded ? <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
        )}
      </button>

      {/* Interaction list */}
      {expanded && interactions.length > 0 && (
        <div className="px-4 pb-4 space-y-3 border-t border-[var(--surface-border)]/50">
          <p className="text-xs text-[var(--text-tertiary)] pt-3">
            Review these interactions before finalising the prescription:
          </p>
          {interactions.map((interaction) => {
            const key = `${interaction.drugA}||${interaction.drugB}`;
            const isAcknowledged = acknowledged.has(key);
            return (
              <div
                key={key}
                className={`rounded-[var(--radius-sm)] p-3.5 border transition-all ${
                  interaction.severity === 'major'
                    ? isAcknowledged
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-red-500/40 bg-red-500/10'
                    : 'border-amber-500/30 bg-amber-500/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {interaction.drugA}
                    </span>
                    <span className="text-[var(--text-tertiary)] font-bold text-xs">↔</span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {interaction.drugB}
                    </span>
                  </div>
                  <SeverityBadge severity={interaction.severity} />
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                  {interaction.description}
                </p>

                {/* Acknowledge checkbox for major interactions */}
                {interaction.severity === 'major' && (
                  <label className="flex items-center gap-2 mt-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isAcknowledged}
                      onChange={() => toggleAcknowledge(key)}
                      className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                    />
                    <span className={`text-xs font-semibold transition-colors ${
                      isAcknowledged ? 'text-emerald-600' : 'text-red-500 group-hover:text-red-400'
                    }`}>
                      {isAcknowledged
                        ? 'Acknowledged — proceeding with awareness'
                        : 'I acknowledge this major interaction and accept clinical responsibility'}
                    </span>
                  </label>
                )}
              </div>
            );
          })}

          {/* Warning banner if major interactions not all acknowledged */}
          {majorCount > 0 && !allMajorsAcknowledged && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-xs)] bg-red-500/10 border border-red-500/30">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <p className="text-xs text-red-500 font-medium">
                Please acknowledge all major interactions before completing the consultation.
              </p>
            </div>
          )}
          {majorCount > 0 && allMajorsAcknowledged && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-xs)] bg-emerald-500/10 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <p className="text-xs text-emerald-600 font-medium">
                All major interactions acknowledged. You may proceed.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
