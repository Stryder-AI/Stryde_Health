import { useState } from 'react';
import { FlaskConical, AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// ── Types ─────────────────────────────────────────────────────

export interface LabOrder {
  testId: string;
  testName: string;
  category: string;
  selected: boolean;
}

export interface LabOrderState {
  tests: LabOrder[];
  priority: 'normal' | 'urgent';
  notes: string;
}

interface LabOrderFormProps {
  state: LabOrderState;
  onChange: (state: LabOrderState) => void;
  onSubmit?: () => void;
}

// ── Test Templates ────────────────────────────────────────────

export const defaultLabTests: LabOrder[] = [
  { testId: 'cbc', testName: 'CBC (Complete Blood Count)', category: 'Hematology', selected: false },
  { testId: 'lfts', testName: 'LFTs (Liver Function Tests)', category: 'Biochemistry', selected: false },
  { testId: 'rfts', testName: 'RFTs (Renal Function Tests)', category: 'Biochemistry', selected: false },
  { testId: 'lipid', testName: 'Lipid Profile', category: 'Biochemistry', selected: false },
  { testId: 'crp', testName: 'CRP (C-Reactive Protein)', category: 'Immunology', selected: false },
  { testId: 'urine', testName: 'Urine R/E (Routine Examination)', category: 'Urinalysis', selected: false },
  { testId: 'hba1c', testName: 'HbA1c (Glycated Hemoglobin)', category: 'Biochemistry', selected: false },
  { testId: 'thyroid', testName: 'Thyroid Profile (T3, T4, TSH)', category: 'Endocrinology', selected: false },
  { testId: 'serology', testName: 'Serology (HBsAg, Anti-HCV)', category: 'Serology', selected: false },
  { testId: 'coag', testName: 'Coagulation (PT/INR, APTT)', category: 'Hematology', selected: false },
  { testId: 'bsr', testName: 'Blood Sugar (Fasting/Random)', category: 'Biochemistry', selected: false },
  { testId: 'electrolytes', testName: 'Electrolytes (Na+, K+, Cl-, HCO3-)', category: 'Biochemistry', selected: false },
];

// ── Component ─────────────────────────────────────────────────

export default function LabOrderForm({ state, onChange, onSubmit }: LabOrderFormProps) {
  const selectedCount = state.tests.filter((t) => t.selected).length;

  const toggleTest = (testId: string) => {
    onChange({
      ...state,
      tests: state.tests.map((t) =>
        t.testId === testId ? { ...t, selected: !t.selected } : t
      ),
    });
  };

  const togglePriority = () => {
    onChange({
      ...state,
      priority: state.priority === 'normal' ? 'urgent' : 'normal',
    });
  };

  const setNotes = (notes: string) => {
    onChange({ ...state, notes });
  };

  // Group tests by category
  const categories = Array.from(new Set(state.tests.map((t) => t.category)));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Lab Orders</h3>
          {selectedCount > 0 && (
            <Badge variant="accent">{selectedCount} selected</Badge>
          )}
        </div>
        {/* Priority toggle */}
        <button
          onClick={togglePriority}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
            state.priority === 'urgent'
              ? 'bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
              : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--surface-border)] hover:border-red-300'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {state.priority === 'urgent' ? 'URGENT' : 'Normal Priority'}
        </button>
      </div>

      {/* Test checklist grouped by category */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat}>
            <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
              {cat}
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {state.tests
                .filter((t) => t.category === cat)
                .map((test) => (
                  <label
                    key={test.testId}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] cursor-pointer transition-all duration-200 ${
                      test.selected
                        ? 'bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.25)]'
                        : 'hover:bg-[var(--surface-hover)] border border-transparent'
                    }`}
                  >
                    <Checkbox
                      checked={test.selected}
                      onChange={() => toggleTest(test.testId)}
                    />
                    <span
                      className={`text-sm ${
                        test.selected
                          ? 'text-[var(--text-primary)] font-medium'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {test.testName}
                    </span>
                  </label>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[var(--text-secondary)]">
          Clinical Notes
        </label>
        <textarea
          value={state.notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions for lab (e.g., Fasting sample required)..."
          rows={2}
          className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300 ease-out hover:border-[var(--surface-border-hover)] hover:bg-[var(--surface-hover)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-hover)] focus:shadow-[0_0_0_3px_var(--primary-glow)] resize-none"
        />
      </div>

      {/* Order button */}
      {onSubmit && (
        <Button
          variant="primary"
          className="w-full"
          disabled={selectedCount === 0}
          onClick={onSubmit}
        >
          <FlaskConical className="w-4 h-4" />
          Order {selectedCount} Test{selectedCount !== 1 ? 's' : ''}
          {state.priority === 'urgent' && (
            <Badge variant="danger" className="ml-2 text-[10px]">URGENT</Badge>
          )}
        </Button>
      )}
    </div>
  );
}
