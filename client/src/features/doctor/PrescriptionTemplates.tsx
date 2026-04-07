import { useState } from 'react';
import {
  Heart, Droplets, Flame, Wind, Pill, ShieldPlus,
  ChevronDown, ChevronUp, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toast';
import type { Medicine } from './PrescriptionForm';

// ── Types ─────────────────────────────────────────────────────

interface PrescriptionTemplate {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  medicines: Omit<Medicine, 'id'>[];
}

interface PrescriptionTemplatesProps {
  onApply: (medicines: Medicine[]) => void;
}

// ── Templates ────────────────────────────────────────────────

const templates: PrescriptionTemplate[] = [
  {
    id: 'hypertension',
    name: 'Hypertension Standard',
    icon: Heart,
    color: 'text-red-500',
    medicines: [
      { name: 'Amlodipine 5mg', dosage: '5mg', frequency: 'OD', duration: 'Ongoing', route: 'Oral', instructions: 'Take in the morning' },
      { name: 'Aspirin 75mg', dosage: '75mg', frequency: 'OD', duration: 'Ongoing', route: 'Oral', instructions: 'Take after breakfast' },
    ],
  },
  {
    id: 'diabetes-t2',
    name: 'Diabetes Type 2',
    icon: Droplets,
    color: 'text-amber-500',
    medicines: [
      { name: 'Metformin 500mg', dosage: '500mg', frequency: 'BD', duration: 'Ongoing', route: 'Oral', instructions: 'Take with meals' },
      { name: 'Glimepiride 2mg', dosage: '2mg', frequency: 'OD', duration: 'Ongoing', route: 'Oral', instructions: 'Take before breakfast' },
    ],
  },
  {
    id: 'chest-pain',
    name: 'Chest Pain (Cardiac)',
    icon: Heart,
    color: 'text-rose-600',
    medicines: [
      { name: 'Aspirin 75mg', dosage: '75mg', frequency: 'OD', duration: 'Ongoing', route: 'Oral', instructions: 'Take after breakfast' },
      { name: 'Atorvastatin 20mg', dosage: '20mg', frequency: 'HS', duration: 'Ongoing', route: 'Oral', instructions: 'Take at bedtime' },
      { name: 'Nitroglycerin 0.5mg', dosage: '0.5mg', frequency: 'SOS', duration: 'As needed', route: 'Sublingual', instructions: 'Place under tongue during chest pain' },
    ],
  },
  {
    id: 'upper-rti',
    name: 'Upper RTI',
    icon: Wind,
    color: 'text-blue-500',
    medicines: [
      { name: 'Amoxicillin 500mg', dosage: '500mg', frequency: 'TDS', duration: '5 days', route: 'Oral', instructions: 'Take after meals' },
      { name: 'Paracetamol 500mg', dosage: '500mg', frequency: 'TDS', duration: '3 days', route: 'Oral', instructions: 'Take for fever/pain' },
      { name: 'Cetirizine 10mg', dosage: '10mg', frequency: 'OD', duration: '5 days', route: 'Oral', instructions: 'Take at bedtime' },
    ],
  },
  {
    id: 'gerd',
    name: 'Acid Reflux / GERD',
    icon: Flame,
    color: 'text-orange-500',
    medicines: [
      { name: 'Omeprazole 20mg', dosage: '20mg', frequency: 'BD', duration: '14 days', route: 'Oral', instructions: 'Take 30 min before meals' },
      { name: 'Domperidone 10mg', dosage: '10mg', frequency: 'TDS', duration: '7 days', route: 'Oral', instructions: 'Take before meals' },
    ],
  },
  {
    id: 'pain-mgmt',
    name: 'Pain Management',
    icon: ShieldPlus,
    color: 'text-purple-500',
    medicines: [
      { name: 'Paracetamol 500mg', dosage: '500mg', frequency: 'TDS', duration: '5 days', route: 'Oral', instructions: 'Take after meals' },
      { name: 'Diclofenac 50mg', dosage: '50mg', frequency: 'BD', duration: '5 days', route: 'Oral', instructions: 'Take after meals, avoid on empty stomach' },
    ],
  },
];

// ── Component ────────────────────────────────────────────────

export default function PrescriptionTemplates({ onApply }: PrescriptionTemplatesProps) {
  const [expanded, setExpanded] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const handleApply = (template: PrescriptionTemplate) => {
    const medicinesWithIds: Medicine[] = template.medicines.map((m) => ({
      ...m,
      id: crypto.randomUUID(),
    }));
    onApply(medicinesWithIds);
    toast.success(`Applied "${template.name}" template (${template.medicines.length} medicines added)`);
  };

  return (
    <div className="glass-card-static p-3 mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Prescription Templates</span>
          <Badge variant="default">{templates.length} presets</Badge>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {templates.map((template) => {
            const Icon = template.icon;
            const isPreviewing = previewId === template.id;
            return (
              <div
                key={template.id}
                className="rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] overflow-hidden transition-all duration-200"
              >
                <div className="flex items-center justify-between px-3 py-2.5">
                  <button
                    onClick={() => setPreviewId(isPreviewing ? null : template.id)}
                    className="flex items-center gap-2 text-left flex-1 min-w-0"
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${template.color}`} />
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {template.name}
                    </span>
                    <Badge variant="default" className="text-[10px] shrink-0">
                      {template.medicines.length} Rx
                    </Badge>
                  </button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="shrink-0 ml-2"
                    onClick={() => handleApply(template)}
                  >
                    <Pill className="w-3 h-3" />
                    Apply
                  </Button>
                </div>

                {isPreviewing && (
                  <div className="px-3 pb-3 pt-0">
                    <div className="bg-[var(--surface-hover)] rounded-[var(--radius-xs)] p-2.5 space-y-1.5">
                      {template.medicines.map((med, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-[var(--primary)] font-bold shrink-0">Rx {i + 1}</span>
                          <div className="text-[var(--text-secondary)]">
                            <span className="font-medium text-[var(--text-primary)]">{med.name}</span>
                            {' '}&middot; {med.frequency} &middot; {med.route}
                            {med.duration && <> &middot; {med.duration}</>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
