import { useState } from 'react';
import {
  Search, User, Phone, CreditCard, Droplets, AlertTriangle, Clock,
  ChevronDown, ChevronRight, Eye, X, FileText, FlaskConical, Pill,
  Activity, Calendar, Stethoscope, TrendingUp,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import VitalsTrend, { type VitalsDataPoint } from './VitalsTrend';
import PatientHoverCard from '@/components/ui/PatientHoverCard';

// ── Types ─────────────────────────────────────────────────────

interface Visit {
  date: string;
  doctor: string;
  diagnosis: string;
  vitals: string;
  notes: string;
}

interface LabResult {
  date: string;
  testName: string;
  keyValues: string;
}

interface PrescriptionMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
}

interface Prescription {
  date: string;
  doctor: string;
  diagnosis: string;
  medicines: PrescriptionMedicine[];
}

interface PatientRecord {
  id: string;
  mr: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  phone: string;
  cnic: string;
  bloodGroup: string;
  conditions: string[];
  allergies: string[];
  lastVisit: string;
  visits: Visit[];
  labResults: LabResult[];
  prescriptions: Prescription[];
  vitalsHistory?: VitalsDataPoint[];
}

// ── Demo Data ─────────────────────────────────────────────────

const patients: PatientRecord[] = [
  {
    id: '1', mr: 'MR-20240445', name: 'Ahmad Khan', age: 52, gender: 'M',
    phone: '+92 300 1234567', cnic: '35201-1234567-1', bloodGroup: 'B+',
    conditions: ['Cardiac', 'Diabetic', 'CKD Stage 2'],
    allergies: ['Penicillin', 'Sulfa drugs'],
    lastVisit: '29 Mar 2026',
    visits: [
      { date: '29 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Essential Hypertension, Type 2 DM', vitals: 'BP 142/88, HR 78, SpO2 97%', notes: 'Patient reports improved compliance with medications. BP still above target. Increased Amlodipine to 10mg. HbA1c ordered for follow-up. Advised dietary modifications and daily 30-min walking.' },
      { date: '12 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Hypertension follow-up', vitals: 'BP 148/92, HR 82, SpO2 98%', notes: 'BP elevated. Added Losartan 50mg. Advised low-sodium diet. Follow-up in 2 weeks.' },
      { date: '25 Feb 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'CKD Stage 2 monitoring', vitals: 'BP 150/94, HR 76, SpO2 97%', notes: 'Creatinine stable at 1.4. GFR 62. Continue current nephro-protective regimen. Avoid NSAIDs.' },
      { date: '10 Feb 2026', doctor: 'Dr. Saima Noor', diagnosis: 'Annual cardiac review', vitals: 'BP 138/86, HR 74, SpO2 98%', notes: 'Echo shows mild LVH. EF 55%. No new complaints. Continue current medications.' },
      { date: '15 Jan 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Type 2 DM management', vitals: 'BP 144/90, HR 80, SpO2 97%', notes: 'HbA1c 7.2%. Fasting glucose 132. Increased Metformin to 1000mg BD. Dietary counseling provided.' },
    ],
    labResults: [
      { date: '29 Mar 2026', testName: 'HbA1c', keyValues: '7.0%' },
      { date: '29 Mar 2026', testName: 'Renal Function Tests', keyValues: 'Creatinine 1.4, BUN 22, GFR 62' },
      { date: '12 Mar 2026', testName: 'Lipid Profile', keyValues: 'TC 210, LDL 138, HDL 42, TG 156' },
      { date: '25 Feb 2026', testName: 'CBC', keyValues: 'Hb 13.1, WBC 7.2, Plt 245' },
    ],
    prescriptions: [
      { date: '29 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Essential Hypertension, Type 2 DM', medicines: [
        { name: 'Amlodipine', dosage: '10mg', frequency: 'OD (Once daily)', duration: '30 days', route: 'Oral', instructions: 'Take in the morning' },
        { name: 'Losartan', dosage: '50mg', frequency: 'OD (Once daily)', duration: '30 days', route: 'Oral', instructions: 'Take in the evening' },
        { name: 'Metformin', dosage: '1000mg', frequency: 'BD (Twice daily)', duration: '30 days', route: 'Oral', instructions: 'Take with meals' },
        { name: 'Atorvastatin', dosage: '20mg', frequency: 'HS (At bedtime)', duration: '30 days', route: 'Oral', instructions: 'Take at bedtime' },
      ]},
      { date: '12 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Hypertension follow-up', medicines: [
        { name: 'Amlodipine', dosage: '5mg', frequency: 'OD (Once daily)', duration: '14 days', route: 'Oral', instructions: 'Take in the morning' },
        { name: 'Losartan', dosage: '50mg', frequency: 'OD (Once daily)', duration: '14 days', route: 'Oral', instructions: 'Take in the evening' },
        { name: 'Metformin', dosage: '500mg', frequency: 'BD (Twice daily)', duration: '14 days', route: 'Oral', instructions: 'Take with meals' },
      ]},
    ],
    vitalsHistory: [
      { date: '15 Jan 2026', systolic: 144, diastolic: 90, pulse: 80, weight: 84 },
      { date: '10 Feb 2026', systolic: 138, diastolic: 86, pulse: 74, weight: 83 },
      { date: '25 Feb 2026', systolic: 150, diastolic: 94, pulse: 76, weight: 83.5 },
      { date: '12 Mar 2026', systolic: 148, diastolic: 92, pulse: 82, weight: 82 },
      { date: '29 Mar 2026', systolic: 142, diastolic: 88, pulse: 78, weight: 81 },
    ],
  },
  {
    id: '2', mr: 'MR-20241201', name: 'Nazia Begum', age: 45, gender: 'F',
    phone: '+92 333 9876543', cnic: '35202-2345678-2', bloodGroup: 'O+',
    conditions: ['Hypertension'],
    allergies: [],
    lastVisit: '28 Mar 2026',
    visits: [
      { date: '28 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Essential Hypertension', vitals: 'BP 136/84, HR 72, SpO2 99%', notes: 'Good BP control on current regimen. Continue same. Follow-up in 1 month.' },
      { date: '01 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Hypertension follow-up', vitals: 'BP 142/88, HR 76, SpO2 98%', notes: 'Slightly elevated. Advised stress management and regular exercise.' },
      { date: '01 Feb 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'New patient - Hypertension', vitals: 'BP 158/96, HR 80, SpO2 98%', notes: 'Newly diagnosed hypertension. Started on Amlodipine 5mg. Baseline labs ordered.' },
    ],
    labResults: [
      { date: '01 Feb 2026', testName: 'Lipid Profile', keyValues: 'TC 195, LDL 120, HDL 48, TG 134' },
      { date: '01 Feb 2026', testName: 'Renal Function Tests', keyValues: 'Creatinine 0.8, BUN 14, GFR 95' },
    ],
    prescriptions: [
      { date: '28 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Essential Hypertension', medicines: [
        { name: 'Amlodipine', dosage: '5mg', frequency: 'OD (Once daily)', duration: '30 days', route: 'Oral', instructions: 'Take in the morning' },
      ]},
    ],
    vitalsHistory: [
      { date: '01 Feb 2026', systolic: 158, diastolic: 96, pulse: 80, weight: 68 },
      { date: '01 Mar 2026', systolic: 142, diastolic: 88, pulse: 76, weight: 67.5 },
      { date: '28 Mar 2026', systolic: 136, diastolic: 84, pulse: 72, weight: 67 },
    ],
  },
  {
    id: '3', mr: 'MR-20240654', name: 'Imran Saeed', age: 62, gender: 'M',
    phone: '+92 300 1112233', cnic: '35203-3456789-3', bloodGroup: 'A+',
    conditions: ['Cardiac', 'COPD'],
    allergies: ['Aspirin'],
    lastVisit: '27 Mar 2026',
    visits: [
      { date: '27 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Stable Angina, COPD exacerbation', vitals: 'BP 130/82, HR 88, SpO2 93%', notes: 'Mild COPD exacerbation. Increased bronchodilator. Cardiac status stable. ECG normal sinus.' },
      { date: '10 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Cardiac follow-up', vitals: 'BP 128/80, HR 76, SpO2 95%', notes: 'Stable on current medications. Echo scheduled for next visit.' },
      { date: '20 Feb 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'COPD review', vitals: 'BP 132/84, HR 82, SpO2 94%', notes: 'Pulmonary function stable. Continue inhalers. Smoking cessation counseling.' },
    ],
    labResults: [
      { date: '27 Mar 2026', testName: 'Cardiac Enzymes', keyValues: 'Troponin <0.01, CK-MB 12' },
      { date: '10 Mar 2026', testName: 'CBC', keyValues: 'Hb 14.2, WBC 9.1, Plt 198' },
    ],
    prescriptions: [
      { date: '27 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Stable Angina, COPD exacerbation', medicines: [
        { name: 'Isosorbide Mononitrate', dosage: '30mg', frequency: 'OD (Once daily)', duration: '30 days', route: 'Oral', instructions: 'Take in the morning on empty stomach' },
        { name: 'Salbutamol Inhaler', dosage: '100mcg', frequency: 'PRN (As needed)', duration: '30 days', route: 'Inhalation', instructions: '2 puffs as needed for breathlessness' },
        { name: 'Tiotropium', dosage: '18mcg', frequency: 'OD (Once daily)', duration: '30 days', route: 'Inhalation', instructions: 'Inhale once daily via HandiHaler' },
      ]},
    ],
  },
  {
    id: '4', mr: 'MR-20241345', name: 'Sadia Parveen', age: 35, gender: 'F',
    phone: '+92 321 4455667', cnic: '35204-4567890-4', bloodGroup: 'AB+',
    conditions: ['Palpitations'],
    allergies: [],
    lastVisit: '26 Mar 2026',
    visits: [
      { date: '26 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Benign Palpitations', vitals: 'BP 118/74, HR 84, SpO2 99%', notes: 'Holter monitor showed occasional PACs. Benign. Advised to reduce caffeine intake. Reassurance given.' },
    ],
    labResults: [
      { date: '26 Mar 2026', testName: 'Thyroid Function', keyValues: 'TSH 2.4, T3 1.2, T4 8.5' },
    ],
    prescriptions: [],
  },
  {
    id: '5', mr: 'MR-20240998', name: 'Zainab Fatima', age: 48, gender: 'F',
    phone: '+92 312 6677889', cnic: '35205-5678901-5', bloodGroup: 'A-',
    conditions: ['Valvular Disease'],
    allergies: ['Iodine'],
    lastVisit: '25 Mar 2026',
    visits: [
      { date: '25 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Mitral Valve Prolapse', vitals: 'BP 122/78, HR 70, SpO2 98%', notes: 'Stable MVP. Echo shows mild MR. No symptoms at rest. Advised moderate exercise. Follow-up in 3 months.' },
      { date: '10 Jan 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'MVP follow-up', vitals: 'BP 124/80, HR 72, SpO2 98%', notes: 'Asymptomatic. Echo stable. Continue observation.' },
    ],
    labResults: [],
    prescriptions: [
      { date: '25 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Mitral Valve Prolapse', medicines: [
        { name: 'Propranolol', dosage: '20mg', frequency: 'BD (Twice daily)', duration: '90 days', route: 'Oral', instructions: 'Take morning and evening' },
      ]},
    ],
  },
  {
    id: '6', mr: 'MR-20241078', name: 'Tariq Hussain', age: 55, gender: 'M',
    phone: '+92 345 1122334', cnic: '35206-6789012-6', bloodGroup: 'O-',
    conditions: ['Cardiac'],
    allergies: [],
    lastVisit: '24 Mar 2026',
    visits: [
      { date: '24 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Post-MI follow-up', vitals: 'BP 126/78, HR 68, SpO2 98%', notes: 'Doing well post-MI. Cardiac rehab progressing. EF improved to 50%. Continue dual antiplatelet therapy.' },
    ],
    labResults: [
      { date: '24 Mar 2026', testName: 'Lipid Profile', keyValues: 'TC 168, LDL 88, HDL 52, TG 140' },
    ],
    prescriptions: [
      { date: '24 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Post-MI follow-up', medicines: [
        { name: 'Aspirin', dosage: '75mg', frequency: 'OD (Once daily)', duration: '90 days', route: 'Oral', instructions: 'Take after breakfast' },
        { name: 'Clopidogrel', dosage: '75mg', frequency: 'OD (Once daily)', duration: '90 days', route: 'Oral', instructions: 'Take after lunch' },
        { name: 'Atorvastatin', dosage: '40mg', frequency: 'HS (At bedtime)', duration: '90 days', route: 'Oral', instructions: 'Take at bedtime' },
        { name: 'Metoprolol', dosage: '50mg', frequency: 'BD (Twice daily)', duration: '90 days', route: 'Oral', instructions: 'Take morning and evening' },
      ]},
    ],
  },
  {
    id: '7', mr: 'MR-20240876', name: 'Bushra Nawaz', age: 40, gender: 'F',
    phone: '+92 303 5566778', cnic: '35207-7890123-7', bloodGroup: 'B-',
    conditions: ['Hypertension', 'Diabetic'],
    allergies: ['Latex'],
    lastVisit: '23 Mar 2026',
    visits: [
      { date: '23 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'HTN + DM management', vitals: 'BP 140/88, HR 76, SpO2 98%', notes: 'BP slightly above target. HbA1c improving. Continue current plan. Nutritionist referral provided.' },
    ],
    labResults: [
      { date: '23 Mar 2026', testName: 'HbA1c', keyValues: '7.4%' },
    ],
    prescriptions: [
      { date: '23 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'HTN + DM management', medicines: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'OD (Once daily)', duration: '30 days', route: 'Oral', instructions: 'Take in the morning' },
        { name: 'Metformin', dosage: '500mg', frequency: 'BD (Twice daily)', duration: '30 days', route: 'Oral', instructions: 'Take with meals' },
        { name: 'Glimepiride', dosage: '2mg', frequency: 'OD (Once daily)', duration: '30 days', route: 'Oral', instructions: 'Take before breakfast' },
      ]},
    ],
  },
  {
    id: '8', mr: 'MR-20241456', name: 'Fahad Ali', age: 63, gender: 'M',
    phone: '+92 311 8899001', cnic: '35208-8901234-8', bloodGroup: 'A+',
    conditions: ['Cardiac', 'CKD'],
    allergies: [],
    lastVisit: '22 Mar 2026',
    visits: [
      { date: '22 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Chronic Heart Failure', vitals: 'BP 118/72, HR 64, SpO2 96%', notes: 'NYHA Class II. Stable on current medications. Fluid restriction maintained. Echo in 3 months.' },
    ],
    labResults: [
      { date: '22 Mar 2026', testName: 'BNP', keyValues: 'NT-proBNP 480 pg/mL' },
      { date: '22 Mar 2026', testName: 'Renal Function Tests', keyValues: 'Creatinine 1.6, BUN 28, GFR 48' },
    ],
    prescriptions: [
      { date: '22 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Chronic Heart Failure', medicines: [
        { name: 'Carvedilol', dosage: '12.5mg', frequency: 'BD (Twice daily)', duration: '30 days', route: 'Oral', instructions: 'Take with food morning and evening' },
        { name: 'Furosemide', dosage: '40mg', frequency: 'OD (Once daily)', duration: '30 days', route: 'Oral', instructions: 'Take in the morning' },
        { name: 'Spironolactone', dosage: '25mg', frequency: 'OD (Once daily)', duration: '30 days', route: 'Oral', instructions: 'Take in the afternoon' },
        { name: 'Sacubitril/Valsartan', dosage: '50mg', frequency: 'BD (Twice daily)', duration: '30 days', route: 'Oral', instructions: 'Take morning and evening' },
      ]},
    ],
  },
  {
    id: '9', mr: 'MR-20241567', name: 'Samina Akhtar', age: 50, gender: 'F',
    phone: '+92 322 3344556', cnic: '35209-9012345-9', bloodGroup: 'O+',
    conditions: ['Arrhythmia'],
    allergies: ['Codeine'],
    lastVisit: '21 Mar 2026',
    visits: [
      { date: '21 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Atrial Fibrillation', vitals: 'BP 128/80, HR 92 irregular, SpO2 97%', notes: 'Persistent AFib. Rate controlled with Diltiazem. CHA2DS2-VASc score 3. Started on Apixaban for stroke prevention.' },
    ],
    labResults: [
      { date: '21 Mar 2026', testName: 'Coagulation Profile', keyValues: 'PT 12.5, INR 1.0, APTT 28' },
    ],
    prescriptions: [
      { date: '21 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Atrial Fibrillation', medicines: [
        { name: 'Diltiazem', dosage: '120mg', frequency: 'BD (Twice daily)', duration: '30 days', route: 'Oral', instructions: 'Take morning and evening for rate control' },
        { name: 'Apixaban', dosage: '5mg', frequency: 'BD (Twice daily)', duration: '30 days', route: 'Oral', instructions: 'Take morning and evening for stroke prevention' },
      ]},
    ],
  },
  {
    id: '10', mr: 'MR-20241678', name: 'Khalid Mahmood', age: 47, gender: 'M',
    phone: '+92 334 6677889', cnic: '35210-0123456-0', bloodGroup: 'AB-',
    conditions: ['Hypertension'],
    allergies: [],
    lastVisit: '20 Mar 2026',
    visits: [
      { date: '20 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Essential Hypertension', vitals: 'BP 146/92, HR 78, SpO2 99%', notes: 'Newly diagnosed. Started on low-dose ACEI. Lifestyle modifications discussed at length. Follow-up in 2 weeks.' },
    ],
    labResults: [
      { date: '20 Mar 2026', testName: 'Basic Metabolic Panel', keyValues: 'Na 140, K 4.2, Glucose 98, Creatinine 0.9' },
    ],
    prescriptions: [
      { date: '20 Mar 2026', doctor: 'Dr. Tariq Ahmed', diagnosis: 'Essential Hypertension', medicines: [
        { name: 'Enalapril', dosage: '5mg', frequency: 'OD (Once daily)', duration: '14 days', route: 'Oral', instructions: 'Take in the morning, monitor for cough' },
      ]},
    ],
  },
];

const recentlyViewed = patients.slice(0, 5);

const conditionColors: Record<string, string> = {
  Cardiac: 'danger',
  Diabetic: 'warning',
  Hypertension: 'info',
  COPD: 'accent',
  CKD: 'cancelled',
  'CKD Stage 2': 'cancelled',
  Palpitations: 'info',
  'Valvular Disease': 'accent',
  Arrhythmia: 'warning',
};

// ── Component ─────────────────────────────────────────────────

export default function PatientRecords() {
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [recordTab, setRecordTab] = useState<'visits' | 'labs' | 'prescriptions' | 'vitals'>('visits');
  const [expandedVisit, setExpandedVisit] = useState<number | null>(null);

  const filteredPatients = search.length > 0
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.mr.toLowerCase().includes(search.toLowerCase()) ||
          p.phone.includes(search)
      )
    : [];

  const openRecord = (p: PatientRecord) => {
    setSelectedPatient(p);
    setRecordTab('visits');
    setExpandedVisit(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Patient Records
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Search and view detailed patient records
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl">
        <Input
          placeholder="Search by name, MR#, or phone..."
          icon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Recently Viewed */}
      {search.length === 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Recently Viewed
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentlyViewed.map((p) => (
              <button
                key={p.id}
                onClick={() => openRecord(p)}
                className="glass-card p-4 min-w-[200px] flex-shrink-0 text-left hover:border-[var(--primary)]/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--primary)] to-teal-400 flex items-center justify-center text-white text-xs font-bold">
                    {p.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{p.name}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{p.mr}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {p.conditions.slice(0, 2).map((c) => (
                    <Badge key={c} variant={(conditionColors[c] as any) || 'default'} className="text-[9px]">{c}</Badge>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-2">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {p.lastVisit}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {search.length > 0 && (
        <div>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            {filteredPatients.length} result{filteredPatients.length !== 1 ? 's' : ''} found
          </p>
          {filteredPatients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MR#</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Age/Gender</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-[var(--text-secondary)]">{p.mr}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-teal-400 flex items-center justify-center text-white text-[10px] font-bold">
                          {p.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <PatientHoverCard patient={p} onOpenRecord={() => openRecord(p)}>
                          <span className="text-sm font-semibold text-[var(--text-primary)] cursor-pointer hover:text-[var(--primary)] transition-colors">{p.name}</span>
                        </PatientHoverCard>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{p.age}{p.gender}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[var(--text-secondary)]">{p.phone}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {p.conditions.map((c) => (
                          <Badge key={c} variant={(conditionColors[c] as any) || 'default'} className="text-[10px]">{c}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[var(--text-secondary)]">{p.lastVisit}</span>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="primary" onClick={() => openRecord(p)}>
                        <Eye className="w-3.5 h-3.5" />
                        View Record
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Card hover={false} className="text-center !py-12">
              <Search className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
              <p className="text-sm text-[var(--text-tertiary)]">No patients found matching your search.</p>
            </Card>
          )}
        </div>
      )}

      {/* All Patients (when no search) */}
      {search.length === 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            All Patients
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MR#</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Age/Gender</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Conditions</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="font-mono text-xs font-semibold text-[var(--text-secondary)]">{p.mr}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-teal-400 flex items-center justify-center text-white text-[10px] font-bold">
                        {p.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <PatientHoverCard patient={p} onOpenRecord={() => openRecord(p)}>
                        <span className="text-sm font-semibold text-[var(--text-primary)] cursor-pointer hover:text-[var(--primary)] transition-colors">{p.name}</span>
                      </PatientHoverCard>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{p.age}{p.gender}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-[var(--text-secondary)]">{p.phone}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.conditions.map((c) => (
                        <Badge key={c} variant={(conditionColors[c] as any) || 'default'} className="text-[10px]">{c}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-[var(--text-secondary)]">{p.lastVisit}</span>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="primary" onClick={() => openRecord(p)}>
                      <Eye className="w-3.5 h-3.5" />
                      View Record
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Full Patient Record Modal */}
      <Modal
        open={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title={selectedPatient ? `${selectedPatient.name} - Patient Record` : ''}
        description={selectedPatient?.mr}
        size="full"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Demographics */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--primary)] to-teal-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[var(--primary-glow)]">
                  {selectedPatient.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{selectedPatient.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{selectedPatient.mr}</p>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div className="glass-card-static p-2.5 text-center rounded-[var(--radius-sm)]">
                  <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Age</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{selectedPatient.age} yrs</p>
                </div>
                <div className="glass-card-static p-2.5 text-center rounded-[var(--radius-sm)]">
                  <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Gender</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{selectedPatient.gender === 'M' ? 'Male' : 'Female'}</p>
                </div>
                <div className="glass-card-static p-2.5 text-center rounded-[var(--radius-sm)]">
                  <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Blood</p>
                  <p className="text-sm font-bold text-red-500">{selectedPatient.bloodGroup}</p>
                </div>
                <div className="glass-card-static p-2.5 text-center rounded-[var(--radius-sm)]">
                  <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Phone</p>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">{selectedPatient.phone}</p>
                </div>
                <div className="glass-card-static p-2.5 text-center rounded-[var(--radius-sm)] col-span-2">
                  <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">CNIC</p>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">{selectedPatient.cnic}</p>
                </div>
              </div>
            </div>

            {/* Conditions & Allergies */}
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Conditions</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPatient.conditions.map((c) => (
                    <Badge key={c} variant={(conditionColors[c] as any) || 'warning'} className="text-[10px]">{c}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                  <AlertTriangle className="w-3 h-3 inline mr-1 text-red-500" />
                  Allergies
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPatient.allergies.length > 0
                    ? selectedPatient.allergies.map((a) => (
                        <Badge key={a} variant="danger" className="text-[10px]">{a}</Badge>
                      ))
                    : <span className="text-xs text-[var(--text-tertiary)]">No known allergies</span>
                  }
                </div>
              </div>
            </div>

            {/* Record Tabs */}
            <div className="flex flex-wrap items-center gap-1 p-1 glass-card-static rounded-[var(--radius-sm)] w-fit">
              {[
                { key: 'visits' as const, label: 'Visit History', icon: Stethoscope },
                { key: 'labs' as const, label: 'Lab Results', icon: FlaskConical },
                { key: 'prescriptions' as const, label: 'Prescriptions', icon: Pill },
                { key: 'vitals' as const, label: 'Vitals Trend', icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setRecordTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-xs)] text-sm font-semibold transition-all duration-200 ${
                    recordTab === tab.key
                      ? 'bg-[var(--primary)] text-white shadow-md'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Visit History Timeline */}
            {recordTab === 'visits' && (
              <div className="relative pl-8 space-y-0">
                {/* Timeline line */}
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-[var(--surface-border)]" />

                {selectedPatient.visits.map((visit, i) => (
                  <div key={i} className="relative pb-6">
                    {/* Timeline dot */}
                    <div className={`absolute -left-5 top-1.5 w-3 h-3 rounded-full border-2 ${
                      i === 0 ? 'bg-[var(--primary)] border-[var(--primary)]' : 'bg-[var(--surface)] border-[var(--surface-border)]'
                    }`} />

                    <button
                      onClick={() => setExpandedVisit(expandedVisit === i ? null : i)}
                      className="w-full text-left glass-card-static p-4 rounded-[var(--radius-sm)] hover:border-[var(--primary)]/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-[var(--text-tertiary)]" />
                          <span className="text-sm font-semibold text-[var(--text-primary)]">{visit.date}</span>
                          <span className="text-xs text-[var(--text-tertiary)]">{visit.doctor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="info" className="text-[10px]">{visit.diagnosis}</Badge>
                          {expandedVisit === i ? <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />}
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        <Activity className="w-3 h-3 inline mr-1" />
                        {visit.vitals}
                      </p>

                      {expandedVisit === i && (() => {
                        const matchedRx = selectedPatient.prescriptions.find(rx => rx.date === visit.date);
                        return (
                          <div className="mt-3 pt-3 border-t border-[var(--surface-border)]" onClick={(e) => e.stopPropagation()}>
                            <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Clinical Notes</p>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{visit.notes}</p>

                            {matchedRx && matchedRx.medicines.length > 0 && (
                              <div className="mt-4">
                                <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <Pill className="w-3 h-3 text-[var(--primary)]" />
                                  Prescription
                                </p>
                                <div className="overflow-x-auto rounded-[var(--radius-xs)] border border-[var(--surface-border)]">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="bg-[var(--surface)]/50">
                                        <th className="text-left px-3 py-2 text-[var(--text-tertiary)] font-semibold">#</th>
                                        <th className="text-left px-3 py-2 text-[var(--text-tertiary)] font-semibold">Medicine</th>
                                        <th className="text-left px-3 py-2 text-[var(--text-tertiary)] font-semibold">Dosage</th>
                                        <th className="text-left px-3 py-2 text-[var(--text-tertiary)] font-semibold">Frequency</th>
                                        <th className="text-left px-3 py-2 text-[var(--text-tertiary)] font-semibold">Duration</th>
                                        <th className="text-left px-3 py-2 text-[var(--text-tertiary)] font-semibold">Route</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {matchedRx.medicines.map((med, j) => (
                                        <tr key={j} className="border-t border-[var(--surface-border)]/50">
                                          <td className="px-3 py-1.5 text-[var(--text-tertiary)]">{j + 1}</td>
                                          <td className="px-3 py-1.5 text-[var(--text-primary)] font-semibold">{med.name}</td>
                                          <td className="px-3 py-1.5 text-[var(--text-secondary)]">{med.dosage}</td>
                                          <td className="px-3 py-1.5 text-[var(--text-secondary)]">{med.frequency}</td>
                                          <td className="px-3 py-1.5 text-[var(--text-secondary)]">{med.duration}</td>
                                          <td className="px-3 py-1.5 text-[var(--text-secondary)]">{med.route}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Lab Results */}
            {recordTab === 'labs' && (
              <div>
                {selectedPatient.labResults.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPatient.labResults.map((lab, i) => (
                      <div key={i} className="glass-card-static p-4 rounded-[var(--radius-sm)]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FlaskConical className="w-4 h-4 text-[var(--primary)]" />
                            <span className="text-sm font-semibold text-[var(--text-primary)]">{lab.testName}</span>
                          </div>
                          <span className="text-xs text-[var(--text-tertiary)]">{lab.date}</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mt-2 ml-7">{lab.keyValues}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FlaskConical className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
                    <p className="text-sm text-[var(--text-tertiary)]">No lab results on file.</p>
                  </div>
                )}
              </div>
            )}

            {/* Prescriptions */}
            {recordTab === 'prescriptions' && (
              <div>
                {selectedPatient.prescriptions.length > 0 ? (
                  <div className="space-y-5">
                    {selectedPatient.prescriptions.map((rx, i) => (
                      <div key={i} className="glass-card-static rounded-[var(--radius-sm)] overflow-hidden">
                        {/* Prescription header */}
                        <div className="px-5 py-3 border-b border-[var(--surface-border)] bg-[var(--surface)]/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Pill className="w-4 h-4 text-[var(--primary)]" />
                              <span className="text-sm font-bold text-[var(--text-primary)]">{rx.date}</span>
                              <span className="text-xs text-[var(--text-tertiary)]">|</span>
                              <span className="text-xs text-[var(--text-secondary)]">{rx.doctor}</span>
                            </div>
                            <Badge variant="default" className="text-[10px]">{rx.medicines.length} medicine{rx.medicines.length !== 1 ? 's' : ''}</Badge>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-1 ml-7">
                            <span className="text-[var(--text-tertiary)] font-semibold">Dx:</span> {rx.diagnosis}
                          </p>
                        </div>
                        {/* Medicines table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-[var(--surface)]/20">
                                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">#</th>
                                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Medicine</th>
                                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Dosage</th>
                                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Frequency</th>
                                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Duration</th>
                                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Route</th>
                                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Instructions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rx.medicines.map((med, j) => (
                                <tr key={j} className="border-t border-[var(--surface-border)]/50 hover:bg-[var(--surface)]/20 transition-colors">
                                  <td className="px-4 py-2.5 text-[var(--text-tertiary)]">{j + 1}</td>
                                  <td className="px-4 py-2.5 text-[var(--text-primary)] font-semibold">{med.name}</td>
                                  <td className="px-4 py-2.5 text-[var(--text-secondary)] font-mono">{med.dosage}</td>
                                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">{med.frequency}</td>
                                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">{med.duration}</td>
                                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">{med.route}</td>
                                  <td className="px-4 py-2.5 text-[var(--text-tertiary)] italic">{med.instructions}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Pill className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
                    <p className="text-sm text-[var(--text-tertiary)]">No prescriptions on file.</p>
                  </div>
                )}
              </div>
            )}

            {/* Vitals Trend */}
            {recordTab === 'vitals' && (
              <VitalsTrend data={selectedPatient.vitalsHistory ?? []} />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
