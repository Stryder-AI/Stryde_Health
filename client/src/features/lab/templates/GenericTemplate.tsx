import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AbnormalFlag, classifyValue } from '../AbnormalFlag';

export interface TemplateParameter {
  id: string;
  name: string;
  unit: string;
  referenceRange: string;
  min?: number;
  max?: number;
  section?: string;
}

export interface TemplateConfig {
  id: string;
  name: string;
  sampleType: string;
  parameters: TemplateParameter[];
}

interface GenericTemplateProps {
  template: TemplateConfig;
  values: Record<string, string>;
  onChange: (paramId: string, value: string) => void;
  readOnly?: boolean;
}

function isOutOfRange(value: string, param: TemplateParameter): boolean {
  if (!value || param.min === undefined || param.max === undefined) return false;
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  return num < param.min || num > param.max;
}

export function GenericTemplate({ template, values, onChange, readOnly = false }: GenericTemplateProps) {
  const [animatedRows, setAnimatedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    const indices = new Set<number>();
    template.parameters.forEach((_, i) => {
      setTimeout(() => {
        indices.add(i);
        setAnimatedRows(new Set(indices));
      }, i * 30);
    });
  }, [template.id]);

  // Group parameters by section
  const sections: { name: string; params: TemplateParameter[] }[] = [];
  let currentSection = '';
  template.parameters.forEach((param) => {
    const sectionName = param.section || 'Parameters';
    if (sectionName !== currentSection) {
      currentSection = sectionName;
      sections.push({ name: sectionName, params: [] });
    }
    sections[sections.length - 1].params.push(param);
  });

  let globalIndex = 0;

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.name}>
          {sections.length > 1 && (
            <div className="flex items-center gap-3 mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                {section.name}
              </h4>
              <div className="flex-1 h-px bg-[var(--surface-border)]" />
            </div>
          )}
          <div className="glass-card-static p-0 overflow-hidden rounded-[var(--radius-sm)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--surface)]">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-[30%]">
                    Parameter
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-[25%]">
                    Result
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-[15%]">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-[30%]">
                    Reference Range
                  </th>
                </tr>
              </thead>
              <tbody>
                {section.params.map((param) => {
                  const idx = globalIndex++;
                  const val = values[param.id] || '';
                  const outOfRange = isOutOfRange(val, param);
                  return (
                    <tr
                      key={param.id}
                      className={cn(
                        'border-b border-[var(--surface-border)] transition-all duration-300',
                        outOfRange && 'bg-red-50/50 dark:bg-red-950/20',
                        animatedRows.has(idx) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                      )}
                      style={{ transition: 'opacity 0.3s ease, transform 0.3s ease, background-color 0.2s ease' }}
                    >
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                        {param.name}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => onChange(param.id, e.target.value)}
                              readOnly={readOnly}
                              placeholder="--"
                              className={cn(
                                'w-full px-3 py-2 text-sm rounded-[var(--radius-sm)] border transition-all duration-200',
                                'bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
                                'focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)]',
                                'hover:border-[var(--surface-border-hover)]',
                                readOnly && 'cursor-default bg-transparent border-transparent',
                                outOfRange
                                  ? 'border-red-400 bg-red-50/30 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-semibold focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]'
                                  : val && !outOfRange && param.min !== undefined && param.max !== undefined
                                    ? 'border-emerald-300 dark:border-emerald-700'
                                    : 'border-[var(--surface-border)]'
                              )}
                            />
                            {outOfRange && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 animate-fade-in">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              </div>
                            )}
                          </div>
                          {/* Real-time abnormal flag indicator */}
                          {val && param.min !== undefined && param.max !== undefined && (
                            <div className="flex-shrink-0 w-16">
                              <AbnormalFlag
                                value={val}
                                min={param.min}
                                max={param.max}
                                compact
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] text-xs">
                        {param.unit}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] text-xs font-mono">
                        {param.referenceRange}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Test Template Definitions ─────────────────────────────────────────────

export const CBC_TEMPLATE: TemplateConfig = {
  id: 'cbc',
  name: 'Complete Blood Count (CBC)',
  sampleType: 'Blood (EDTA)',
  parameters: [
    { id: 'hb', name: 'Hemoglobin (Hb)', unit: 'g/dL', referenceRange: '13.0 - 17.0', min: 13, max: 17, section: 'Hematology' },
    { id: 'rbc', name: 'RBC Count', unit: 'million/uL', referenceRange: '4.5 - 5.5', min: 4.5, max: 5.5, section: 'Hematology' },
    { id: 'wbc', name: 'WBC Count', unit: '/uL', referenceRange: '4000 - 11000', min: 4000, max: 11000, section: 'Hematology' },
    { id: 'platelet', name: 'Platelet Count', unit: '/uL', referenceRange: '150000 - 400000', min: 150000, max: 400000, section: 'Hematology' },
    { id: 'hct', name: 'HCT (Hematocrit)', unit: '%', referenceRange: '40 - 54', min: 40, max: 54, section: 'Hematology' },
    { id: 'mcv', name: 'MCV', unit: 'fL', referenceRange: '80 - 100', min: 80, max: 100, section: 'Hematology' },
    { id: 'mch', name: 'MCH', unit: 'pg', referenceRange: '27 - 33', min: 27, max: 33, section: 'Hematology' },
    { id: 'mchc', name: 'MCHC', unit: 'g/dL', referenceRange: '32 - 36', min: 32, max: 36, section: 'Hematology' },
    { id: 'esr', name: 'ESR', unit: 'mm/hr', referenceRange: '0 - 20', min: 0, max: 20, section: 'Hematology' },
    { id: 'neutrophils', name: 'Neutrophils', unit: '%', referenceRange: '40 - 70', min: 40, max: 70, section: 'Differential Count' },
    { id: 'lymphocytes', name: 'Lymphocytes', unit: '%', referenceRange: '20 - 40', min: 20, max: 40, section: 'Differential Count' },
    { id: 'monocytes', name: 'Monocytes', unit: '%', referenceRange: '2 - 8', min: 2, max: 8, section: 'Differential Count' },
    { id: 'eosinophils', name: 'Eosinophils', unit: '%', referenceRange: '1 - 4', min: 1, max: 4, section: 'Differential Count' },
    { id: 'basophils', name: 'Basophils', unit: '%', referenceRange: '0 - 1', min: 0, max: 1, section: 'Differential Count' },
  ],
};

export const LIPID_PROFILE_TEMPLATE: TemplateConfig = {
  id: 'lipid',
  name: 'Lipid Profile',
  sampleType: 'Blood (Serum)',
  parameters: [
    { id: 'total_cholesterol', name: 'Total Cholesterol', unit: 'mg/dL', referenceRange: '< 200', min: 0, max: 200, section: 'Lipid Panel' },
    { id: 'triglycerides', name: 'Triglycerides', unit: 'mg/dL', referenceRange: '< 150', min: 0, max: 150, section: 'Lipid Panel' },
    { id: 'hdl', name: 'HDL Cholesterol', unit: 'mg/dL', referenceRange: '40 - 60', min: 40, max: 60, section: 'Lipid Panel' },
    { id: 'ldl', name: 'LDL Cholesterol', unit: 'mg/dL', referenceRange: '< 100', min: 0, max: 100, section: 'Lipid Panel' },
    { id: 'vldl', name: 'VLDL Cholesterol', unit: 'mg/dL', referenceRange: '5 - 40', min: 5, max: 40, section: 'Lipid Panel' },
    { id: 'ratio', name: 'Total/HDL Ratio', unit: '', referenceRange: '< 5.0', min: 0, max: 5, section: 'Lipid Panel' },
  ],
};

export const LFT_TEMPLATE: TemplateConfig = {
  id: 'lft',
  name: 'Liver Function Test (LFT)',
  sampleType: 'Blood (Serum)',
  parameters: [
    { id: 'bilirubin_total', name: 'Total Bilirubin', unit: 'mg/dL', referenceRange: '0.1 - 1.2', min: 0.1, max: 1.2, section: 'Bilirubin' },
    { id: 'bilirubin_direct', name: 'Direct Bilirubin', unit: 'mg/dL', referenceRange: '0.0 - 0.3', min: 0, max: 0.3, section: 'Bilirubin' },
    { id: 'bilirubin_indirect', name: 'Indirect Bilirubin', unit: 'mg/dL', referenceRange: '0.1 - 0.9', min: 0.1, max: 0.9, section: 'Bilirubin' },
    { id: 'sgpt', name: 'SGPT (ALT)', unit: 'U/L', referenceRange: '7 - 56', min: 7, max: 56, section: 'Enzymes' },
    { id: 'sgot', name: 'SGOT (AST)', unit: 'U/L', referenceRange: '10 - 40', min: 10, max: 40, section: 'Enzymes' },
    { id: 'alp', name: 'Alkaline Phosphatase', unit: 'U/L', referenceRange: '44 - 147', min: 44, max: 147, section: 'Enzymes' },
    { id: 'ggt', name: 'GGT', unit: 'U/L', referenceRange: '9 - 48', min: 9, max: 48, section: 'Enzymes' },
    { id: 'total_protein', name: 'Total Protein', unit: 'g/dL', referenceRange: '6.0 - 8.3', min: 6, max: 8.3, section: 'Proteins' },
    { id: 'albumin', name: 'Albumin', unit: 'g/dL', referenceRange: '3.5 - 5.5', min: 3.5, max: 5.5, section: 'Proteins' },
    { id: 'globulin', name: 'Globulin', unit: 'g/dL', referenceRange: '2.0 - 3.5', min: 2, max: 3.5, section: 'Proteins' },
    { id: 'ag_ratio', name: 'A/G Ratio', unit: '', referenceRange: '1.0 - 2.2', min: 1, max: 2.2, section: 'Proteins' },
  ],
};

export const RFT_TEMPLATE: TemplateConfig = {
  id: 'rft',
  name: 'Renal Function Test (RFT)',
  sampleType: 'Blood (Serum)',
  parameters: [
    { id: 'urea', name: 'Blood Urea', unit: 'mg/dL', referenceRange: '15 - 40', min: 15, max: 40, section: 'Renal Markers' },
    { id: 'bun', name: 'BUN', unit: 'mg/dL', referenceRange: '7 - 20', min: 7, max: 20, section: 'Renal Markers' },
    { id: 'creatinine', name: 'Serum Creatinine', unit: 'mg/dL', referenceRange: '0.7 - 1.3', min: 0.7, max: 1.3, section: 'Renal Markers' },
    { id: 'uric_acid', name: 'Uric Acid', unit: 'mg/dL', referenceRange: '3.5 - 7.2', min: 3.5, max: 7.2, section: 'Renal Markers' },
    { id: 'sodium', name: 'Sodium (Na+)', unit: 'mEq/L', referenceRange: '136 - 146', min: 136, max: 146, section: 'Electrolytes' },
    { id: 'potassium', name: 'Potassium (K+)', unit: 'mEq/L', referenceRange: '3.5 - 5.1', min: 3.5, max: 5.1, section: 'Electrolytes' },
    { id: 'chloride', name: 'Chloride (Cl-)', unit: 'mEq/L', referenceRange: '98 - 106', min: 98, max: 106, section: 'Electrolytes' },
    { id: 'calcium', name: 'Calcium', unit: 'mg/dL', referenceRange: '8.5 - 10.5', min: 8.5, max: 10.5, section: 'Electrolytes' },
  ],
};

export const THYROID_TEMPLATE: TemplateConfig = {
  id: 'thyroid',
  name: 'Thyroid Function Test',
  sampleType: 'Blood (Serum)',
  parameters: [
    { id: 't3', name: 'T3 (Triiodothyronine)', unit: 'ng/dL', referenceRange: '80 - 200', min: 80, max: 200, section: 'Thyroid Panel' },
    { id: 't4', name: 'T4 (Thyroxine)', unit: 'ug/dL', referenceRange: '4.5 - 12.0', min: 4.5, max: 12, section: 'Thyroid Panel' },
    { id: 'tsh', name: 'TSH', unit: 'uIU/mL', referenceRange: '0.4 - 4.0', min: 0.4, max: 4, section: 'Thyroid Panel' },
  ],
};

export const URINALYSIS_TEMPLATE: TemplateConfig = {
  id: 'urinalysis',
  name: 'Urinalysis (Complete)',
  sampleType: 'Urine (Midstream)',
  parameters: [
    { id: 'color', name: 'Color', unit: '', referenceRange: 'Pale Yellow - Amber', section: 'Physical Examination' },
    { id: 'appearance', name: 'Appearance', unit: '', referenceRange: 'Clear', section: 'Physical Examination' },
    { id: 'specific_gravity', name: 'Specific Gravity', unit: '', referenceRange: '1.005 - 1.030', min: 1.005, max: 1.03, section: 'Physical Examination' },
    { id: 'ph', name: 'pH', unit: '', referenceRange: '4.5 - 8.0', min: 4.5, max: 8, section: 'Chemical Examination' },
    { id: 'protein', name: 'Protein', unit: '', referenceRange: 'Nil', section: 'Chemical Examination' },
    { id: 'glucose', name: 'Glucose', unit: '', referenceRange: 'Nil', section: 'Chemical Examination' },
    { id: 'ketones', name: 'Ketones', unit: '', referenceRange: 'Nil', section: 'Chemical Examination' },
    { id: 'blood', name: 'Blood', unit: '', referenceRange: 'Nil', section: 'Chemical Examination' },
    { id: 'wbc_micro', name: 'WBC', unit: '/hpf', referenceRange: '0 - 5', min: 0, max: 5, section: 'Microscopic Examination' },
    { id: 'rbc_micro', name: 'RBC', unit: '/hpf', referenceRange: '0 - 2', min: 0, max: 2, section: 'Microscopic Examination' },
    { id: 'epithelial', name: 'Epithelial Cells', unit: '/hpf', referenceRange: 'Few', section: 'Microscopic Examination' },
    { id: 'casts', name: 'Casts', unit: '/lpf', referenceRange: 'Nil', section: 'Microscopic Examination' },
    { id: 'crystals', name: 'Crystals', unit: '', referenceRange: 'Nil', section: 'Microscopic Examination' },
    { id: 'bacteria', name: 'Bacteria', unit: '', referenceRange: 'Nil', section: 'Microscopic Examination' },
  ],
};

export const ALL_TEMPLATES: TemplateConfig[] = [
  CBC_TEMPLATE,
  LIPID_PROFILE_TEMPLATE,
  LFT_TEMPLATE,
  RFT_TEMPLATE,
  THYROID_TEMPLATE,
  URINALYSIS_TEMPLATE,
];
