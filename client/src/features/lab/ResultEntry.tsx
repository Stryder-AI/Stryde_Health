import { useState, useEffect, useMemo } from 'react';
import {
  User,
  Stethoscope,
  Calendar,
  Hash,
  Save,
  Send,
  FileText,
  ChevronDown,
  Beaker,
  AlertCircle,
  CheckCircle2,
  Droplets,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import {
  GenericTemplate,
  ALL_TEMPLATES,
  type TemplateConfig,
} from './templates/GenericTemplate';
import { classifyValue, type AbnormalLevel } from './AbnormalFlag';

// ─── Demo Patient Data ─────────────────────────────────────────────────────

const demoPatient = {
  name: 'Mohammad Irfan',
  mrn: 'MR-10412',
  age: '45 yrs / Male',
  doctor: 'Dr. Sarah Ali',
  department: 'Internal Medicine',
  orderDate: '29 Mar 2026',
  orderId: 'ORD-3045',
  sampleCollected: '08:25 AM',
};

// Pre-filled values for CBC to demonstrate out-of-range highlighting
const cbcDemoValues: Record<string, string> = {
  hb: '11.2',
  rbc: '4.8',
  wbc: '13500',
  platelet: '245000',
  hct: '38',
  mcv: '82',
  mch: '29',
  mchc: '34',
  esr: '28',
  neutrophils: '72',
  lymphocytes: '18',
  monocytes: '5',
  eosinophils: '4',
  basophils: '1',
};

// ─── Component ─────────────────────────────────────────────────────────────

export function ResultEntry() {
  const [visible, setVisible] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(ALL_TEMPLATES[0].id);
  const [allValues, setAllValues] = useState<Record<string, Record<string, string>>>({
    cbc: { ...cbcDemoValues },
  });
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const selectedTemplate = useMemo(
    () => ALL_TEMPLATES.find((t) => t.id === selectedTemplateId) || ALL_TEMPLATES[0],
    [selectedTemplateId]
  );

  const currentValues = allValues[selectedTemplateId] || {};

  const handleValueChange = (paramId: string, value: string) => {
    setAllValues((prev) => ({
      ...prev,
      [selectedTemplateId]: {
        ...(prev[selectedTemplateId] || {}),
        [paramId]: value,
      },
    }));
  };

  const handleSaveDraft = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Draft saved successfully', 'Saved');
    }, 600);
  };

  const handleSubmit = () => {
    // Validate: check if at least some values are entered
    const filled = Object.values(currentValues).filter((v) => v.trim() !== '').length;
    if (filled === 0) {
      toast.warning('Please enter at least one result value before submitting.', 'Incomplete');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Report submitted and generated successfully!', 'Report Generated');
    }, 1200);
  };

  // Count out-of-range values with severity classification
  const { outOfRangeCount, abnormalDetails } = useMemo(() => {
    let count = 0;
    const details: { name: string; level: AbnormalLevel; direction: 'high' | 'low' | null }[] = [];
    selectedTemplate.parameters.forEach((p) => {
      const val = currentValues[p.id];
      if (val && p.min !== undefined && p.max !== undefined) {
        const result = classifyValue(val, p.min, p.max);
        if (result.level !== 'normal') {
          count++;
          details.push({ name: p.name, level: result.level, direction: result.direction });
        }
      }
    });
    return { outOfRangeCount: count, abnormalDetails: details };
  }, [selectedTemplate, currentValues]);

  const filledCount = Object.values(currentValues).filter((v) => v && v.trim() !== '').length;
  const totalParams = selectedTemplate.parameters.length;
  const completionPct = Math.round((filledCount / totalParams) * 100);

  const templateOptions = ALL_TEMPLATES.map((t) => ({ value: t.id, label: t.name }));

  return (
    <div className={`space-y-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Result Entry
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Enter laboratory test results for the selected order
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={handleSaveDraft} loading={saving}>
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} loading={submitting}>
            <Send className="w-4 h-4" />
            Submit & Generate Report
          </Button>
        </div>
      </div>

      {/* Patient Info Header */}
      <Card hover={false} className="p-0 overflow-hidden">
        {/* Gradient accent bar */}
        <div className="h-1 bg-gradient-to-r from-[var(--primary)] via-teal-400 to-[var(--accent)]" />
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { icon: User, label: 'Patient', value: demoPatient.name, sub: demoPatient.age },
              { icon: Hash, label: 'MR Number', value: demoPatient.mrn },
              { icon: Stethoscope, label: 'Referring Doctor', value: demoPatient.doctor, sub: demoPatient.department },
              { icon: Calendar, label: 'Order Date', value: demoPatient.orderDate },
              { icon: FileText, label: 'Order ID', value: demoPatient.orderId },
              { icon: Droplets, label: 'Sample Collected', value: demoPatient.sampleCollected },
              { icon: Beaker, label: 'Sample Type', value: selectedTemplate.sampleType },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <item.icon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{item.value}</p>
                {item.sub && (
                  <p className="text-xs text-[var(--text-tertiary)]">{item.sub}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Test Selection + Progress */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="w-80">
          <Select
            label="Test Template"
            options={templateOptions}
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
          />
        </div>

        {/* Progress bar */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[var(--text-secondary)] font-medium">
              Completion: {filledCount}/{totalParams} parameters
            </span>
            <span className="font-semibold text-[var(--text-primary)]">{completionPct}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[var(--surface)] overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out',
                completionPct === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-[var(--primary)] to-teal-400'
              )}
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-3">
          {outOfRangeCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                {outOfRangeCount} abnormal
              </span>
            </div>
          )}
          {completionPct === 100 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Complete
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Template Parameters Table */}
      <Card hover={false} className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--surface-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--primary-light)]">
              <Beaker className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                {selectedTemplate.name}
              </h3>
              <p className="text-xs text-[var(--text-tertiary)]">
                Sample: {selectedTemplate.sampleType} &middot; {totalParams} parameters
              </p>
            </div>
          </div>
          <Badge variant={outOfRangeCount > 0 ? 'warning' : 'success'} dot>
            {outOfRangeCount > 0 ? `${outOfRangeCount} flagged` : 'All normal'}
          </Badge>
        </div>
        <div className="p-6">
          <GenericTemplate
            template={selectedTemplate}
            values={currentValues}
            onChange={handleValueChange}
          />
        </div>
      </Card>

      {/* Abnormal Summary */}
      {abnormalDetails.length > 0 && (
        <Card hover={false} className="p-0 overflow-hidden border-l-4 border-l-red-400 dark:border-l-red-500">
          <div className="px-6 py-4 border-b border-[var(--surface-border)] bg-red-50/30 dark:bg-red-950/15">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[var(--radius-sm)] bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
                  {abnormalDetails.length} of {totalParams} parameters are abnormal
                </h3>
                <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">
                  {abnormalDetails.filter(d => d.level === 'critical').length > 0 && (
                    <span className="font-bold">
                      {abnormalDetails.filter(d => d.level === 'critical').length} critical
                    </span>
                  )}
                  {abnormalDetails.filter(d => d.level === 'critical').length > 0 && abnormalDetails.filter(d => d.level === 'slight').length > 0 && ' / '}
                  {abnormalDetails.filter(d => d.level === 'slight').length > 0 && (
                    <span>
                      {abnormalDetails.filter(d => d.level === 'slight').length} slightly abnormal
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 py-3">
            <div className="flex flex-wrap gap-2">
              {abnormalDetails.map((d) => (
                <span
                  key={d.name}
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
                    d.level === 'critical'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  )}
                >
                  {d.direction === 'high' ? '\u2191' : '\u2193'} {d.name}
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Technician Notes */}
      <Card hover={false} className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--surface-border)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Technician Notes</h3>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Add any observations or remarks about this sample</p>
        </div>
        <div className="p-6">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="e.g., Sample slightly hemolyzed. Repeat collection recommended for Potassium levels..."
            className={cn(
              'w-full px-4 py-3 text-sm rounded-[var(--radius-sm)] border border-[var(--surface-border)]',
              'bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
              'transition-all duration-300 ease-out resize-none',
              'hover:border-[var(--surface-border-hover)] hover:bg-[var(--surface-hover)]',
              'focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-hover)] focus:shadow-[0_0_0_3px_var(--primary-glow)]'
            )}
          />
        </div>
      </Card>

      {/* Bottom Action Bar */}
      <div className="glass-card-static p-4 flex items-center justify-between sticky bottom-4 z-10">
        <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
          <span>
            <span className="font-semibold text-[var(--text-primary)]">{filledCount}</span> of {totalParams} parameters entered
          </span>
          {outOfRangeCount > 0 && (
            <span className="text-red-600 dark:text-red-400 font-semibold">
              {outOfRangeCount} out of range
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleSaveDraft} loading={saving}>
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button variant="glow" onClick={handleSubmit} loading={submitting}>
            <Send className="w-4 h-4" />
            Submit & Generate Report
          </Button>
        </div>
      </div>
    </div>
  );
}
