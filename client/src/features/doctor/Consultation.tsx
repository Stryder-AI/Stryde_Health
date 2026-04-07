import { useState } from 'react';
import {
  User, Phone, Droplets, Heart, Thermometer, Wind, Weight,
  Activity, FileText, Stethoscope, ClipboardList, Save,
  CheckCircle2, ArrowRight, AlertTriangle, Clock, Pill, FlaskConical
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import PrescriptionForm, { type Medicine } from './PrescriptionForm';
import LabOrderForm, { type LabOrderState, defaultLabTests } from './LabOrderForm';

// ── Demo Patient Data ─────────────────────────────────────────

const patient = {
  name: 'Ahmad Khan',
  mr: 'MR-20240445',
  age: 52,
  gender: 'Male',
  bloodGroup: 'B+',
  phone: '+92 300 1234567',
  cnic: '35201-1234567-1',
  conditions: ['Cardiac', 'Diabetic', 'CKD Stage 2'],
  allergies: ['Penicillin', 'Sulfa drugs'],
  lastVisit: '12 Mar 2026',
  lastVisitSummary: 'Follow-up for hypertension management. BP was 148/92. Amlodipine increased to 10mg. Advised low-sodium diet and daily walking.',
  token: 'T-005',
  arrivalTime: '08:45 AM',
};

// ── Component ─────────────────────────────────────────────────

export default function Consultation() {
  // Vitals
  const [vitals, setVitals] = useState({
    bpSystolic: '',
    bpDiastolic: '',
    pulse: '',
    temperature: '',
    spo2: '',
    weight: '',
  });

  // Consultation notes
  const [notes, setNotes] = useState({
    chiefComplaint: '',
    hpi: '',
    examination: '',
    diagnosis: '',
    plan: '',
  });

  // Prescription
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: crypto.randomUUID(),
      name: 'Amlodipine 10mg',
      dosage: '10mg',
      frequency: 'OD',
      duration: '30 days',
      route: 'Oral',
      instructions: 'Take in the morning',
    },
    {
      id: crypto.randomUUID(),
      name: 'Metformin 500mg',
      dosage: '500mg',
      frequency: 'BD',
      duration: '30 days',
      route: 'Oral',
      instructions: 'Take after meals',
    },
  ]);

  // Lab orders
  const [labOrders, setLabOrders] = useState<LabOrderState>({
    tests: defaultLabTests.map((t) =>
      ['hba1c', 'rfts', 'lipid'].includes(t.testId)
        ? { ...t, selected: true }
        : t
    ),
    priority: 'normal',
    notes: '',
  });

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header Bar ──────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[var(--primary-glow)]">
            AK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                {patient.name}
              </h1>
              <Badge variant="in_progress" dot>In Progress</Badge>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {patient.mr} &middot; Token {patient.token} &middot; Arrived {patient.arrivalTime}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="danger" dot>
            <AlertTriangle className="w-3 h-3" />
            Allergies: {patient.allergies.join(', ')}
          </Badge>
        </div>
      </div>

      {/* ── Main Grid: Top Row ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT PANEL ──────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6 stagger-children">
          {/* Patient Summary */}
          <Card hover={false}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--primary)]" />
                <CardTitle>Patient Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Demographics */}
                <div className="grid grid-cols-3 gap-3">
                  <InfoChip label="Age" value={`${patient.age} yrs`} />
                  <InfoChip label="Gender" value={patient.gender} />
                  <InfoChip label="Blood" value={patient.bloodGroup} accent />
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Phone className="w-3.5 h-3.5" />
                  {patient.phone}
                </div>

                {/* Conditions */}
                <div>
                  <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                    Conditions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.conditions.map((c) => (
                      <Badge key={c} variant="warning" className="text-[10px]">{c}</Badge>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                    Allergies
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.allergies.map((a) => (
                      <Badge key={a} variant="danger" className="text-[10px]">{a}</Badge>
                    ))}
                  </div>
                </div>

                {/* Last Visit */}
                <div className="pt-3 border-t border-[var(--surface-border)]">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                    <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                      Last Visit &middot; {patient.lastVisit}
                    </p>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {patient.lastVisitSummary}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vitals Entry */}
          <Card hover={false}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" />
                <CardTitle>Vitals</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Blood Pressure */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    Blood Pressure
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Systolic"
                      value={vitals.bpSystolic}
                      onChange={(e) => setVitals({ ...vitals, bpSystolic: e.target.value })}
                      icon={<Heart className="w-4 h-4" />}
                    />
                    <span className="text-lg text-[var(--text-tertiary)] font-light">/</span>
                    <Input
                      placeholder="Diastolic"
                      value={vitals.bpDiastolic}
                      onChange={(e) => setVitals({ ...vitals, bpDiastolic: e.target.value })}
                    />
                    <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">mmHg</span>
                  </div>
                </div>

                {/* Pulse & Temp */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Pulse"
                    placeholder="72"
                    value={vitals.pulse}
                    onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                    icon={<Activity className="w-4 h-4" />}
                    rightIcon={<span className="text-[10px] text-[var(--text-tertiary)]">bpm</span>}
                  />
                  <Input
                    label="Temperature"
                    placeholder="98.6"
                    value={vitals.temperature}
                    onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                    icon={<Thermometer className="w-4 h-4" />}
                    rightIcon={<span className="text-[10px] text-[var(--text-tertiary)]">&deg;F</span>}
                  />
                </div>

                {/* SpO2 & Weight */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="SpO2"
                    placeholder="98"
                    value={vitals.spo2}
                    onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                    icon={<Wind className="w-4 h-4" />}
                    rightIcon={<span className="text-[10px] text-[var(--text-tertiary)]">%</span>}
                  />
                  <Input
                    label="Weight"
                    placeholder="78"
                    value={vitals.weight}
                    onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                    icon={<Weight className="w-4 h-4" />}
                    rightIcon={<span className="text-[10px] text-[var(--text-tertiary)]">kg</span>}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT PANEL: Consultation Notes ─────────────── */}
        <div className="lg:col-span-8">
          <Card hover={false} className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[var(--primary)]" />
                <CardTitle>Consultation Notes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Chief Complaint */}
                <Input
                  label="Chief Complaint"
                  placeholder="e.g., Chest pain for 3 days, shortness of breath on exertion..."
                  value={notes.chiefComplaint}
                  onChange={(e) => setNotes({ ...notes, chiefComplaint: e.target.value })}
                  icon={<FileText className="w-4 h-4" />}
                />

                {/* History of Present Illness */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">
                    History of Present Illness
                  </label>
                  <textarea
                    value={notes.hpi}
                    onChange={(e) => setNotes({ ...notes, hpi: e.target.value })}
                    placeholder="Detailed description of the patient's current illness, onset, duration, character, aggravating and relieving factors, associated symptoms..."
                    rows={5}
                    className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300 ease-out hover:border-[var(--surface-border-hover)] hover:bg-[var(--surface-hover)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-hover)] focus:shadow-[0_0_0_3px_var(--primary-glow)] resize-none"
                  />
                </div>

                {/* Examination Findings */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">
                    Examination Findings
                  </label>
                  <textarea
                    value={notes.examination}
                    onChange={(e) => setNotes({ ...notes, examination: e.target.value })}
                    placeholder="General appearance, cardiovascular examination, respiratory, abdominal, CNS findings..."
                    rows={4}
                    className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300 ease-out hover:border-[var(--surface-border-hover)] hover:bg-[var(--surface-hover)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-hover)] focus:shadow-[0_0_0_3px_var(--primary-glow)] resize-none"
                  />
                </div>

                {/* Diagnosis */}
                <Input
                  label="Diagnosis"
                  placeholder="e.g., Essential Hypertension (I10), Type 2 DM (E11.9)..."
                  value={notes.diagnosis}
                  onChange={(e) => setNotes({ ...notes, diagnosis: e.target.value })}
                  icon={<ClipboardList className="w-4 h-4" />}
                />

                {/* Plan */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">
                    Management Plan
                  </label>
                  <textarea
                    value={notes.plan}
                    onChange={(e) => setNotes({ ...notes, plan: e.target.value })}
                    placeholder="Treatment plan, lifestyle modifications, follow-up instructions, referrals..."
                    rows={3}
                    className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300 ease-out hover:border-[var(--surface-border-hover)] hover:bg-[var(--surface-hover)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-hover)] focus:shadow-[0_0_0_3px_var(--primary-glow)] resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Bottom Row: Prescription + Lab Orders ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prescription */}
        <div className="lg:col-span-7">
          <Card hover={false}>
            <CardContent>
              <PrescriptionForm medicines={medicines} onChange={setMedicines} />
            </CardContent>
          </Card>
        </div>

        {/* Lab Orders */}
        <div className="lg:col-span-5">
          <Card hover={false}>
            <CardContent>
              <LabOrderForm
                state={labOrders}
                onChange={setLabOrders}
                onSubmit={() => {
                  // In real app, would dispatch order
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Footer Action Bar ───────────────────────────────── */}
      <div className="glass-card-static p-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-10">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Consultation in progress &middot; {patient.name}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4" />
            Save &amp; Stay
          </Button>
          <Button variant="primary">
            <CheckCircle2 className="w-4 h-4" />
            Complete &amp; Next Patient
          </Button>
          <Button variant="ghost">
            <ArrowRight className="w-4 h-4" />
            Refer Patient
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Info Chip Sub-component ───────────────────────────────────

function InfoChip({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="glass-card-static p-2.5 text-center rounded-[var(--radius-sm)]">
      <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p
        className={`text-sm font-bold ${
          accent ? 'text-red-500' : 'text-[var(--text-primary)]'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
