import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock, Users, CheckCircle2,
  Search, Filter, Play, Eye, AlertTriangle, User, Phone, X,
  Stethoscope, Activity, FileText, Pill, Heart
} from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';

// ── Types ─────────────────────────────────────────────────────

interface Appointment {
  id: string;
  token: string;
  patientName: string;
  mr: string;
  age: number;
  gender: 'M' | 'F';
  phone: string;
  bloodGroup: string;
  conditions: string[];
  timeSlot: string;
  type: 'walk-in' | 'scheduled';
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  priority: 'normal' | 'urgent' | 'follow-up';
  diagnosis?: string;
}

// ── Demo Data ─────────────────────────────────────────────────

const todayAppointments: Appointment[] = [
  { id: '1', token: 'T-001', patientName: 'Rashid Mehmood', mr: 'MR-20240812', age: 58, gender: 'M', phone: '+92 301 2345678', bloodGroup: 'A+', conditions: ['Cardiac', 'Diabetic'], timeSlot: '09:00 AM', type: 'scheduled', status: 'completed', priority: 'urgent', diagnosis: 'Unstable Angina' },
  { id: '2', token: 'T-002', patientName: 'Nazia Begum', mr: 'MR-20241201', age: 45, gender: 'F', phone: '+92 333 9876543', bloodGroup: 'B+', conditions: ['Hypertension'], timeSlot: '09:30 AM', type: 'scheduled', status: 'completed', priority: 'follow-up', diagnosis: 'Essential Hypertension' },
  { id: '3', token: 'T-003', patientName: 'Imran Saeed', mr: 'MR-20240654', age: 62, gender: 'M', phone: '+92 300 1112233', bloodGroup: 'O+', conditions: ['Cardiac', 'COPD'], timeSlot: '10:00 AM', type: 'walk-in', status: 'completed', priority: 'urgent', diagnosis: 'Acute Exacerbation of COPD' },
  { id: '4', token: 'T-004', patientName: 'Sadia Parveen', mr: 'MR-20241345', age: 35, gender: 'F', phone: '+92 321 4455667', bloodGroup: 'AB+', conditions: ['Palpitations'], timeSlot: '10:30 AM', type: 'scheduled', status: 'completed', priority: 'normal' },
  { id: '5', token: 'T-005', patientName: 'Ahmad Khan', mr: 'MR-20240445', age: 52, gender: 'M', phone: '+92 300 1234567', bloodGroup: 'B+', conditions: ['Cardiac', 'Diabetic', 'CKD'], timeSlot: '11:00 AM', type: 'scheduled', status: 'in_progress', priority: 'follow-up' },
  { id: '6', token: 'T-006', patientName: 'Zainab Fatima', mr: 'MR-20240998', age: 48, gender: 'F', phone: '+92 312 6677889', bloodGroup: 'A-', conditions: ['Valvular Disease'], timeSlot: '11:30 AM', type: 'scheduled', status: 'waiting', priority: 'normal' },
  { id: '7', token: 'T-007', patientName: 'Tariq Hussain', mr: 'MR-20241078', age: 55, gender: 'M', phone: '+92 345 1122334', bloodGroup: 'O-', conditions: ['Cardiac'], timeSlot: '12:00 PM', type: 'walk-in', status: 'waiting', priority: 'urgent' },
  { id: '8', token: 'T-008', patientName: 'Bushra Nawaz', mr: 'MR-20240876', age: 40, gender: 'F', phone: '+92 303 5566778', bloodGroup: 'B-', conditions: ['Hypertension', 'Diabetic'], timeSlot: '12:30 PM', type: 'scheduled', status: 'waiting', priority: 'follow-up' },
  { id: '9', token: 'T-009', patientName: 'Fahad Ali', mr: 'MR-20241456', age: 63, gender: 'M', phone: '+92 311 8899001', bloodGroup: 'A+', conditions: ['Cardiac', 'CKD'], timeSlot: '02:00 PM', type: 'scheduled', status: 'waiting', priority: 'normal' },
  { id: '10', token: 'T-010', patientName: 'Samina Akhtar', mr: 'MR-20241567', age: 50, gender: 'F', phone: '+92 322 3344556', bloodGroup: 'O+', conditions: ['Arrhythmia'], timeSlot: '02:30 PM', type: 'walk-in', status: 'waiting', priority: 'urgent' },
  { id: '11', token: 'T-011', patientName: 'Khalid Mahmood', mr: 'MR-20241678', age: 47, gender: 'M', phone: '+92 334 6677889', bloodGroup: 'AB-', conditions: ['Hypertension'], timeSlot: '03:00 PM', type: 'scheduled', status: 'cancelled', priority: 'normal' },
  { id: '12', token: 'T-012', patientName: 'Rubina Shah', mr: 'MR-20241789', age: 38, gender: 'F', phone: '+92 300 9900112', bloodGroup: 'B+', conditions: ['Palpitations', 'Anxiety'], timeSlot: '03:30 PM', type: 'scheduled', status: 'no_show', priority: 'normal' },
];

const upcomingAppointments: Appointment[] = [
  { id: 'u1', token: 'T-101', patientName: 'Hassan Raza', mr: 'MR-20241890', age: 60, gender: 'M', phone: '+92 301 1234567', bloodGroup: 'A+', conditions: ['Cardiac'], timeSlot: '09:00 AM', type: 'scheduled', status: 'waiting', priority: 'follow-up' },
  { id: 'u2', token: 'T-102', patientName: 'Amna Bibi', mr: 'MR-20241901', age: 55, gender: 'F', phone: '+92 333 2345678', bloodGroup: 'O+', conditions: ['Hypertension', 'Diabetic'], timeSlot: '09:30 AM', type: 'scheduled', status: 'waiting', priority: 'normal' },
  { id: 'u3', token: 'T-103', patientName: 'Waqar Ahmed', mr: 'MR-20242012', age: 44, gender: 'M', phone: '+92 312 3456789', bloodGroup: 'B+', conditions: ['Arrhythmia'], timeSlot: '10:00 AM', type: 'walk-in', status: 'waiting', priority: 'urgent' },
  { id: 'u4', token: 'T-104', patientName: 'Nasreen Bano', mr: 'MR-20242123', age: 67, gender: 'F', phone: '+92 345 4567890', bloodGroup: 'AB+', conditions: ['Cardiac', 'CKD'], timeSlot: '10:30 AM', type: 'scheduled', status: 'waiting', priority: 'follow-up' },
  { id: 'u5', token: 'T-105', patientName: 'Faisal Iqbal', mr: 'MR-20242234', age: 51, gender: 'M', phone: '+92 300 5678901', bloodGroup: 'A-', conditions: ['Valvular Disease'], timeSlot: '11:00 AM', type: 'scheduled', status: 'waiting', priority: 'normal' },
];

const pastAppointments: Appointment[] = [
  { id: 'p1', token: 'T-201', patientName: 'Aslam Pervez', mr: 'MR-20240123', age: 70, gender: 'M', phone: '+92 301 9876543', bloodGroup: 'O-', conditions: ['Cardiac', 'Diabetic'], timeSlot: '09:00 AM', type: 'scheduled', status: 'completed', priority: 'follow-up', diagnosis: 'Chronic Heart Failure - NYHA Class II' },
  { id: 'p2', token: 'T-202', patientName: 'Tahira Parveen', mr: 'MR-20240234', age: 53, gender: 'F', phone: '+92 333 8765432', bloodGroup: 'A+', conditions: ['Hypertension'], timeSlot: '09:30 AM', type: 'scheduled', status: 'completed', priority: 'normal', diagnosis: 'Resistant Hypertension' },
  { id: 'p3', token: 'T-203', patientName: 'Saleem Akhtar', mr: 'MR-20240345', age: 65, gender: 'M', phone: '+92 312 7654321', bloodGroup: 'B-', conditions: ['Cardiac', 'COPD'], timeSlot: '10:00 AM', type: 'walk-in', status: 'completed', priority: 'urgent', diagnosis: 'Acute Coronary Syndrome' },
  { id: 'p4', token: 'T-204', patientName: 'Fozia Bibi', mr: 'MR-20240456', age: 42, gender: 'F', phone: '+92 345 6543210', bloodGroup: 'AB+', conditions: ['Palpitations'], timeSlot: '10:30 AM', type: 'scheduled', status: 'completed', priority: 'normal', diagnosis: 'Supraventricular Tachycardia' },
  { id: 'p5', token: 'T-205', patientName: 'Naveed Iqbal', mr: 'MR-20240567', age: 59, gender: 'M', phone: '+92 300 5432109', bloodGroup: 'O+', conditions: ['Cardiac', 'Diabetic', 'CKD'], timeSlot: '11:00 AM', type: 'scheduled', status: 'completed', priority: 'follow-up', diagnosis: 'Diabetic Cardiomyopathy' },
  { id: 'p6', token: 'T-206', patientName: 'Shabana Kanwal', mr: 'MR-20240678', age: 36, gender: 'F', phone: '+92 321 4321098', bloodGroup: 'A-', conditions: ['Arrhythmia'], timeSlot: '11:30 AM', type: 'walk-in', status: 'completed', priority: 'urgent', diagnosis: 'Atrial Fibrillation' },
  { id: 'p7', token: 'T-207', patientName: 'Zahid Mehmood', mr: 'MR-20240789', age: 72, gender: 'M', phone: '+92 303 3210987', bloodGroup: 'B+', conditions: ['Cardiac'], timeSlot: '02:00 PM', type: 'scheduled', status: 'completed', priority: 'normal', diagnosis: 'Aortic Stenosis - Moderate' },
  { id: 'p8', token: 'T-208', patientName: 'Kausar Begum', mr: 'MR-20240890', age: 49, gender: 'F', phone: '+92 334 2109876', bloodGroup: 'O+', conditions: ['Hypertension', 'Diabetic'], timeSlot: '02:30 PM', type: 'scheduled', status: 'completed', priority: 'follow-up', diagnosis: 'Hypertensive Heart Disease' },
];

// ── Helpers ───────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; variant: 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'danger' }> = {
  waiting: { label: 'Waiting', variant: 'waiting' },
  in_progress: { label: 'In Progress', variant: 'in_progress' },
  completed: { label: 'Completed', variant: 'completed' },
  cancelled: { label: 'Cancelled', variant: 'cancelled' },
  no_show: { label: 'No Show', variant: 'danger' },
};

const priorityConfig: Record<string, { label: string; variant: 'danger' | 'warning' | 'info' }> = {
  urgent: { label: 'Urgent', variant: 'danger' },
  'follow-up': { label: 'Follow-up', variant: 'info' },
  normal: { label: 'Normal', variant: 'warning' },
};

// ── Component ─────────────────────────────────────────────────

// ── Demo consultation notes helper ───────────────────────────
const getConsultationNotes = (apt: Appointment) => {
  const diagnosisNotes: Record<string, { notes: string; prescription: string; vitals: { bp: string; pulse: string; temp: string; spo2: string } }> = {
    'Unstable Angina': {
      notes: 'Patient presented with chest pain radiating to left arm, exacerbated on exertion. ECG showed ST depression in leads V4-V6. Troponin levels mildly elevated. Started on antianginal therapy and referred for coronary angiography.',
      prescription: 'Tab. Aspirin 150mg OD, Tab. Clopidogrel 75mg OD, Tab. Atorvastatin 40mg HS, Tab. Metoprolol 25mg BD, Inj. Enoxaparin 60mg SC BD',
      vitals: { bp: '150/95 mmHg', pulse: '92 bpm', temp: '98.4 F', spo2: '96%' },
    },
    'Essential Hypertension': {
      notes: 'Follow-up visit for hypertension management. BP still above target despite current regimen. Added ACE inhibitor. Advised salt restriction and daily walk for 30 minutes. Renal function tests ordered.',
      prescription: 'Tab. Amlodipine 5mg OD, Tab. Enalapril 5mg BD, Tab. Hydrochlorothiazide 12.5mg OD',
      vitals: { bp: '155/100 mmHg', pulse: '78 bpm', temp: '98.2 F', spo2: '98%' },
    },
    'Acute Exacerbation of COPD': {
      notes: 'Patient with known COPD presented with worsening dyspnea and productive cough (purulent sputum) for 3 days. Bilateral rhonchi on auscultation. CXR shows hyperinflated lungs. Started on antibiotics and nebulization. Cardiac evaluation for cor pulmonale.',
      prescription: 'Tab. Azithromycin 500mg OD x 5 days, Neb. Salbutamol + Ipratropium TDS, Tab. Prednisolone 40mg OD x 5 days tapering, Inhaler Tiotropium 18mcg OD',
      vitals: { bp: '130/85 mmHg', pulse: '98 bpm', temp: '99.8 F', spo2: '89%' },
    },
    'Chronic Heart Failure - NYHA Class II': {
      notes: 'Follow-up for CHF. Patient reports mild exertional dyspnea but improved from last visit. No orthopnea or PND. Pedal edema trace. Echo shows EF 38%. Optimized heart failure medications. Advised fluid restriction to 1.5L/day.',
      prescription: 'Tab. Carvedilol 6.25mg BD, Tab. Ramipril 5mg OD, Tab. Spironolactone 25mg OD, Tab. Furosemide 40mg OD, Tab. Sacubitril/Valsartan 50mg BD',
      vitals: { bp: '118/75 mmHg', pulse: '68 bpm', temp: '98.0 F', spo2: '95%' },
    },
    'Resistant Hypertension': {
      notes: 'Patient on triple antihypertensive therapy with suboptimal control. Secondary causes ruled out (renal artery doppler normal, aldosterone-renin ratio normal). Added fourth agent. Renal denervation discussed as future option.',
      prescription: 'Tab. Amlodipine 10mg OD, Tab. Telmisartan 80mg OD, Tab. Chlorthalidone 12.5mg OD, Tab. Spironolactone 25mg OD',
      vitals: { bp: '160/105 mmHg', pulse: '82 bpm', temp: '98.6 F', spo2: '97%' },
    },
    'Acute Coronary Syndrome': {
      notes: 'Presented with acute chest pain, diaphoresis. ECG: ST elevation in II, III, aVF (inferior STEMI). Immediate dual antiplatelet loading given. Primary PCI performed - stent placed in RCA. Post-procedure stable.',
      prescription: 'Tab. Aspirin 75mg OD, Tab. Prasugrel 10mg OD, Tab. Atorvastatin 80mg HS, Tab. Metoprolol 50mg BD, Tab. Ramipril 2.5mg OD',
      vitals: { bp: '100/70 mmHg', pulse: '88 bpm', temp: '98.8 F', spo2: '94%' },
    },
  };

  if (apt.diagnosis && diagnosisNotes[apt.diagnosis]) {
    return diagnosisNotes[apt.diagnosis];
  }

  return {
    notes: apt.diagnosis
      ? `Patient evaluated for ${apt.diagnosis}. Clinical examination performed. Treatment plan discussed with patient. Follow-up advised in 2 weeks.`
      : 'Consultation in progress. Notes will be finalized upon completion.',
    prescription: apt.diagnosis ? 'Prescription provided as per diagnosis. See pharmacy records.' : 'Pending consultation completion.',
    vitals: { bp: '120/80 mmHg', pulse: '76 bpm', temp: '98.4 F', spo2: '98%' },
  };
};

export default function MyAppointments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'past'>('today');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(null);
  const [viewNotesPatient, setViewNotesPatient] = useState<Appointment | null>(null);
  const [dateOffset, setDateOffset] = useState(0);

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + dateOffset);
  const displayDate = baseDate.toLocaleDateString('en-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const completedToday = todayAppointments.filter((a) => a.status === 'completed').length;

  const getAppointments = () => {
    const source =
      activeTab === 'today' ? todayAppointments :
      activeTab === 'upcoming' ? upcomingAppointments :
      pastAppointments;

    return source.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      return true;
    });
  };

  const tabs = [
    { key: 'today' as const, label: 'Today', count: todayAppointments.length },
    { key: 'upcoming' as const, label: 'Upcoming', count: upcomingAppointments.length },
    { key: 'past' as const, label: 'Past', count: pastAppointments.length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            My Appointments
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Dr. Tariq Ahmed &middot; Cardiologist
          </p>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setDateOffset((d) => d - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={dateOffset === 0 ? 'primary' : 'secondary'}
            onClick={() => setDateOffset(0)}
          >
            <CalendarDays className="w-4 h-4" />
            {dateOffset === 0 ? 'Today' : displayDate.split(',')[0]}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDateOffset((d) => d + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="text-sm text-[var(--text-secondary)] ml-2 hidden md:inline">
            {displayDate}
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <MetricCard
          title="Today's Appointments"
          value={todayAppointments.length}
          subtitle={`${todayAppointments.filter((a) => a.status === 'waiting').length} still waiting`}
          icon={CalendarDays}
          trend={{ value: 8, positive: true }}
        />
        <MetricCard
          title="This Week"
          value={42}
          subtitle="Avg 7 per day"
          icon={Users}
          iconColor="bg-[var(--info-bg)] text-blue-600"
        />
        <MetricCard
          title="Completed Today"
          value={completedToday}
          subtitle={`${Math.round((completedToday / todayAppointments.length) * 100)}% of today's list`}
          icon={CheckCircle2}
          iconColor="bg-[var(--success-bg)] text-emerald-600"
          trend={{ value: 15, positive: true }}
        />
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 glass-card-static rounded-[var(--radius-sm)] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-[var(--radius-xs)] text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'text-white/80' : 'text-[var(--text-tertiary)]'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Filter className="w-4 h-4" />
          Filters:
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
        >
          <option value="all">All Statuses</option>
          <option value="waiting">Waiting</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
        >
          <option value="all">All Types</option>
          <option value="walk-in">Walk-in</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {/* Appointments Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Token</TableHead>
            <TableHead>Patient Name</TableHead>
            <TableHead>MR#</TableHead>
            <TableHead>Age/Gender</TableHead>
            <TableHead>Time Slot</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            {activeTab === 'past' && <TableHead>Diagnosis</TableHead>}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getAppointments().map((apt) => {
            const sc = statusConfig[apt.status];
            const pc = priorityConfig[apt.priority];
            return (
              <TableRow key={apt.id} className={apt.priority === 'urgent' ? 'border-l-4 border-l-red-500' : ''}>
                <TableCell>
                  <span className="font-mono text-xs font-semibold text-[var(--text-secondary)]">
                    {apt.token}
                  </span>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => setSelectedPatient(apt)}
                    className="text-sm font-semibold text-[var(--primary)] hover:underline cursor-pointer"
                  >
                    {apt.patientName}
                  </button>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-[var(--text-secondary)]">{apt.mr}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{apt.age}{apt.gender}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                    <span className="text-sm">{apt.timeSlot}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={apt.type === 'walk-in' ? 'accent' : 'default'} className="text-[10px]">
                    {apt.type === 'walk-in' ? 'Walk-in' : 'Scheduled'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={sc.variant} dot className="text-[10px]">
                    {sc.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={pc.variant} className="text-[10px]">
                    {apt.priority === 'urgent' && <AlertTriangle className="w-3 h-3" />}
                    {pc.label}
                  </Badge>
                </TableCell>
                {activeTab === 'past' && (
                  <TableCell>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {apt.diagnosis || '-'}
                    </span>
                  </TableCell>
                )}
                <TableCell>
                  {apt.status === 'waiting' ? (
                    <Button size="sm" variant="primary" onClick={() => navigate('/doctor/opd')}>
                      <Play className="w-3.5 h-3.5" />
                      Start Consult
                    </Button>
                  ) : (apt.status === 'completed' || apt.status === 'in_progress') ? (
                    <Button size="sm" variant="ghost" onClick={() => setViewNotesPatient(apt)}>
                      <Eye className="w-3.5 h-3.5" />
                      View Notes
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" disabled>
                      <Eye className="w-3.5 h-3.5" />
                      View Notes
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {getAppointments().length === 0 && (
        <EmptyState
          type="no-results"
          title="No appointments found"
          description="No appointments match the selected filters or search. Try switching tabs or clearing the search."
          size="md"
        />
      )}

      {/* Quick Profile Modal */}
      <Modal
        open={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title="Patient Profile"
        size="md"
      >
        {selectedPatient && (
          <div className="space-y-4">
            {/* Patient Header */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-teal-400 flex items-center justify-center text-white font-bold text-lg">
                {selectedPatient.patientName.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{selectedPatient.patientName}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{selectedPatient.mr}</p>
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card-static p-3 text-center rounded-[var(--radius-sm)]">
                <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Age</p>
                <p className="text-sm font-bold text-[var(--text-primary)]">{selectedPatient.age} yrs</p>
              </div>
              <div className="glass-card-static p-3 text-center rounded-[var(--radius-sm)]">
                <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Gender</p>
                <p className="text-sm font-bold text-[var(--text-primary)]">{selectedPatient.gender === 'M' ? 'Male' : 'Female'}</p>
              </div>
              <div className="glass-card-static p-3 text-center rounded-[var(--radius-sm)]">
                <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Blood</p>
                <p className="text-sm font-bold text-red-500">{selectedPatient.bloodGroup}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <Phone className="w-4 h-4" />
              {selectedPatient.phone}
            </div>

            {/* Conditions */}
            <div>
              <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Conditions</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedPatient.conditions.map((c) => (
                  <Badge key={c} variant="warning" className="text-[10px]">{c}</Badge>
                ))}
              </div>
            </div>

            {/* Appointment Info */}
            <div className="pt-3 border-t border-[var(--surface-border)]">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[var(--text-tertiary)]">Time Slot:</span>
                  <span className="ml-2 font-semibold text-[var(--text-primary)]">{selectedPatient.timeSlot}</span>
                </div>
                <div>
                  <span className="text-[var(--text-tertiary)]">Type:</span>
                  <span className="ml-2">
                    <Badge variant={selectedPatient.type === 'walk-in' ? 'accent' : 'default'} className="text-[10px]">
                      {selectedPatient.type === 'walk-in' ? 'Walk-in' : 'Scheduled'}
                    </Badge>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* View Notes Modal */}
      <Modal
        open={!!viewNotesPatient}
        onClose={() => setViewNotesPatient(null)}
        title="Consultation Notes"
        size="lg"
      >
        {viewNotesPatient && (() => {
          const consultData = getConsultationNotes(viewNotesPatient);
          const sc = statusConfig[viewNotesPatient.status];
          return (
            <div className="space-y-5">
              {/* Patient Header */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-teal-400 flex items-center justify-center text-white font-bold text-lg">
                  {viewNotesPatient.patientName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{viewNotesPatient.patientName}</h3>
                    <Badge variant={sc.variant} dot className="text-[10px]">{sc.label}</Badge>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {viewNotesPatient.mr} &middot; {viewNotesPatient.age} yrs, {viewNotesPatient.gender === 'M' ? 'Male' : 'Female'} &middot; {viewNotesPatient.bloodGroup}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {viewNotesPatient.timeSlot} &middot; {viewNotesPatient.type === 'walk-in' ? 'Walk-in' : 'Scheduled'}
                  </p>
                </div>
              </div>

              {/* Diagnosis */}
              {viewNotesPatient.diagnosis && (
                <div className="glass-card-static p-4 rounded-[var(--radius-sm)] border-l-4 border-l-[var(--primary)]">
                  <div className="flex items-center gap-2 mb-1">
                    <Stethoscope className="w-4 h-4 text-[var(--primary)]" />
                    <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Diagnosis</p>
                  </div>
                  <p className="text-base font-bold text-[var(--text-primary)]">{viewNotesPatient.diagnosis}</p>
                </div>
              )}

              {/* Vitals */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-[var(--text-secondary)]" />
                  <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Vitals</p>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="glass-card-static p-3 text-center rounded-[var(--radius-sm)]">
                    <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">BP</p>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{consultData.vitals.bp}</p>
                  </div>
                  <div className="glass-card-static p-3 text-center rounded-[var(--radius-sm)]">
                    <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Pulse</p>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{consultData.vitals.pulse}</p>
                  </div>
                  <div className="glass-card-static p-3 text-center rounded-[var(--radius-sm)]">
                    <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">Temp</p>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{consultData.vitals.temp}</p>
                  </div>
                  <div className="glass-card-static p-3 text-center rounded-[var(--radius-sm)]">
                    <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-0.5">SpO2</p>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{consultData.vitals.spo2}</p>
                  </div>
                </div>
              </div>

              {/* Consultation Notes */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                  <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Consultation Notes from This Visit</p>
                </div>
                <div className="glass-card-static p-4 rounded-[var(--radius-sm)]">
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed">{consultData.notes}</p>
                </div>
              </div>

              {/* Prescription */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="w-4 h-4 text-[var(--text-secondary)]" />
                  <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Prescription</p>
                </div>
                <div className="glass-card-static p-4 rounded-[var(--radius-sm)]">
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed">{consultData.prescription}</p>
                </div>
              </div>

              {/* Conditions & Allergies */}
              <div className="pt-3 border-t border-[var(--surface-border)]">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-[var(--text-secondary)]" />
                  <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Conditions</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {viewNotesPatient.conditions.map((c) => (
                    <Badge key={c} variant="warning" className="text-[10px]">{c}</Badge>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
