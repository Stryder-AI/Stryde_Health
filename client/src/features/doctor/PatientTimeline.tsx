import { useState } from 'react';
import {
  Clock, Stethoscope, FlaskConical, Pill, CalendarCheck,
  ChevronDown, ChevronUp, Filter, Search, User,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

// ── Types ─────────────────────────────────────────────────────

type EventType = 'visit' | 'lab' | 'prescription' | 'followup';

interface TimelineEvent {
  id: string;
  date: string;
  type: EventType;
  title: string;
  summary: string;
  details: string;
  doctor?: string;
}

interface PatientData {
  id: string;
  name: string;
  mr: string;
  age: number;
  gender: 'M' | 'F';
  bloodGroup: string;
  events: TimelineEvent[];
}

// ── Config ───────────────────────────────────────────────────

const eventConfig: Record<EventType, { icon: React.ElementType; color: string; bg: string; border: string; dotColor: string; label: string }> = {
  visit: {
    icon: Stethoscope,
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    dotColor: 'bg-teal-500',
    label: 'Visit',
  },
  lab: {
    icon: FlaskConical,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    dotColor: 'bg-purple-500',
    label: 'Lab Result',
  },
  prescription: {
    icon: Pill,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    dotColor: 'bg-blue-500',
    label: 'Prescription',
  },
  followup: {
    icon: CalendarCheck,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    dotColor: 'bg-amber-500',
    label: 'Follow-up',
  },
};

// ── Demo Data ────────────────────────────────────────────────

const patients: PatientData[] = [
  {
    id: '1', name: 'Rashid Mehmood', mr: 'MR-20240812', age: 58, gender: 'M', bloodGroup: 'A+',
    events: [
      { id: 'e1', date: '2026-03-28', type: 'visit', title: 'Cardiology Follow-up', summary: 'BP 148/92, chest pain assessment', details: 'Patient presents with recurrent chest pain on exertion. BP elevated at 148/92 mmHg. ECG shows normal sinus rhythm. Amlodipine increased to 10mg OD. Stress test scheduled.', doctor: 'Dr. Tariq Ahmed' },
      { id: 'e2', date: '2026-03-28', type: 'prescription', title: 'Medication Update', summary: 'Amlodipine increased, Atorvastatin added', details: 'Amlodipine 10mg OD (increased from 5mg)\nAtorvastatin 20mg HS (new)\nAspirin 75mg OD (continued)\nMetoprolol 50mg BD (continued)' },
      { id: 'e3', date: '2026-03-25', type: 'lab', title: 'Lipid Profile', summary: 'Total cholesterol elevated at 245 mg/dL', details: 'Total Cholesterol: 245 mg/dL (H)\nLDL: 162 mg/dL (H)\nHDL: 38 mg/dL (L)\nTriglycerides: 225 mg/dL (H)\nFasting Glucose: 118 mg/dL' },
      { id: 'e4', date: '2026-03-20', type: 'visit', title: 'COPD Review', summary: 'Spirometry completed, mild improvement', details: 'FEV1 improved from 62% to 68% predicted. Prednisolone course completed. Continue Tiotropium inhaler. Patient reports less dyspnea. Oxygen saturation 94% on room air.', doctor: 'Dr. Tariq Ahmed' },
      { id: 'e5', date: '2026-03-15', type: 'followup', title: 'Cardiac Follow-up Scheduled', summary: 'Follow-up for stress test results', details: 'Patient to return on Mar 28 for stress test review.\nInstructions: Continue medications, avoid strenuous activity, report any chest pain immediately.' },
      { id: 'e6', date: '2026-03-10', type: 'lab', title: 'CBC & Renal Function', summary: 'Mild anemia, creatinine borderline', details: 'Hemoglobin: 11.8 g/dL (L)\nWBC: 7,200/uL\nPlatelets: 220,000/uL\nCreatinine: 1.3 mg/dL (borderline)\nBUN: 22 mg/dL\neGFR: 58 mL/min (CKD Stage 3a)' },
      { id: 'e7', date: '2026-03-05', type: 'prescription', title: 'Iron Supplementation Started', summary: 'Ferrous sulfate prescribed for anemia', details: 'Ferrous Sulfate 200mg BD Oral\nVitamin C 500mg OD Oral (to enhance iron absorption)\nDuration: 3 months' },
      { id: 'e8', date: '2026-02-28', type: 'visit', title: 'Initial Cardiac Assessment', summary: 'New referral for chest pain evaluation', details: 'Patient referred from GP for evaluation of exertional chest pain x 2 weeks. ECG: Normal sinus rhythm. Troponin negative. Echocardiogram ordered. Started on Aspirin 75mg and Metoprolol 25mg.', doctor: 'Dr. Tariq Ahmed' },
      { id: 'e9', date: '2026-02-25', type: 'lab', title: 'Cardiac Enzymes', summary: 'Troponin I negative, CK-MB normal', details: 'Troponin I: < 0.01 ng/mL (Normal)\nCK-MB: 3.2 U/L (Normal)\nBNP: 125 pg/mL (borderline)\nD-Dimer: 0.3 mg/L (Normal)' },
      { id: 'e10', date: '2026-02-20', type: 'followup', title: 'GP Follow-up Note', summary: 'Referred to cardiology for evaluation', details: 'Patient has been experiencing intermittent chest discomfort for 2 weeks. Risk factors: HTN, hyperlipidemia, smoking history. Referred to Dr. Tariq Ahmed, Cardiology.' },
    ],
  },
  {
    id: '2', name: 'Nazia Begum', mr: 'MR-20241201', age: 45, gender: 'F', bloodGroup: 'B+',
    events: [
      { id: 'e11', date: '2026-03-27', type: 'visit', title: 'Hypertension Management', summary: 'BP improving at 138/88', details: 'BP today: 138/88 mmHg (improved from 155/95). Home BP diary reviewed - average 140/90. Amlodipine well tolerated. Continue current medications. Target BP < 130/80.', doctor: 'Dr. Tariq Ahmed' },
      { id: 'e12', date: '2026-03-22', type: 'lab', title: 'Metabolic Panel', summary: 'Electrolytes normal, HbA1c 5.8%', details: 'Na+: 140 mEq/L\nK+: 4.1 mEq/L\nCl-: 102 mEq/L\nHCO3-: 24 mEq/L\nHbA1c: 5.8% (pre-diabetic range)\nFasting Glucose: 108 mg/dL' },
      { id: 'e13', date: '2026-03-15', type: 'prescription', title: 'Antihypertensive Regimen', summary: 'Amlodipine 5mg OD + Aspirin 75mg', details: 'Amlodipine 5mg OD Oral - Morning\nAspirin 75mg OD Oral - After breakfast\nOmeprazole 20mg OD Oral - Empty stomach (for gastric protection)' },
      { id: 'e14', date: '2026-03-01', type: 'visit', title: 'New Patient Visit', summary: 'Newly diagnosed hypertension, BP 155/95', details: 'First cardiology visit. Patient referred for persistent hypertension. BP in office: 155/95 mmHg. No end-organ damage on examination. ECG: LVH voltage criteria. Started on Amlodipine 5mg.', doctor: 'Dr. Tariq Ahmed' },
      { id: 'e15', date: '2026-03-01', type: 'lab', title: 'Baseline Investigations', summary: 'CBC normal, renal function normal', details: 'CBC: Normal\nCreatinine: 0.8 mg/dL\nLipid Profile: Total Cholesterol 210 mg/dL, LDL 130 mg/dL\nTSH: 2.8 mIU/L\nUrinalysis: Normal' },
      { id: 'e16', date: '2026-03-15', type: 'followup', title: 'Two-Week BP Check', summary: 'Return for BP reassessment', details: 'Scheduled 2-week follow-up to assess response to Amlodipine.\nPatient to maintain home BP diary.\nReturn for blood work before visit.' },
      { id: 'e17', date: '2026-02-15', type: 'visit', title: 'GP Screening Visit', summary: 'Elevated BP detected during routine check', details: 'Routine health screening. BP found to be 150/92 mmHg on 3 readings. Advised lifestyle modifications. Referred to cardiology for further evaluation.', doctor: 'Dr. Farah Khan' },
      { id: 'e18', date: '2026-02-15', type: 'lab', title: 'Screening Blood Work', summary: 'All within normal limits', details: 'Fasting Glucose: 102 mg/dL\nCBC: Normal\nLFTs: Normal\nCreatinine: 0.7 mg/dL' },
    ],
  },
  {
    id: '3', name: 'Ahmad Khan', mr: 'MR-20240445', age: 52, gender: 'M', bloodGroup: 'B+',
    events: [
      { id: 'e19', date: '2026-03-29', type: 'visit', title: 'Multimorbidity Review', summary: 'Cardiac, DM, CKD - quarterly review', details: 'Comprehensive review. BP 142/88 (target <130/80). HbA1c down to 7.2% from 8.1%. eGFR stable at 45. Medication adjustments made. Renal-dose adjustments maintained. Nephrology referral for CKD management.', doctor: 'Dr. Tariq Ahmed' },
      { id: 'e20', date: '2026-03-25', type: 'lab', title: 'Comprehensive Panel', summary: 'HbA1c improved, eGFR stable', details: 'HbA1c: 7.2% (improved from 8.1%)\neGFR: 45 mL/min (stable, CKD Stage 3b)\nCreatinine: 1.6 mg/dL\nK+: 4.8 mEq/L\nAlbumin/Creatinine Ratio: 180 mg/g (elevated)' },
      { id: 'e21', date: '2026-03-20', type: 'prescription', title: 'Medication Optimization', summary: 'Metformin reduced, Empagliflozin added', details: 'Metformin 500mg BD (reduced from 1000mg BD - renal adjustment)\nEmpagliflozin 10mg OD (added for cardio-renal benefit)\nAmlodipine 10mg OD (continued)\nAspirin 75mg OD (continued)\nAtorvastatin 40mg HS (continued)' },
      { id: 'e22', date: '2026-03-15', type: 'followup', title: 'Nephrology Referral', summary: 'Referral to Dr. Samina for CKD management', details: 'Referred to Nephrology (Dr. Samina Malik) for CKD Stage 3b management.\nPatient to bring all lab reports.\nAppointment confirmed for March 30.' },
      { id: 'e23', date: '2026-03-12', type: 'visit', title: 'HTN Follow-up', summary: 'BP 148/92, Amlodipine increased', details: 'BP remains elevated at 148/92. Home BP diary shows average 145/90. Amlodipine increased from 5mg to 10mg. Advised low-sodium diet. Weight: 89kg (BMI 30.1).', doctor: 'Dr. Tariq Ahmed' },
      { id: 'e24', date: '2026-03-08', type: 'lab', title: 'Renal Function Test', summary: 'Creatinine rising, eGFR 45', details: 'Creatinine: 1.6 mg/dL (up from 1.4)\neGFR: 45 mL/min (down from 52)\nBUN: 28 mg/dL\nUric Acid: 7.8 mg/dL (H)\nProtein/Creatinine Ratio: 0.4' },
      { id: 'e25', date: '2026-03-01', type: 'prescription', title: 'Diabetic Medication Review', summary: 'Glimepiride stopped, insulin considered', details: 'Metformin 1000mg BD (continued)\nGlimepiride 2mg - STOPPED (hypoglycemia risk with CKD)\nSitagliptin 50mg OD (added, renal dose)\nInsulin discussed - patient prefers oral for now' },
      { id: 'e26', date: '2026-02-28', type: 'visit', title: 'DM & Cardiac Follow-up', summary: 'HbA1c 8.1%, needs optimization', details: 'Diabetes poorly controlled - HbA1c 8.1%. Fasting glucose 165 mg/dL. CKD limiting medication options. Cardiac status stable. Echo: EF 55%. No new symptoms.', doctor: 'Dr. Tariq Ahmed' },
      { id: 'e27', date: '2026-02-20', type: 'lab', title: 'Echocardiogram Report', summary: 'EF 55%, mild LVH, no valvular disease', details: 'Left Ventricular EF: 55% (normal)\nMild concentric LVH\nNo regional wall motion abnormality\nValves: No significant pathology\nNo pericardial effusion\nDiastolic function: Grade I impairment' },
      { id: 'e28', date: '2026-02-10', type: 'followup', title: 'Quarterly Review Scheduled', summary: 'Full review with updated labs', details: 'Comprehensive quarterly review scheduled for March 29.\nPatient to get labs 3-4 days before visit.\nInclude: HbA1c, RFT, lipid profile, urinary albumin.' },
    ],
  },
];

const filterOptions = [
  { value: 'all', label: 'All Events' },
  { value: 'visit', label: 'Visits' },
  { value: 'lab', label: 'Lab Results' },
  { value: 'prescription', label: 'Prescriptions' },
  { value: 'followup', label: 'Follow-ups' },
];

const patientOptions = patients.map((p) => ({
  value: p.id,
  label: `${p.name} (${p.mr})`,
}));

// ── Component ────────────────────────────────────────────────

export default function PatientTimeline() {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0].id);
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const patient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const filteredEvents = patient.events
    .filter((e) => typeFilter === 'all' || e.type === typeFilter)
    .filter(
      (e) =>
        !searchTerm ||
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Patient Timeline
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Chronological view of visits, labs, prescriptions & follow-ups
          </p>
        </div>
      </div>

      {/* Patient Selector + Filters */}
      <Card hover={false}>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Patient"
              options={[{ value: '', label: 'Select patient' }, ...patientOptions]}
              value={selectedPatientId}
              onChange={(e) => {
                setSelectedPatientId(e.target.value);
                setExpandedEvent(null);
              }}
            />
            <Select
              label="Filter by Type"
              options={filterOptions}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            />
            <Input
              label="Search Events"
              placeholder="Search by title or summary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Patient Info Bar */}
      <div className="glass-card-static p-4 flex flex-wrap items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-teal-400 flex items-center justify-center text-white font-bold shadow-lg shadow-[var(--primary-glow)]">
          {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="text-base font-semibold text-[var(--text-primary)]">{patient.name}</p>
          <p className="text-xs text-[var(--text-secondary)]">
            {patient.mr} &middot; {patient.age} yrs &middot; {patient.gender === 'M' ? 'Male' : 'Female'} &middot; {patient.bloodGroup}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Badge variant="info">{filteredEvents.length} events</Badge>
          <div className="flex gap-1.5">
            {(['visit', 'lab', 'prescription', 'followup'] as EventType[]).map((type) => {
              const count = patient.events.filter((e) => e.type === type).length;
              const cfg = eventConfig[type];
              return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all ${
                    typeFilter === type
                      ? `${cfg.bg} ${cfg.color} border ${cfg.border}`
                      : 'bg-[var(--surface)] text-[var(--text-tertiary)] border border-[var(--surface-border)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {cfg.label}: {count}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical connecting line */}
        <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--primary)]/40 via-[var(--surface-border)] to-transparent" />

        <div className="space-y-1 stagger-children">
          {filteredEvents.map((event) => {
            const cfg = eventConfig[event.type];
            const Icon = cfg.icon;
            const isExpanded = expandedEvent === event.id;

            return (
              <div key={event.id} className="relative pl-14">
                {/* Timeline dot */}
                <div className="absolute left-[16px] top-4 z-10">
                  <div className={`w-[15px] h-[15px] rounded-full ${cfg.dotColor} shadow-[0_0_8px_rgba(0,0,0,0.2)] ring-4 ring-[var(--background)] transition-transform duration-300 ${isExpanded ? 'scale-125' : ''}`} />
                </div>

                {/* Event card */}
                <div
                  className={`glass-card-static p-4 transition-all duration-300 cursor-pointer hover:border-[var(--primary)]/20 ${
                    isExpanded ? `border ${cfg.border} shadow-lg` : ''
                  }`}
                  onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2 rounded-lg ${cfg.bg} shrink-0`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                            {event.title}
                          </h3>
                          <Badge
                            variant="default"
                            className="text-[10px]"
                          >
                            {cfg.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{event.summary}</p>
                        {event.doctor && (
                          <p className="text-[10px] text-[var(--text-tertiary)] mt-1 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {event.doctor}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                        <Clock className="w-3 h-3" />
                        {new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[var(--text-tertiary)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[var(--surface-border)]">
                      <div className={`p-3 rounded-[var(--radius-sm)] ${cfg.bg} border ${cfg.border}`}>
                        <pre className="text-xs text-[var(--text-primary)] whitespace-pre-wrap font-sans leading-relaxed">
                          {event.details}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredEvents.length === 0 && (
            <div className="pl-14">
              <div className="glass-card-static p-8 text-center">
                <Filter className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-2" />
                <p className="text-sm text-[var(--text-tertiary)]">No events match the current filter</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2"
                  onClick={() => { setTypeFilter('all'); setSearchTerm(''); }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
