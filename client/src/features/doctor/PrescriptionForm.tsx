import { useState } from 'react';
import { Plus, Trash2, Pill } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// ── Types ─────────────────────────────────────────────────────

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
}

interface PrescriptionFormProps {
  medicines: Medicine[];
  onChange: (medicines: Medicine[]) => void;
}

// ── Options ───────────────────────────────────────────────────

const frequencyOptions = [
  { value: '', label: 'Select frequency' },
  { value: 'OD', label: 'OD (Once daily)' },
  { value: 'BD', label: 'BD (Twice daily)' },
  { value: 'TDS', label: 'TDS (Three times)' },
  { value: 'QID', label: 'QID (Four times)' },
  { value: '1+0+1', label: '1+0+1 (Morning & Night)' },
  { value: '1+1+1', label: '1+1+1 (Three times)' },
  { value: '1+0+0', label: '1+0+0 (Morning only)' },
  { value: '0+0+1', label: '0+0+1 (Night only)' },
  { value: 'SOS', label: 'SOS (As needed)' },
  { value: 'STAT', label: 'STAT (Immediately)' },
  { value: 'HS', label: 'HS (At bedtime)' },
  { value: 'Weekly', label: 'Weekly' },
];

const routeOptions = [
  { value: '', label: 'Select route' },
  { value: 'Oral', label: 'Oral' },
  { value: 'IV', label: 'IV (Intravenous)' },
  { value: 'IM', label: 'IM (Intramuscular)' },
  { value: 'SC', label: 'SC (Subcutaneous)' },
  { value: 'Topical', label: 'Topical' },
  { value: 'Sublingual', label: 'Sublingual' },
  { value: 'Inhalation', label: 'Inhalation' },
  { value: 'Rectal', label: 'Rectal' },
  { value: 'Nasal', label: 'Nasal' },
  { value: 'Ophthalmic', label: 'Ophthalmic (Eye)' },
  { value: 'Otic', label: 'Otic (Ear)' },
];

const commonMedicines = [
  'Amlodipine 5mg', 'Amlodipine 10mg', 'Atenolol 50mg', 'Aspirin 75mg',
  'Atorvastatin 20mg', 'Atorvastatin 40mg', 'Bisoprolol 5mg', 'Clopidogrel 75mg',
  'Enalapril 5mg', 'Losartan 50mg', 'Metformin 500mg', 'Metformin 1000mg',
  'Metoprolol 25mg', 'Metoprolol 50mg', 'Nitroglycerin 0.5mg', 'Omeprazole 20mg',
  'Paracetamol 500mg', 'Ramipril 5mg', 'Rosuvastatin 10mg', 'Warfarin 5mg',
];

// ── Component ─────────────────────────────────────────────────

export default function PrescriptionForm({ medicines, onChange }: PrescriptionFormProps) {
  const [suggestions, setSuggestions] = useState<{ id: string; list: string[] }>({
    id: '',
    list: [],
  });

  const createEmptyMedicine = (): Medicine => ({
    id: crypto.randomUUID(),
    name: '',
    dosage: '',
    frequency: 'BD',
    duration: '',
    route: 'Oral',
    instructions: '',
  });

  const addMedicine = () => {
    onChange([...medicines, createEmptyMedicine()]);
  };

  const removeMedicine = (id: string) => {
    onChange(medicines.filter((m) => m.id !== id));
  };

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    onChange(
      medicines.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );

    // Autocomplete logic for medicine name
    if (field === 'name' && value.length >= 2) {
      const filtered = commonMedicines.filter((med) =>
        med.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions({ id, list: filtered.slice(0, 5) });
    } else if (field === 'name') {
      setSuggestions({ id: '', list: [] });
    }
  };

  const selectSuggestion = (id: string, name: string) => {
    updateMedicine(id, 'name', name);
    setSuggestions({ id: '', list: [] });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="w-4 h-4 text-[var(--primary)]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Prescription</h3>
          <Badge variant="default">{medicines.length} items</Badge>
        </div>
        <Button size="sm" variant="secondary" onClick={addMedicine}>
          <Plus className="w-3.5 h-3.5" />
          Add Medicine
        </Button>
      </div>

      {/* Medicines list */}
      {medicines.length === 0 ? (
        <div className="glass-card-static p-6 text-center border-2 border-dashed border-[var(--surface-border)]">
          <Pill className="w-6 h-6 text-[var(--text-tertiary)] mx-auto mb-2" />
          <p className="text-sm text-[var(--text-tertiary)]">No medicines added yet</p>
          <Button size="sm" variant="ghost" className="mt-2" onClick={addMedicine}>
            <Plus className="w-3.5 h-3.5" />
            Add First Medicine
          </Button>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {medicines.map((med, index) => (
            <div
              key={med.id}
              className="glass-card-static p-4 space-y-3 relative group"
            >
              {/* Medicine number & remove */}
              <div className="flex items-center justify-between">
                <Badge variant="info" className="text-[10px]">
                  Rx {index + 1}
                </Badge>
                <button
                  onClick={() => removeMedicine(med.id)}
                  className="p-1.5 rounded-[var(--radius-xs)] text-[var(--text-tertiary)] hover:text-red-500 hover:bg-[var(--danger-bg)] transition-all opacity-0 group-hover:opacity-100"
                  title="Remove medicine"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Row 1: Name + Dosage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 relative">
                  <Input
                    label="Medicine Name"
                    placeholder="Start typing medicine name..."
                    value={med.name}
                    onChange={(e) => updateMedicine(med.id, 'name', e.target.value)}
                    onBlur={() => setTimeout(() => setSuggestions({ id: '', list: [] }), 150)}
                  />
                  {/* Autocomplete dropdown */}
                  {suggestions.id === med.id && suggestions.list.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 glass-elevated rounded-[var(--radius-sm)] overflow-hidden shadow-lg">
                      {suggestions.list.map((s) => (
                        <button
                          key={s}
                          className="w-full text-left px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
                          onMouseDown={() => selectSuggestion(med.id, s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Input
                  label="Dosage"
                  placeholder="e.g., 5mg"
                  value={med.dosage}
                  onChange={(e) => updateMedicine(med.id, 'dosage', e.target.value)}
                />
              </div>

              {/* Row 2: Frequency, Duration, Route */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Frequency"
                  options={frequencyOptions}
                  value={med.frequency}
                  onChange={(e) => updateMedicine(med.id, 'frequency', e.target.value)}
                />
                <Input
                  label="Duration"
                  placeholder="e.g., 7 days, 2 weeks"
                  value={med.duration}
                  onChange={(e) => updateMedicine(med.id, 'duration', e.target.value)}
                />
                <Select
                  label="Route"
                  options={routeOptions}
                  value={med.route}
                  onChange={(e) => updateMedicine(med.id, 'route', e.target.value)}
                />
              </div>

              {/* Row 3: Instructions */}
              <Input
                label="Instructions"
                placeholder="e.g., Take after meals, Avoid grapefruit..."
                value={med.instructions}
                onChange={(e) => updateMedicine(med.id, 'instructions', e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
