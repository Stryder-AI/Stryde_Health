import { useState, useEffect } from 'react';
import {
  Search,
  FlaskConical,
  Droplets,
  Clock,
  Eye,
  Plus,
  ToggleLeft,
  ToggleRight,
  Hash,
  Beaker,
  DollarSign,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────

interface TemplateParameter {
  name: string;
  unit: string;
  maleRange: string;
  femaleRange: string;
  sortOrder: number;
}

interface LabTemplate {
  id: string;
  name: string;
  category: string;
  sampleType: 'Blood' | 'Urine' | 'Serum';
  parameterCount: number;
  turnaroundTime: string;
  price: string;
  active: boolean;
  parameters: TemplateParameter[];
  createdAt: string;
  modifiedAt: string;
}

// ─── Demo Data ─────────────────────────────────────────────────────────────

const demoTemplates: LabTemplate[] = [
  {
    id: 'TPL-001',
    name: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    sampleType: 'Blood',
    parameterCount: 14,
    turnaroundTime: '2 hours',
    price: 'Rs. 800',
    active: true,
    createdAt: '2025-01-15',
    modifiedAt: '2026-03-20',
    parameters: [
      { name: 'Hemoglobin (Hb)', unit: 'g/dL', maleRange: '13.0 - 17.0', femaleRange: '12.0 - 15.5', sortOrder: 1 },
      { name: 'RBC Count', unit: 'million/uL', maleRange: '4.5 - 5.5', femaleRange: '3.8 - 4.8', sortOrder: 2 },
      { name: 'WBC Count', unit: '/uL', maleRange: '4000 - 11000', femaleRange: '4000 - 11000', sortOrder: 3 },
      { name: 'Platelet Count', unit: '/uL', maleRange: '150000 - 400000', femaleRange: '150000 - 400000', sortOrder: 4 },
      { name: 'HCT (Hematocrit)', unit: '%', maleRange: '40 - 54', femaleRange: '36 - 48', sortOrder: 5 },
      { name: 'MCV', unit: 'fL', maleRange: '80 - 100', femaleRange: '80 - 100', sortOrder: 6 },
      { name: 'MCH', unit: 'pg', maleRange: '27 - 33', femaleRange: '27 - 33', sortOrder: 7 },
      { name: 'MCHC', unit: 'g/dL', maleRange: '32 - 36', femaleRange: '32 - 36', sortOrder: 8 },
      { name: 'ESR', unit: 'mm/hr', maleRange: '0 - 15', femaleRange: '0 - 20', sortOrder: 9 },
      { name: 'Neutrophils', unit: '%', maleRange: '40 - 70', femaleRange: '40 - 70', sortOrder: 10 },
      { name: 'Lymphocytes', unit: '%', maleRange: '20 - 40', femaleRange: '20 - 40', sortOrder: 11 },
      { name: 'Monocytes', unit: '%', maleRange: '2 - 8', femaleRange: '2 - 8', sortOrder: 12 },
      { name: 'Eosinophils', unit: '%', maleRange: '1 - 4', femaleRange: '1 - 4', sortOrder: 13 },
      { name: 'Basophils', unit: '%', maleRange: '0 - 1', femaleRange: '0 - 1', sortOrder: 14 },
    ],
  },
  {
    id: 'TPL-002',
    name: 'Liver Function Test (LFT)',
    category: 'Biochemistry',
    sampleType: 'Serum',
    parameterCount: 11,
    turnaroundTime: '3 hours',
    price: 'Rs. 1,200',
    active: true,
    createdAt: '2025-01-15',
    modifiedAt: '2026-03-18',
    parameters: [
      { name: 'Total Bilirubin', unit: 'mg/dL', maleRange: '0.1 - 1.2', femaleRange: '0.1 - 1.2', sortOrder: 1 },
      { name: 'Direct Bilirubin', unit: 'mg/dL', maleRange: '0.0 - 0.3', femaleRange: '0.0 - 0.3', sortOrder: 2 },
      { name: 'Indirect Bilirubin', unit: 'mg/dL', maleRange: '0.1 - 0.9', femaleRange: '0.1 - 0.9', sortOrder: 3 },
      { name: 'SGPT (ALT)', unit: 'U/L', maleRange: '7 - 56', femaleRange: '7 - 45', sortOrder: 4 },
      { name: 'SGOT (AST)', unit: 'U/L', maleRange: '10 - 40', femaleRange: '10 - 35', sortOrder: 5 },
      { name: 'Alkaline Phosphatase', unit: 'U/L', maleRange: '44 - 147', femaleRange: '44 - 147', sortOrder: 6 },
      { name: 'GGT', unit: 'U/L', maleRange: '9 - 48', femaleRange: '9 - 36', sortOrder: 7 },
      { name: 'Total Protein', unit: 'g/dL', maleRange: '6.0 - 8.3', femaleRange: '6.0 - 8.3', sortOrder: 8 },
      { name: 'Albumin', unit: 'g/dL', maleRange: '3.5 - 5.5', femaleRange: '3.5 - 5.5', sortOrder: 9 },
      { name: 'Globulin', unit: 'g/dL', maleRange: '2.0 - 3.5', femaleRange: '2.0 - 3.5', sortOrder: 10 },
      { name: 'A/G Ratio', unit: '', maleRange: '1.0 - 2.2', femaleRange: '1.0 - 2.2', sortOrder: 11 },
    ],
  },
  {
    id: 'TPL-003',
    name: 'Renal Function Test (RFT)',
    category: 'Biochemistry',
    sampleType: 'Serum',
    parameterCount: 8,
    turnaroundTime: '3 hours',
    price: 'Rs. 1,000',
    active: true,
    createdAt: '2025-01-15',
    modifiedAt: '2026-02-28',
    parameters: [
      { name: 'Blood Urea', unit: 'mg/dL', maleRange: '15 - 40', femaleRange: '15 - 40', sortOrder: 1 },
      { name: 'BUN', unit: 'mg/dL', maleRange: '7 - 20', femaleRange: '7 - 20', sortOrder: 2 },
      { name: 'Serum Creatinine', unit: 'mg/dL', maleRange: '0.7 - 1.3', femaleRange: '0.6 - 1.1', sortOrder: 3 },
      { name: 'Uric Acid', unit: 'mg/dL', maleRange: '3.5 - 7.2', femaleRange: '2.6 - 6.0', sortOrder: 4 },
      { name: 'Sodium (Na+)', unit: 'mEq/L', maleRange: '136 - 146', femaleRange: '136 - 146', sortOrder: 5 },
      { name: 'Potassium (K+)', unit: 'mEq/L', maleRange: '3.5 - 5.1', femaleRange: '3.5 - 5.1', sortOrder: 6 },
      { name: 'Chloride (Cl-)', unit: 'mEq/L', maleRange: '98 - 106', femaleRange: '98 - 106', sortOrder: 7 },
      { name: 'Calcium', unit: 'mg/dL', maleRange: '8.5 - 10.5', femaleRange: '8.5 - 10.5', sortOrder: 8 },
    ],
  },
  {
    id: 'TPL-004',
    name: 'Lipid Profile',
    category: 'Biochemistry',
    sampleType: 'Serum',
    parameterCount: 6,
    turnaroundTime: '2 hours',
    price: 'Rs. 900',
    active: true,
    createdAt: '2025-01-20',
    modifiedAt: '2026-03-15',
    parameters: [
      { name: 'Total Cholesterol', unit: 'mg/dL', maleRange: '< 200', femaleRange: '< 200', sortOrder: 1 },
      { name: 'Triglycerides', unit: 'mg/dL', maleRange: '< 150', femaleRange: '< 150', sortOrder: 2 },
      { name: 'HDL Cholesterol', unit: 'mg/dL', maleRange: '40 - 60', femaleRange: '50 - 60', sortOrder: 3 },
      { name: 'LDL Cholesterol', unit: 'mg/dL', maleRange: '< 100', femaleRange: '< 100', sortOrder: 4 },
      { name: 'VLDL Cholesterol', unit: 'mg/dL', maleRange: '5 - 40', femaleRange: '5 - 40', sortOrder: 5 },
      { name: 'Total/HDL Ratio', unit: '', maleRange: '< 5.0', femaleRange: '< 5.0', sortOrder: 6 },
    ],
  },
  {
    id: 'TPL-005',
    name: 'C-Reactive Protein (CRP)',
    category: 'Immunology',
    sampleType: 'Serum',
    parameterCount: 2,
    turnaroundTime: '1 hour',
    price: 'Rs. 600',
    active: true,
    createdAt: '2025-02-10',
    modifiedAt: '2026-03-01',
    parameters: [
      { name: 'CRP (Qualitative)', unit: '', maleRange: 'Negative', femaleRange: 'Negative', sortOrder: 1 },
      { name: 'CRP (Quantitative)', unit: 'mg/L', maleRange: '< 6.0', femaleRange: '< 6.0', sortOrder: 2 },
    ],
  },
  {
    id: 'TPL-006',
    name: 'Urine Routine Examination (RE)',
    category: 'Urinalysis',
    sampleType: 'Urine',
    parameterCount: 14,
    turnaroundTime: '1.5 hours',
    price: 'Rs. 500',
    active: true,
    createdAt: '2025-01-15',
    modifiedAt: '2026-02-20',
    parameters: [
      { name: 'Color', unit: '', maleRange: 'Pale Yellow - Amber', femaleRange: 'Pale Yellow - Amber', sortOrder: 1 },
      { name: 'Appearance', unit: '', maleRange: 'Clear', femaleRange: 'Clear', sortOrder: 2 },
      { name: 'Specific Gravity', unit: '', maleRange: '1.005 - 1.030', femaleRange: '1.005 - 1.030', sortOrder: 3 },
      { name: 'pH', unit: '', maleRange: '4.5 - 8.0', femaleRange: '4.5 - 8.0', sortOrder: 4 },
      { name: 'Protein', unit: '', maleRange: 'Nil', femaleRange: 'Nil', sortOrder: 5 },
      { name: 'Glucose', unit: '', maleRange: 'Nil', femaleRange: 'Nil', sortOrder: 6 },
      { name: 'Ketones', unit: '', maleRange: 'Nil', femaleRange: 'Nil', sortOrder: 7 },
      { name: 'Blood', unit: '', maleRange: 'Nil', femaleRange: 'Nil', sortOrder: 8 },
      { name: 'Bilirubin', unit: '', maleRange: 'Nil', femaleRange: 'Nil', sortOrder: 9 },
      { name: 'WBC', unit: '/hpf', maleRange: '0 - 5', femaleRange: '0 - 5', sortOrder: 10 },
      { name: 'RBC', unit: '/hpf', maleRange: '0 - 2', femaleRange: '0 - 2', sortOrder: 11 },
      { name: 'Epithelial Cells', unit: '/hpf', maleRange: 'Few', femaleRange: 'Few', sortOrder: 12 },
      { name: 'Casts', unit: '/lpf', maleRange: 'Nil', femaleRange: 'Nil', sortOrder: 13 },
      { name: 'Crystals', unit: '', maleRange: 'Nil', femaleRange: 'Nil', sortOrder: 14 },
    ],
  },
  {
    id: 'TPL-007',
    name: 'HbA1c (Glycated Hemoglobin)',
    category: 'Biochemistry',
    sampleType: 'Blood',
    parameterCount: 3,
    turnaroundTime: '2 hours',
    price: 'Rs. 1,100',
    active: true,
    createdAt: '2025-02-01',
    modifiedAt: '2026-03-10',
    parameters: [
      { name: 'HbA1c', unit: '%', maleRange: '< 5.7 (Normal)', femaleRange: '< 5.7 (Normal)', sortOrder: 1 },
      { name: 'Estimated Average Glucose', unit: 'mg/dL', maleRange: '< 117', femaleRange: '< 117', sortOrder: 2 },
      { name: 'Fasting Blood Glucose', unit: 'mg/dL', maleRange: '70 - 100', femaleRange: '70 - 100', sortOrder: 3 },
    ],
  },
  {
    id: 'TPL-008',
    name: 'Thyroid Profile (T3, T4, TSH)',
    category: 'Immunology',
    sampleType: 'Serum',
    parameterCount: 5,
    turnaroundTime: '4 hours',
    price: 'Rs. 1,500',
    active: true,
    createdAt: '2025-01-20',
    modifiedAt: '2026-03-22',
    parameters: [
      { name: 'T3 (Triiodothyronine)', unit: 'ng/dL', maleRange: '80 - 200', femaleRange: '80 - 200', sortOrder: 1 },
      { name: 'T4 (Thyroxine)', unit: 'ug/dL', maleRange: '4.5 - 12.0', femaleRange: '4.5 - 12.0', sortOrder: 2 },
      { name: 'TSH', unit: 'uIU/mL', maleRange: '0.4 - 4.0', femaleRange: '0.4 - 4.0', sortOrder: 3 },
      { name: 'Free T3', unit: 'pg/mL', maleRange: '2.0 - 4.4', femaleRange: '2.0 - 4.4', sortOrder: 4 },
      { name: 'Free T4', unit: 'ng/dL', maleRange: '0.8 - 1.8', femaleRange: '0.8 - 1.8', sortOrder: 5 },
    ],
  },
  {
    id: 'TPL-009',
    name: 'Serology Panel',
    category: 'Immunology',
    sampleType: 'Serum',
    parameterCount: 6,
    turnaroundTime: '4 hours',
    price: 'Rs. 2,000',
    active: true,
    createdAt: '2025-03-01',
    modifiedAt: '2026-03-05',
    parameters: [
      { name: 'HBsAg', unit: '', maleRange: 'Non-Reactive', femaleRange: 'Non-Reactive', sortOrder: 1 },
      { name: 'Anti-HCV', unit: '', maleRange: 'Non-Reactive', femaleRange: 'Non-Reactive', sortOrder: 2 },
      { name: 'HIV I/II', unit: '', maleRange: 'Non-Reactive', femaleRange: 'Non-Reactive', sortOrder: 3 },
      { name: 'VDRL', unit: '', maleRange: 'Non-Reactive', femaleRange: 'Non-Reactive', sortOrder: 4 },
      { name: 'Typhidot IgM', unit: '', maleRange: 'Negative', femaleRange: 'Negative', sortOrder: 5 },
      { name: 'Typhidot IgG', unit: '', maleRange: 'Negative', femaleRange: 'Negative', sortOrder: 6 },
    ],
  },
  {
    id: 'TPL-010',
    name: 'Coagulation Profile',
    category: 'Hematology',
    sampleType: 'Blood',
    parameterCount: 5,
    turnaroundTime: '3 hours',
    price: 'Rs. 1,300',
    active: true,
    createdAt: '2025-02-15',
    modifiedAt: '2026-02-28',
    parameters: [
      { name: 'PT (Prothrombin Time)', unit: 'seconds', maleRange: '11 - 13.5', femaleRange: '11 - 13.5', sortOrder: 1 },
      { name: 'INR', unit: '', maleRange: '0.8 - 1.2', femaleRange: '0.8 - 1.2', sortOrder: 2 },
      { name: 'APTT', unit: 'seconds', maleRange: '25 - 35', femaleRange: '25 - 35', sortOrder: 3 },
      { name: 'Bleeding Time', unit: 'minutes', maleRange: '2 - 7', femaleRange: '2 - 7', sortOrder: 4 },
      { name: 'Clotting Time', unit: 'minutes', maleRange: '4 - 9', femaleRange: '4 - 9', sortOrder: 5 },
    ],
  },
  {
    id: 'TPL-011',
    name: 'Blood Sugar (Fasting/Random/PP)',
    category: 'Biochemistry',
    sampleType: 'Blood',
    parameterCount: 4,
    turnaroundTime: '1 hour',
    price: 'Rs. 400',
    active: true,
    createdAt: '2025-01-15',
    modifiedAt: '2026-03-25',
    parameters: [
      { name: 'Fasting Blood Sugar', unit: 'mg/dL', maleRange: '70 - 100', femaleRange: '70 - 100', sortOrder: 1 },
      { name: 'Random Blood Sugar', unit: 'mg/dL', maleRange: '70 - 140', femaleRange: '70 - 140', sortOrder: 2 },
      { name: 'Post Prandial (2hr)', unit: 'mg/dL', maleRange: '< 140', femaleRange: '< 140', sortOrder: 3 },
      { name: 'Glucose Tolerance', unit: 'mg/dL', maleRange: '< 140 (2hr)', femaleRange: '< 140 (2hr)', sortOrder: 4 },
    ],
  },
  {
    id: 'TPL-012',
    name: 'Electrolytes Panel',
    category: 'Biochemistry',
    sampleType: 'Serum',
    parameterCount: 5,
    turnaroundTime: '2 hours',
    price: 'Rs. 700',
    active: false,
    createdAt: '2025-03-10',
    modifiedAt: '2026-01-15',
    parameters: [
      { name: 'Sodium (Na+)', unit: 'mEq/L', maleRange: '136 - 146', femaleRange: '136 - 146', sortOrder: 1 },
      { name: 'Potassium (K+)', unit: 'mEq/L', maleRange: '3.5 - 5.1', femaleRange: '3.5 - 5.1', sortOrder: 2 },
      { name: 'Chloride (Cl-)', unit: 'mEq/L', maleRange: '98 - 106', femaleRange: '98 - 106', sortOrder: 3 },
      { name: 'Calcium (Ca++)', unit: 'mg/dL', maleRange: '8.5 - 10.5', femaleRange: '8.5 - 10.5', sortOrder: 4 },
      { name: 'Phosphorus', unit: 'mg/dL', maleRange: '2.5 - 4.5', femaleRange: '2.5 - 4.5', sortOrder: 5 },
    ],
  },
];

const categoryColors: Record<string, string> = {
  Hematology: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Biochemistry: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Immunology: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Urinalysis: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const sampleIcons: Record<string, string> = {
  Blood: '\uD83E\uDE78',
  Urine: '\uD83E\uDDEA',
  Serum: '\uD83E\uDDF4',
};

const sampleColors: Record<string, string> = {
  Blood: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  Urine: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  Serum: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
};

// ─── Component ─────────────────────────────────────────────────────────────

export function TestTemplates() {
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState(demoTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<LabTemplate | null>(null);
  const [showParameterModal, setShowParameterModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '', category: 'Hematology', sampleType: 'Blood' as 'Blood' | 'Urine' | 'Serum',
    turnaroundTime: '', price: '',
  });

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sampleType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
  };

  const handleViewParams = (template: LabTemplate) => {
    setSelectedTemplate(template);
    setShowParameterModal(true);
  };

  return (
    <div className={`space-y-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Inline keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Test Templates
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {templates.length} templates configured &middot; {templates.filter((t) => t.active).length} active
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-72">
            <Input
              placeholder="Search templates..."
              icon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="primary" size="md" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" />
            Add Template
          </Button>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredTemplates.map((template, i) => (
          <div
            key={template.id}
            className={cn(
              'glass-card p-5 transition-all duration-500 group relative overflow-hidden',
              !template.active && 'opacity-60 grayscale-[30%]'
            )}
            style={{
              animationDelay: `${i * 60}ms`,
              animation: 'fadeInUp 0.4s ease forwards',
              opacity: 0,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
                  {template.name}
                </h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold', categoryColors[template.category] || categoryColors.Biochemistry)}>
                    {template.category}
                  </span>
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold', sampleColors[template.sampleType])}>
                    {sampleIcons[template.sampleType]} {template.sampleType}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleToggle(template.id)}
                className="flex-shrink-0 p-0.5 rounded transition-colors hover:bg-[var(--surface)]"
                title={template.active ? 'Deactivate' : 'Activate'}
              >
                {template.active ? (
                  <ToggleRight className="w-7 h-7 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-[var(--text-tertiary)]" />
                )}
              </button>
            </div>

            {/* Details */}
            <div className="space-y-2.5 mb-4">
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Hash className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                <span>{template.parameterCount} parameters</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                <span>TAT: {template.turnaroundTime}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <DollarSign className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                <span className="font-semibold text-[var(--text-primary)]">{template.price}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[var(--surface-border)]">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => handleViewParams(template)}
              >
                <Eye className="w-3.5 h-3.5" />
                View Parameters
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-16">
          <FlaskConical className="w-12 h-12 mx-auto text-[var(--text-tertiary)] mb-4" />
          <p className="text-sm text-[var(--text-secondary)]">No templates match your search.</p>
        </div>
      )}

      {/* View Parameters Modal */}
      <Modal
        open={showParameterModal}
        onClose={() => setShowParameterModal(false)}
        title={selectedTemplate?.name || 'Template Parameters'}
        description={selectedTemplate ? `${selectedTemplate.category} \u2022 ${selectedTemplate.sampleType} \u2022 ${selectedTemplate.parameterCount} parameters \u2022 TAT: ${selectedTemplate.turnaroundTime} \u2022 ${selectedTemplate.price}` : ''}
        size="xl"
        footer={
          <div className="flex items-center justify-between w-full text-xs text-[var(--text-tertiary)]">
            <span>Created: {selectedTemplate?.createdAt}</span>
            <span>Last modified: {selectedTemplate?.modifiedAt}</span>
          </div>
        }
      >
        {selectedTemplate && (
          <div className="glass-card-static p-0 overflow-hidden rounded-[var(--radius-sm)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--surface)]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-[8%]">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-[30%]">
                    Parameter Name
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-[12%]">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-[25%]">
                    Male Range
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-[25%]">
                    Female Range
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedTemplate.parameters.map((param) => (
                  <tr
                    key={param.sortOrder}
                    className="border-b border-[var(--surface-border)] hover:bg-[var(--surface-hover)] transition-colors duration-200"
                  >
                    <td className="px-4 py-3 text-[var(--text-tertiary)] font-mono text-xs">
                      {param.sortOrder}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                      {param.name}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] text-xs">
                      {param.unit || '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] text-xs font-mono">
                      {param.maleRange}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] text-xs font-mono">
                      {param.femaleRange}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Add Template Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Template"
        description="Configure a new lab test template"
        size="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => {
              if (!newTemplate.name.trim()) {
                toast.error('Template name is required.'); return;
              }
              const id = `TPL-${String(templates.length + 1).padStart(3, '0')}`;
              setTemplates(prev => [...prev, {
                id,
                name: newTemplate.name,
                category: newTemplate.category,
                sampleType: newTemplate.sampleType,
                parameterCount: 0,
                turnaroundTime: newTemplate.turnaroundTime || 'TBD',
                price: newTemplate.price ? `Rs. ${newTemplate.price}` : 'TBD',
                active: true,
                parameters: [],
                createdAt: new Date().toISOString().split('T')[0],
                modifiedAt: new Date().toISOString().split('T')[0],
              }]);
              setNewTemplate({ name: '', category: 'Hematology', sampleType: 'Blood', turnaroundTime: '', price: '' });
              setShowAddModal(false);
              toast.success('Test template created successfully.', 'Template Added');
            }}>
              <Plus className="w-3.5 h-3.5" />
              Create Template
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input label="Template Name *" placeholder="e.g., Complete Blood Count (CBC)" value={newTemplate.name} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Category</label>
              <select
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] transition-all duration-300"
              >
                <option value="Hematology">Hematology</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Immunology">Immunology</option>
                <option value="Urinalysis">Urinalysis</option>
                <option value="Microbiology">Microbiology</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Sample Type</label>
              <select
                value={newTemplate.sampleType}
                onChange={(e) => setNewTemplate({ ...newTemplate, sampleType: e.target.value as 'Blood' | 'Urine' | 'Serum' })}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] transition-all duration-300"
              >
                <option value="Blood">Blood</option>
                <option value="Serum">Serum</option>
                <option value="Urine">Urine</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Turnaround Time" placeholder="e.g., 2 hours" value={newTemplate.turnaroundTime} onChange={(e) => setNewTemplate({ ...newTemplate, turnaroundTime: e.target.value })} />
            <Input label="Price (Rs.)" placeholder="e.g., 800" value={newTemplate.price} onChange={(e) => setNewTemplate({ ...newTemplate, price: e.target.value })} />
          </div>
          <div className="pt-4 border-t border-[var(--surface-border)]">
            <div className="flex items-center gap-2 mb-3">
              <Beaker className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">Parameters</span>
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">
              Parameters can be configured after template creation. You will be able to add parameter names, units, and reference ranges.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
