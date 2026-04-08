import { useState, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { createPortal } from 'react-dom';
import {
  Clock, Play, Eye, AlertTriangle, Users, CheckCircle2,
  Loader2, ChevronRight, Search, User, Phone, Heart,
  Thermometer, Wind, Weight, Activity, FileText, Stethoscope,
  ClipboardList, Save, ArrowRight, Pill, FlaskConical,
  Printer, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import PrescriptionForm, { type Medicine } from './PrescriptionForm';
import PrescriptionTemplates from './PrescriptionTemplates';
import VitalsTemplates from './VitalsTemplates';
import LabOrderForm, { type LabOrderState, defaultLabTests } from './LabOrderForm';
import DrugInteractionAlert from './DrugInteractions';
import MedicationHistory, { type PastMedicine } from './MedicationHistory';
import PatientHoverCard from '@/components/ui/PatientHoverCard';

// ── Types ─────────────────────────────────────────────────────

interface Patient {
  id: string;
  token: string;
  name: string;
  mr: string;
  age: number;
  gender: 'M' | 'F';
  bloodGroup: string;
  phone: string;
  cnic: string;
  conditions: string[];
  allergies: string[];
  arrivalTime: string;
  waitMinutes: number;
  urgent: boolean;
  status: 'waiting' | 'in_progress' | 'completed';
  completedTime?: string;
  lastVisit?: string;
  lastVisitSummary?: string;
  pastMedicines?: PastMedicine[];
}

interface ConsultDraft {
  vitals: { bpSystolic: string; bpDiastolic: string; pulse: string; temperature: string; spo2: string; weight: string };
  notes: { chiefComplaint: string; hpi: string; examination: string; diagnosis: string; plan: string };
  medicines: Medicine[];
  labOrders: LabOrderState;
  followUp: { date: string; instructions: string };
}

// ── Demo Data ─────────────────────────────────────────────────

const initialPatients: Patient[] = [
  {
    id: '1', token: 'T-001', name: 'Rashid Mehmood', mr: 'MR-20240812',
    age: 58, gender: 'M', bloodGroup: 'A+', phone: '+92 321 4567890', cnic: '35201-5678901-1',
    conditions: ['Cardiac', 'Diabetic'], allergies: ['Aspirin'],
    arrivalTime: '09:15 AM', waitMinutes: 42, urgent: true, status: 'waiting',
    lastVisit: '15 Mar 2026', lastVisitSummary: 'Follow-up for chest pain. ECG normal sinus rhythm. Advised stress test.',
    pastMedicines: [
      { name: 'Metformin 500mg', dosage: '500mg', frequency: 'BD', duration: '30 days', prescribedDate: '2026-03-15', doctor: 'Dr. Tariq Ahmed' },
      { name: 'Atorvastatin 20mg', dosage: '20mg', frequency: 'HS', duration: '30 days', prescribedDate: '2026-03-15', doctor: 'Dr. Tariq Ahmed' },
      { name: 'Aspirin 75mg', dosage: '75mg', frequency: 'OD', duration: '90 days', prescribedDate: '2026-01-20', doctor: 'Dr. Tariq Ahmed' },
    ],
  },
  {
    id: '2', token: 'T-002', name: 'Nazia Begum', mr: 'MR-20241201',
    age: 45, gender: 'F', bloodGroup: 'B+', phone: '+92 300 1234567', cnic: '35201-1234567-2',
    conditions: ['Hypertension'], allergies: [],
    arrivalTime: '09:30 AM', waitMinutes: 27, urgent: false, status: 'waiting',
    lastVisit: '01 Mar 2026', lastVisitSummary: 'BP 155/95. Started on Amlodipine 5mg OD.',
    pastMedicines: [
      { name: 'Amlodipine 5mg', dosage: '5mg', frequency: 'OD', duration: '30 days', prescribedDate: '2026-03-01', doctor: 'Dr. Tariq Ahmed' },
    ],
  },
  {
    id: '3', token: 'T-003', name: 'Imran Saeed', mr: 'MR-20240654',
    age: 62, gender: 'M', bloodGroup: 'O-', phone: '+92 333 9876543', cnic: '35201-9876543-1',
    conditions: ['Cardiac', 'COPD'], allergies: ['Penicillin', 'Sulfa drugs'],
    arrivalTime: '09:45 AM', waitMinutes: 18, urgent: true, status: 'waiting',
    lastVisit: '20 Mar 2026', lastVisitSummary: 'COPD exacerbation. Prednisolone course completed. Spirometry scheduled.',
    pastMedicines: [
      { name: 'Isosorbide Mononitrate 30mg', dosage: '30mg', frequency: 'OD', duration: '30 days', prescribedDate: '2026-03-20', doctor: 'Dr. Tariq Ahmed' },
      { name: 'Tiotropium 18mcg', dosage: '18mcg', frequency: 'OD', duration: '30 days', prescribedDate: '2026-03-20', doctor: 'Dr. Tariq Ahmed' },
      { name: 'Prednisolone 20mg', dosage: '20mg', frequency: 'OD', duration: '5 days', prescribedDate: '2026-01-10', doctor: 'Dr. Tariq Ahmed' },
    ],
  },
  {
    id: '4', token: 'T-004', name: 'Sadia Parveen', mr: 'MR-20241345',
    age: 35, gender: 'F', bloodGroup: 'AB+', phone: '+92 312 5551234', cnic: '35201-5551234-2',
    conditions: ['Palpitations'], allergies: [],
    arrivalTime: '10:00 AM', waitMinutes: 12, urgent: false, status: 'waiting',
  },
  {
    id: '5', token: 'T-005', name: 'Ahmad Khan', mr: 'MR-20240445',
    age: 52, gender: 'M', bloodGroup: 'B+', phone: '+92 300 1234567', cnic: '35201-1234567-1',
    conditions: ['Cardiac', 'Diabetic', 'CKD'], allergies: ['Penicillin', 'Sulfa drugs'],
    arrivalTime: '08:45 AM', waitMinutes: 0, urgent: false, status: 'in_progress',
    lastVisit: '12 Mar 2026', lastVisitSummary: 'Follow-up for hypertension management. BP was 148/92. Amlodipine increased to 10mg.',
    pastMedicines: [
      { name: 'Amlodipine 10mg', dosage: '10mg', frequency: 'OD', duration: '30 days', prescribedDate: '2026-03-12', doctor: 'Dr. Tariq Ahmed' },
      { name: 'Losartan 50mg', dosage: '50mg', frequency: 'OD', duration: '30 days', prescribedDate: '2026-03-12', doctor: 'Dr. Tariq Ahmed' },
      { name: 'Metformin 1000mg', dosage: '1000mg', frequency: 'BD', duration: '30 days', prescribedDate: '2026-03-12', doctor: 'Dr. Tariq Ahmed' },
      { name: 'Atorvastatin 20mg', dosage: '20mg', frequency: 'HS', duration: '30 days', prescribedDate: '2026-03-12', doctor: 'Dr. Tariq Ahmed' },
    ],
  },
  {
    id: '6', token: 'T-006', name: 'Zainab Fatima', mr: 'MR-20240998',
    age: 48, gender: 'F', bloodGroup: 'A-', phone: '+92 345 6789012', cnic: '35201-6789012-2',
    conditions: ['Valvular Disease'], allergies: [],
    arrivalTime: '08:00 AM', waitMinutes: 0, urgent: false, status: 'completed',
    completedTime: '08:42 AM',
  },
  {
    id: '7', token: 'T-007', name: 'Tariq Hussain', mr: 'MR-20241078',
    age: 55, gender: 'M', bloodGroup: 'O+', phone: '+92 311 2223344', cnic: '35201-2223344-1',
    conditions: ['Cardiac'], allergies: [],
    arrivalTime: '08:15 AM', waitMinutes: 0, urgent: false, status: 'completed',
    completedTime: '09:10 AM',
  },
  {
    id: '8', token: 'T-008', name: 'Bushra Nawaz', mr: 'MR-20240876',
    age: 40, gender: 'F', bloodGroup: 'B-', phone: '+92 322 4445566', cnic: '35201-4445566-2',
    conditions: ['Hypertension', 'Diabetic'], allergies: ['Metformin'],
    arrivalTime: '08:30 AM', waitMinutes: 0, urgent: false, status: 'completed',
    completedTime: '09:38 AM',
  },
];

// ── Helpers ───────────────────────────────────────────────────

const conditionColors: Record<string, string> = {
  Cardiac: 'danger',
  Diabetic: 'warning',
  Hypertension: 'info',
  COPD: 'accent',
  CKD: 'cancelled',
  Palpitations: 'info',
  'Valvular Disease': 'accent',
};

// ── Component ─────────────────────────────────────────────────

export default function OPDQueue() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [search, setSearch] = useState('');
  const [consultPatient, setConsultPatient] = useState<Patient | null>(null);
  const [drafts, setDrafts] = useState<Record<string, ConsultDraft>>({});

  const handleSaveDraft = (patientId: string, draft: ConsultDraft) => {
    setDrafts((prev) => ({ ...prev, [patientId]: draft }));
  };

  const handleClearDraft = (patientId: string) => {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[patientId];
      return next;
    });
  };

  const waiting = patients.filter((p) => p.status === 'waiting');
  const inProgress = patients.filter((p) => p.status === 'in_progress');
  const completed = patients.filter((p) => p.status === 'completed');

  const searchFilter = (p: typeof patients[0]) =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.mr.toLowerCase().includes(search.toLowerCase()) ||
    p.token.toLowerCase().includes(search.toLowerCase());

  const filteredWaiting = waiting.filter(searchFilter);
  const filteredInProgress = inProgress.filter(searchFilter);
  const filteredCompleted = completed.filter(searchFilter);

  const handleStartConsult = (id: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === id) return { ...p, status: 'in_progress' as const };
        if (p.status === 'in_progress') return { ...p, status: 'waiting' as const };
        return p;
      })
    );
    const patient = patients.find((p) => p.id === id);
    if (patient) {
      setConsultPatient({ ...patient, status: 'in_progress' });
    }
  };

  const handleContinueConsult = (id: string) => {
    const patient = patients.find((p) => p.id === id);
    if (patient) setConsultPatient(patient);
  };

  const handleCompleteConsult = (id: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    setPatients((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'completed' as const, completedTime: timeStr, waitMinutes: 0 } : p
      )
    );
    handleClearDraft(id);
    setConsultPatient(null);
    toast.success('Consultation completed! Moving to next patient.');
  };

  const handleViewNotes = (id: string) => {
    const patient = patients.find((p) => p.id === id);
    if (patient) setConsultPatient(patient);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">OPD Queue</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage your patient flow &middot; {patients.length} patients today
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search patient, MR#, token..."
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card-static text-sm">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[var(--text-secondary)]">{t('status.waiting')}</span>
          <span className="font-bold text-[var(--text-primary)]">{waiting.length}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card-static text-sm">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[var(--text-secondary)]">{t('status.in_progress')}</span>
          <span className="font-bold text-[var(--text-primary)]">{inProgress.length}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card-static text-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[var(--text-secondary)]">{t('status.completed')}</span>
          <span className="font-bold text-[var(--text-primary)]">{completed.length}</span>
        </div>
      </div>

      {/* Three-column queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── WAITING ─────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">{t('status.waiting')}</h2>
            <Badge variant="warning">{waiting.length}</Badge>
          </div>
          <div className="space-y-3 stagger-children">
            {filteredWaiting
              .sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0) || b.waitMinutes - a.waitMinutes)
              .map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  action={
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleStartConsult(patient.id)}
                    >
                      <Play className="w-3.5 h-3.5" />
                      Start Consult
                    </Button>
                  }
                />
              ))}
            {filteredWaiting.length === 0 && (
              <div className="glass-card-static p-8 text-center">
                <Users className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-2" />
                <p className="text-sm text-[var(--text-tertiary)]">No patients waiting</p>
              </div>
            )}
          </div>
        </div>

        {/* ── IN PROGRESS ─────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">In Progress</h2>
            <Badge variant="in_progress">{filteredInProgress.length}</Badge>
          </div>
          <div className="space-y-3 stagger-children">
            {filteredInProgress.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                highlight
                action={
                  <Button size="sm" variant="glow" onClick={() => handleContinueConsult(patient.id)}>
                    <ChevronRight className="w-3.5 h-3.5" />
                    Continue Consult
                  </Button>
                }
              />
            ))}
            {filteredInProgress.length === 0 && (
              <div className="glass-card-static p-8 text-center border-2 border-dashed border-[var(--surface-border)]">
                <p className="text-sm text-[var(--text-tertiary)]">No active consultation</p>
              </div>
            )}
          </div>
        </div>

        {/* ── COMPLETED ───────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Completed</h2>
            <Badge variant="completed">{filteredCompleted.length}</Badge>
          </div>
          <div className="space-y-3 stagger-children">
            {filteredCompleted.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                action={
                  <Button size="sm" variant="ghost" onClick={() => handleViewNotes(patient.id)}>
                    <Eye className="w-3.5 h-3.5" />
                    View Notes
                  </Button>
                }
              />
            ))}
            {filteredCompleted.length === 0 && (
              <div className="glass-card-static p-8 text-center">
                <p className="text-sm text-[var(--text-tertiary)]">No completed consults yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CONSULTATION SHEET POPUP (Portal) ──────────── */}
      {consultPatient && createPortal(
        <ConsultationSheet
          key={consultPatient.id}
          patient={consultPatient}
          isReadOnly={consultPatient.status === 'completed'}
          initialDraft={drafts[consultPatient.id]}
          onClose={() => setConsultPatient(null)}
          onComplete={() => handleCompleteConsult(consultPatient.id)}
          onSaveDraft={(draft) => handleSaveDraft(consultPatient.id, draft)}
        />,
        document.body
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  CONSULTATION SHEET (Full-screen Popup)
// ══════════════════════════════════════════════════════════════

function ConsultationSheet({
  patient,
  isReadOnly,
  initialDraft,
  onClose,
  onComplete,
  onSaveDraft,
}: {
  patient: Patient;
  isReadOnly: boolean;
  initialDraft?: ConsultDraft;
  onClose: () => void;
  onComplete: () => void;
  onSaveDraft: (draft: ConsultDraft) => void;
}) {
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);

  // Vitals
  const [vitals, setVitals] = useState(
    initialDraft?.vitals ?? { bpSystolic: '', bpDiastolic: '', pulse: '', temperature: '', spo2: '', weight: '' }
  );

  // Consultation notes
  const [notes, setNotes] = useState(
    initialDraft?.notes ?? { chiefComplaint: '', hpi: '', examination: '', diagnosis: '', plan: '' }
  );

  // Prescription
  const [medicines, setMedicines] = useState<Medicine[]>(initialDraft?.medicines ?? []);

  // Lab orders
  const [labOrders, setLabOrders] = useState<LabOrderState>(
    initialDraft?.labOrders ?? {
      tests: defaultLabTests.map((t) => ({ ...t, selected: false })),
      priority: 'normal',
      notes: '',
    }
  );

  // Follow-up
  const [followUp, setFollowUp] = useState(initialDraft?.followUp ?? { date: '', instructions: '' });

  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleSave = () => {
    setSaving(true);
    onSaveDraft({ vitals, notes, medicines, labOrders, followUp });
    setTimeout(() => {
      setSaving(false);
      toast.success('Draft saved! You can safely close and resume later.');
    }, 400);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1a1a1a; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px; }
        .header h1 { font-size: 20px; color: #0d9488; }
        .header p { font-size: 11px; color: #666; }
        .patient-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 12px; background: #f8f9fa; border-radius: 6px; margin-bottom: 16px; }
        .patient-info div { font-size: 11px; }
        .patient-info .label { font-weight: 600; color: #555; }
        .patient-info .value { color: #1a1a1a; }
        .section { margin-bottom: 16px; }
        .section-title { font-size: 13px; font-weight: 700; color: #0d9488; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-bottom: 8px; }
        .vitals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .vital-item { padding: 6px 8px; background: #f0fdfa; border-radius: 4px; text-align: center; }
        .vital-item .label { font-size: 10px; color: #666; text-transform: uppercase; }
        .vital-item .value { font-size: 14px; font-weight: 700; color: #0d9488; }
        .notes-field { margin-bottom: 8px; }
        .notes-field .label { font-weight: 600; font-size: 11px; color: #555; margin-bottom: 2px; }
        .notes-field .content { padding: 6px 8px; background: #fafafa; border: 1px solid #e5e7eb; border-radius: 4px; min-height: 24px; white-space: pre-wrap; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        table th { background: #f0fdfa; padding: 6px 8px; text-align: left; font-size: 11px; font-weight: 600; color: #555; border-bottom: 2px solid #0d9488; }
        table td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
        .rx-number { font-weight: 700; color: #0d9488; }
        .allergies { color: #dc2626; font-weight: 600; }
        .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; }
        .footer .signature { text-align: center; }
        .footer .signature .line { width: 200px; border-top: 1px solid #333; margin-top: 40px; padding-top: 4px; font-size: 11px; }
        @media print { body { padding: 10px; } }
      </style>
    `;

    const selectedTests = labOrders.tests.filter((t) => t.selected);
    const vitalsHtml = [
      { label: 'BP', value: vitals.bpSystolic && vitals.bpDiastolic ? `${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg` : '—' },
      { label: 'Pulse', value: vitals.pulse ? `${vitals.pulse} bpm` : '—' },
      { label: 'Temp', value: vitals.temperature ? `${vitals.temperature}\u00B0F` : '—' },
      { label: 'SpO2', value: vitals.spo2 ? `${vitals.spo2}%` : '—' },
      { label: 'Weight', value: vitals.weight ? `${vitals.weight} kg` : '—' },
    ].map(v => `<div class="vital-item"><div class="label">${v.label}</div><div class="value">${v.value}</div></div>`).join('');

    const rxRows = medicines.map((m, i) =>
      `<tr><td class="rx-number">Rx ${i + 1}</td><td>${m.name}</td><td>${m.dosage}</td><td>${m.frequency}</td><td>${m.duration}</td><td>${m.route}</td><td>${m.instructions}</td></tr>`
    ).join('');

    const labRows = selectedTests.map(t =>
      `<tr><td>${t.testName}</td><td>${t.category}</td></tr>`
    ).join('');

    printWindow.document.write(`
      <html><head><title>Consultation - ${patient.name}</title>${styles}</head><body>
        <div class="header">
          <h1>Stryde Health</h1>
          <p>Consultation Record</p>
          <p style="margin-top:4px">Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>

        <div class="patient-info">
          <div><span class="label">Patient:</span> <span class="value">${patient.name}</span></div>
          <div><span class="label">MR#:</span> <span class="value">${patient.mr}</span></div>
          <div><span class="label">Age/Gender:</span> <span class="value">${patient.age} yrs / ${patient.gender === 'M' ? 'Male' : 'Female'}</span></div>
          <div><span class="label">Blood Group:</span> <span class="value">${patient.bloodGroup}</span></div>
          <div><span class="label">Token:</span> <span class="value">${patient.token}</span></div>
          <div><span class="label">Phone:</span> <span class="value">${patient.phone}</span></div>
          ${patient.allergies.length > 0 ? `<div style="grid-column: span 2"><span class="label">Allergies:</span> <span class="allergies">${patient.allergies.join(', ')}</span></div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">Vitals</div>
          <div class="vitals-grid">${vitalsHtml}</div>
        </div>

        <div class="section">
          <div class="section-title">Consultation Notes</div>
          <div class="notes-field"><div class="label">Chief Complaint</div><div class="content">${notes.chiefComplaint || '—'}</div></div>
          <div class="notes-field"><div class="label">History of Present Illness</div><div class="content">${notes.hpi || '—'}</div></div>
          <div class="notes-field"><div class="label">Examination Findings</div><div class="content">${notes.examination || '—'}</div></div>
          <div class="notes-field"><div class="label">Diagnosis</div><div class="content">${notes.diagnosis || '—'}</div></div>
          <div class="notes-field"><div class="label">Management Plan</div><div class="content">${notes.plan || '—'}</div></div>
        </div>

        ${medicines.length > 0 ? `
        <div class="section">
          <div class="section-title">Prescription</div>
          <table>
            <thead><tr><th>#</th><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Route</th><th>Instructions</th></tr></thead>
            <tbody>${rxRows}</tbody>
          </table>
        </div>` : ''}

        ${selectedTests.length > 0 ? `
        <div class="section">
          <div class="section-title">Lab Orders ${labOrders.priority === 'urgent' ? '(URGENT)' : ''}</div>
          <table>
            <thead><tr><th>Test</th><th>Category</th></tr></thead>
            <tbody>${labRows}</tbody>
          </table>
          ${labOrders.notes ? `<p style="margin-top:4px;font-size:11px;color:#666">Notes: ${labOrders.notes}</p>` : ''}
        </div>` : ''}

        ${followUp.date || followUp.instructions ? `
        <div class="section">
          <div class="section-title">Follow-up</div>
          ${followUp.date ? `<p style="font-size:11px"><strong>Date:</strong> ${followUp.date}</p>` : ''}
          ${followUp.instructions ? `<p style="font-size:11px"><strong>Instructions:</strong> ${followUp.instructions}</p>` : ''}
        </div>` : ''}

        <div class="footer">
          <div><p style="font-size:10px;color:#666">Printed on ${new Date().toLocaleString()}</p></div>
          <div class="signature"><div class="line">Doctor's Signature &amp; Stamp</div></div>
        </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  const initials = patient.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Collapsible section helper
  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col" style={{ isolation: 'isolate' }}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div ref={printRef} className="relative z-[10000] flex flex-col h-full bg-[var(--background)] overflow-hidden">
        {/* ── Sticky Header ───────────────────────────── */}
        <div className="shrink-0 border-b border-[var(--surface-border)] bg-[var(--background)]/95 backdrop-blur-md px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4 max-w-[1800px] mx-auto">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[var(--primary-glow)] shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-[var(--text-primary)] truncate">
                    {patient.name}
                  </h1>
                  <Badge variant={isReadOnly ? 'completed' : 'in_progress'} dot>
                    {isReadOnly ? 'Completed' : 'In Progress'}
                  </Badge>
                  {patient.urgent && (
                    <Badge variant="danger" dot>
                      <AlertTriangle className="w-3 h-3" />
                      Urgent
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[var(--text-secondary)] truncate">
                  {patient.mr} &middot; Token {patient.token} &middot; {patient.age}{patient.gender} &middot; {patient.bloodGroup}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {patient.allergies.length > 0 && (
                <Badge variant="danger" className="hidden sm:inline-flex">
                  <AlertTriangle className="w-3 h-3" />
                  Allergies: {patient.allergies.join(', ')}
                </Badge>
              )}
              <Button size="sm" variant="ghost" onClick={handlePrint} title="Print consultation">
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-tertiary)]" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Scrollable Content ──────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-[1800px] mx-auto space-y-6">

            {/* ── Patient Info Bar (Mobile Allergies) ──── */}
            {patient.allergies.length > 0 && (
              <div className="sm:hidden p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 text-sm text-red-500 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  Allergies: {patient.allergies.join(', ')}
                </div>
              </div>
            )}

            {/* ── TOP ROW: Patient Summary + Vitals + Notes ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Left Column: Patient Summary + Vitals */}
              <div className="lg:col-span-4 space-y-6">
                {/* Patient Summary Card */}
                <Card hover={false}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[var(--primary)]" />
                      <CardTitle>Patient Summary</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <InfoChip label="Age" value={`${patient.age} yrs`} />
                        <InfoChip label="Gender" value={patient.gender === 'M' ? 'Male' : 'Female'} />
                        <InfoChip label="Blood" value={patient.bloodGroup} accent />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <Phone className="w-3.5 h-3.5" />
                        {patient.phone}
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Conditions</p>
                        <div className="flex flex-wrap gap-1.5">
                          {patient.conditions.map((c) => (
                            <Badge key={c} variant={(conditionColors[c] as any) || 'warning'} className="text-[10px]">{c}</Badge>
                          ))}
                        </div>
                      </div>
                      {patient.allergies.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Allergies</p>
                          <div className="flex flex-wrap gap-1.5">
                            {patient.allergies.map((a) => (
                              <Badge key={a} variant="danger" className="text-[10px]">{a}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {patient.lastVisit && (
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
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Vitals Entry */}
                <Card hover={false}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-red-500" />
                      <CardTitle>{t('medical.vitals')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!isReadOnly && (
                      <VitalsTemplates
                        onApply={(v) => setVitals((prev) => {
                          // Merge: only overwrite fields that the template provides (non-empty)
                          const merged = { ...prev };
                          for (const [key, val] of Object.entries(v)) {
                            if (val !== '' && val !== undefined) {
                              (merged as Record<string, string>)[key] = val as string;
                            }
                          }
                          return merged;
                        })}
                      />
                    )}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('medical.blood_pressure')}</label>
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Sys"
                            value={vitals.bpSystolic}
                            onChange={(e) => setVitals({ ...vitals, bpSystolic: e.target.value })}
                            icon={<Heart className="w-4 h-4" />}
                          />
                          <span className="text-lg text-[var(--text-tertiary)]">/</span>
                          <Input
                            placeholder="Dia"
                            value={vitals.bpDiastolic}
                            onChange={(e) => setVitals({ ...vitals, bpDiastolic: e.target.value })}
                          />
                          <span className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">mmHg</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label={t('medical.pulse')} placeholder="72" value={vitals.pulse}
                          onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                          icon={<Activity className="w-4 h-4" />}
                          rightIcon={<span className="text-[10px] text-[var(--text-tertiary)]">bpm</span>}
                        />
                        <Input label={t('medical.temperature')} placeholder="98.6" value={vitals.temperature}
                          onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                          icon={<Thermometer className="w-4 h-4" />}
                          rightIcon={<span className="text-[10px] text-[var(--text-tertiary)]">&deg;F</span>}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="SpO2" placeholder="98" value={vitals.spo2}
                          onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                          icon={<Wind className="w-4 h-4" />}
                          rightIcon={<span className="text-[10px] text-[var(--text-tertiary)]">%</span>}
                        />
                        <Input label={t('medical.weight')} placeholder="78" value={vitals.weight}
                          onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                          icon={<Weight className="w-4 h-4" />}
                          rightIcon={<span className="text-[10px] text-[var(--text-tertiary)]">kg</span>}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Consultation Notes */}
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
                      <Input
                        label={t('medical.chief_complaint')}
                        placeholder="e.g., Chest pain for 3 days, shortness of breath on exertion..."
                        value={notes.chiefComplaint}
                        onChange={(e) => setNotes({ ...notes, chiefComplaint: e.target.value })}
                        icon={<FileText className="w-4 h-4" />}
                      />
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">History of Present Illness</label>
                        <textarea
                          value={notes.hpi}
                          onChange={(e) => setNotes({ ...notes, hpi: e.target.value })}
                          placeholder="Detailed description of the patient's current illness, onset, duration, character, aggravating and relieving factors..."
                          rows={4}
                          className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300 ease-out hover:border-[var(--surface-border-hover)] hover:bg-[var(--surface-hover)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-hover)] focus:shadow-[0_0_0_3px_var(--primary-glow)] resize-y"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">Examination Findings</label>
                        <textarea
                          value={notes.examination}
                          onChange={(e) => setNotes({ ...notes, examination: e.target.value })}
                          placeholder="General appearance, cardiovascular examination, respiratory, abdominal, CNS findings..."
                          rows={3}
                          className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300 ease-out hover:border-[var(--surface-border-hover)] hover:bg-[var(--surface-hover)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-hover)] focus:shadow-[0_0_0_3px_var(--primary-glow)] resize-y"
                        />
                      </div>
                      <Input
                        label="Diagnosis"
                        placeholder="e.g., Essential Hypertension (I10), Type 2 DM (E11.9)..."
                        value={notes.diagnosis}
                        onChange={(e) => setNotes({ ...notes, diagnosis: e.target.value })}
                        icon={<ClipboardList className="w-4 h-4" />}
                      />
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">Management Plan</label>
                        <textarea
                          value={notes.plan}
                          onChange={(e) => setNotes({ ...notes, plan: e.target.value })}
                          placeholder="Treatment plan, lifestyle modifications, follow-up instructions, referrals..."
                          rows={3}
                          className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300 ease-out hover:border-[var(--surface-border-hover)] hover:bg-[var(--surface-hover)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-hover)] focus:shadow-[0_0_0_3px_var(--primary-glow)] resize-y"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ── BOTTOM ROW: Prescription + Lab Orders + Follow-up ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Prescription */}
              <div className="lg:col-span-7 space-y-4">
                {/* Medication History Panel */}
                {!isReadOnly && patient.pastMedicines && patient.pastMedicines.length > 0 && (
                  <MedicationHistory
                    pastMedicines={patient.pastMedicines}
                    currentMedicines={medicines}
                  />
                )}

                <Card hover={false}>
                  <CardContent>
                    {!isReadOnly && (
                      <PrescriptionTemplates
                        onApply={(newMeds) => setMedicines((prev) => [...prev, ...newMeds])}
                      />
                    )}
                    <PrescriptionForm medicines={medicines} onChange={setMedicines} />
                  </CardContent>
                </Card>

                {/* Drug Interaction Alert */}
                {!isReadOnly && (
                  <DrugInteractionAlert medicines={medicines} />
                )}
              </div>

              {/* Lab Orders + Follow-up */}
              <div className="lg:col-span-5 space-y-6">
                <Card hover={false}>
                  <CardContent>
                    <LabOrderForm state={labOrders} onChange={setLabOrders} />
                  </CardContent>
                </Card>

                {/* Follow-up */}
                <Card hover={false}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-[var(--primary)]" />
                      <CardTitle>Follow-up</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Input
                        label="Follow-up Date"
                        type="date"
                        value={followUp.date}
                        onChange={(e) => setFollowUp({ ...followUp, date: e.target.value })}
                      />
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">Instructions</label>
                        <textarea
                          value={followUp.instructions}
                          onChange={(e) => setFollowUp({ ...followUp, instructions: e.target.value })}
                          placeholder="Follow-up instructions for the patient..."
                          rows={2}
                          className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all duration-300 ease-out hover:border-[var(--surface-border-hover)] hover:bg-[var(--surface-hover)] focus:outline-none focus:border-[var(--primary)] focus:bg-[var(--surface-hover)] focus:shadow-[0_0_0_3px_var(--primary-glow)] resize-none"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky Footer Action Bar ────────────────── */}
        {!isReadOnly && (
          <div className="shrink-0 border-t border-[var(--surface-border)] bg-[var(--background)]/95 backdrop-blur-md px-4 sm:px-6 py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-[1800px] mx-auto">
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Consultation in progress &middot; {patient.name} &middot; Token {patient.token}
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Button variant="ghost" onClick={onClose}>
                  <X className="w-4 h-4" />
                  Close
                </Button>
                <Button variant="secondary" onClick={handleSave} loading={saving}>
                  <Save className="w-4 h-4" />
                  Save Draft
                </Button>
                <Button variant="primary" onClick={handlePrint}>
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button
                  variant="glow"
                  loading={completing}
                  loadingText="Completing..."
                  onClick={() => {
                    setCompleting(true);
                    setTimeout(() => {
                      setCompleting(false);
                      onComplete();
                    }, 700);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Complete &amp; Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Read-only footer */}
        {isReadOnly && (
          <div className="shrink-0 border-t border-[var(--surface-border)] bg-[var(--background)]/95 backdrop-blur-md px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between max-w-[1800px] mx-auto">
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Consultation completed {patient.completedTime ? `at ${patient.completedTime}` : ''}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={handlePrint}>
                  <Printer className="w-4 h-4" />
                  Print
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════

function InfoChip({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="glass-card-static p-2.5 text-center rounded-[var(--radius-sm)]">
      <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${accent ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>{value}</p>
    </div>
  );
}

function PatientCard({
  patient,
  action,
  highlight = false,
}: {
  patient: Patient;
  action: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`glass-card p-4 space-y-3 transition-all duration-300 ${
        highlight
          ? 'ring-2 ring-[var(--primary)]/40 shadow-[0_0_24px_var(--primary-glow)]'
          : ''
      } ${patient.urgent ? 'border-l-4 border-l-red-500' : ''}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
              patient.status === 'in_progress'
                ? 'bg-gradient-to-br from-[var(--primary)] to-teal-400 text-white'
                : patient.urgent
                ? 'bg-gradient-to-br from-red-500 to-rose-400 text-white'
                : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--surface-border)]'
            }`}
          >
            {patient.token.replace('T-', '#')}
          </div>
          <div>
            <PatientHoverCard
              patient={{
                id: patient.id,
                mr: patient.mr,
                name: patient.name,
                age: patient.age,
                gender: patient.gender,
                bloodGroup: patient.bloodGroup,
                conditions: patient.conditions,
                allergies: patient.allergies,
                lastVisit: patient.lastVisit,
              }}
            >
              <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight cursor-pointer hover:text-[var(--primary)] transition-colors w-fit">
                {patient.name}
              </p>
            </PatientHoverCard>
            <p className="text-xs text-[var(--text-tertiary)]">
              {patient.mr} &middot; {patient.age}{patient.gender === 'M' ? 'M' : 'F'}
            </p>
          </div>
        </div>
        {patient.urgent && (
          <Badge variant="danger" dot className="shrink-0">
            <AlertTriangle className="w-3 h-3" />
            Urgent
          </Badge>
        )}
      </div>

      {/* Condition badges */}
      <div className="flex flex-wrap gap-1.5">
        {patient.conditions.map((c) => (
          <Badge key={c} variant={(conditionColors[c] as any) || 'default'} className="text-[10px]">{c}</Badge>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--surface-border)]">
        <div className="text-xs text-[var(--text-tertiary)]">
          {patient.status === 'completed' ? (
            <>Completed at {patient.completedTime}</>
          ) : patient.status === 'waiting' ? (
            <>
              <Clock className="w-3 h-3 inline mr-1" />
              Arrived {patient.arrivalTime} &middot;{' '}
              <span className={patient.waitMinutes > 30 ? 'text-red-500 font-semibold' : ''}>
                {patient.waitMinutes} min wait
              </span>
            </>
          ) : (
            <>In consultation since {patient.arrivalTime}</>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
