import { useState } from 'react';
import {
  Search, Calendar, Clock, CheckCircle, Loader2, Users,
  Eye, X, Stethoscope, Phone, FileText, CalendarDays, List,
} from 'lucide-react';
import { AppointmentCalendar } from '@/features/shared/AppointmentCalendar';
import { MetricCard } from '@/components/shared/MetricCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

type AppointmentStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
type AppointmentType = 'walk-in' | 'scheduled';
type Priority = 'normal' | 'urgent' | 'emergency';

interface Appointment {
  id: string;
  token: string;
  patientName: string;
  mrNumber: string;
  doctorName: string;
  department: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  priority: Priority;
  phone: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  vitals: { bp: string; temp: string; pulse: string };
}

const demoAppointments: Appointment[] = [
  { id: '1', token: 'T-001', patientName: 'Ahmad Khan', mrNumber: 'MR-2026-00001', doctorName: 'Dr. Tariq Ahmed', department: 'Cardiology', time: '09:00 AM', type: 'scheduled', status: 'completed', priority: 'urgent', phone: '0300-1234567', age: 45, gender: 'Male', chiefComplaint: 'Chest pain and shortness of breath', vitals: { bp: '150/95', temp: '98.4°F', pulse: '88 bpm' } },
  { id: '2', token: 'T-002', patientName: 'Fatima Bibi', mrNumber: 'MR-2026-00002', doctorName: 'Dr. Saira Khan', department: 'General Medicine', time: '09:15 AM', type: 'walk-in', status: 'completed', priority: 'normal', phone: '0321-2345678', age: 32, gender: 'Female', chiefComplaint: 'Fever and body aches for 3 days', vitals: { bp: '120/80', temp: '101.2°F', pulse: '92 bpm' } },
  { id: '3', token: 'T-003', patientName: 'Muhammad Usman', mrNumber: 'MR-2026-00003', doctorName: 'Dr. Tariq Ahmed', department: 'Cardiology', time: '09:30 AM', type: 'scheduled', status: 'completed', priority: 'normal', phone: '0333-3456789', age: 58, gender: 'Male', chiefComplaint: 'Follow-up for hypertension management', vitals: { bp: '140/90', temp: '98.6°F', pulse: '76 bpm' } },
  { id: '4', token: 'T-004', patientName: 'Saima Noor', mrNumber: 'MR-2026-00004', doctorName: 'Dr. Saira Khan', department: 'General Medicine', time: '09:45 AM', type: 'walk-in', status: 'completed', priority: 'normal', phone: '0345-4567890', age: 27, gender: 'Female', chiefComplaint: 'Asthma exacerbation', vitals: { bp: '115/75', temp: '98.2°F', pulse: '96 bpm' } },
  { id: '5', token: 'T-005', patientName: 'Hassan Mahmood', mrNumber: 'MR-2026-00005', doctorName: 'Dr. Imran Malik', department: 'Orthopedics', time: '10:00 AM', type: 'scheduled', status: 'completed', priority: 'urgent', phone: '0312-5678901', age: 62, gender: 'Male', chiefComplaint: 'Severe knee pain bilateral', vitals: { bp: '145/88', temp: '98.4°F', pulse: '80 bpm' } },
  { id: '6', token: 'T-006', patientName: 'Ayesha Siddiqui', mrNumber: 'MR-2026-00006', doctorName: 'Dr. Amna Rashid', department: 'Gynecology', time: '10:15 AM', type: 'scheduled', status: 'completed', priority: 'normal', phone: '0300-6789012', age: 41, gender: 'Female', chiefComplaint: 'Routine checkup and thyroid follow-up', vitals: { bp: '118/76', temp: '98.6°F', pulse: '72 bpm' } },
  { id: '7', token: 'T-007', patientName: 'Bilal Shah', mrNumber: 'MR-2026-00007', doctorName: 'Dr. Faisal Iqbal', department: 'ENT', time: '10:30 AM', type: 'walk-in', status: 'completed', priority: 'normal', phone: '0321-7890123', age: 35, gender: 'Male', chiefComplaint: 'Persistent ear pain and hearing loss', vitals: { bp: '122/78', temp: '99.0°F', pulse: '74 bpm' } },
  { id: '8', token: 'T-008', patientName: 'Zainab Akhtar', mrNumber: 'MR-2026-00008', doctorName: 'Dr. Saira Khan', department: 'General Medicine', time: '10:45 AM', type: 'scheduled', status: 'completed', priority: 'normal', phone: '0333-8901234', age: 29, gender: 'Female', chiefComplaint: 'Iron deficiency follow-up', vitals: { bp: '105/68', temp: '98.4°F', pulse: '82 bpm' } },
  { id: '9', token: 'T-009', patientName: 'Tariq Mehmood', mrNumber: 'MR-2026-00009', doctorName: 'Dr. Tariq Ahmed', department: 'Cardiology', time: '11:00 AM', type: 'scheduled', status: 'in_progress', priority: 'urgent', phone: '0345-9012345', age: 52, gender: 'Male', chiefComplaint: 'Diabetic neuropathy assessment', vitals: { bp: '155/92', temp: '98.6°F', pulse: '86 bpm' } },
  { id: '10', token: 'T-010', patientName: 'Rabia Aslam', mrNumber: 'MR-2026-00010', doctorName: 'Dr. Nadia Zafar', department: 'Dermatology', time: '11:15 AM', type: 'walk-in', status: 'in_progress', priority: 'normal', phone: '0312-0123456', age: 38, gender: 'Female', chiefComplaint: 'Skin rash and itching', vitals: { bp: '118/74', temp: '98.4°F', pulse: '70 bpm' } },
  { id: '11', token: 'T-011', patientName: 'Imran Hussain', mrNumber: 'MR-2026-00011', doctorName: 'Dr. Imran Malik', department: 'Orthopedics', time: '11:30 AM', type: 'scheduled', status: 'in_progress', priority: 'normal', phone: '0300-1122334', age: 48, gender: 'Male', chiefComplaint: 'Gout flare-up right foot', vitals: { bp: '138/86', temp: '99.2°F', pulse: '78 bpm' } },
  { id: '12', token: 'T-012', patientName: 'Nadia Pervez', mrNumber: 'MR-2026-00012', doctorName: 'Dr. Amna Rashid', department: 'Gynecology', time: '11:45 AM', type: 'walk-in', status: 'waiting', priority: 'normal', phone: '0321-2233445', age: 55, gender: 'Female', chiefComplaint: 'Joint pain and osteoporosis concerns', vitals: { bp: '130/82', temp: '98.4°F', pulse: '74 bpm' } },
  { id: '13', token: 'T-013', patientName: 'Farhan Raza', mrNumber: 'MR-2026-00013', doctorName: 'Dr. Faisal Iqbal', department: 'ENT', time: '12:00 PM', type: 'walk-in', status: 'waiting', priority: 'normal', phone: '0333-3344556', age: 22, gender: 'Male', chiefComplaint: 'Sore throat for 5 days', vitals: { bp: '116/72', temp: '100.4°F', pulse: '88 bpm' } },
  { id: '14', token: 'T-014', patientName: 'Saba Malik', mrNumber: 'MR-2026-00014', doctorName: 'Dr. Saira Khan', department: 'General Medicine', time: '12:15 PM', type: 'scheduled', status: 'waiting', priority: 'normal', phone: '0345-4455667', age: 34, gender: 'Female', chiefComplaint: 'PCOS follow-up', vitals: { bp: '120/78', temp: '98.6°F', pulse: '76 bpm' } },
  { id: '15', token: 'T-015', patientName: 'Waqas Ahmed', mrNumber: 'MR-2026-00015', doctorName: 'Dr. Tariq Ahmed', department: 'Cardiology', time: '12:30 PM', type: 'scheduled', status: 'waiting', priority: 'emergency', phone: '0312-5566778', age: 70, gender: 'Male', chiefComplaint: 'CKD monitoring and BP management', vitals: { bp: '165/100', temp: '98.8°F', pulse: '94 bpm' } },
  { id: '16', token: 'T-016', patientName: 'Hamza Ali', mrNumber: 'MR-2026-00016', doctorName: 'Dr. Nadia Zafar', department: 'Dermatology', time: '12:45 PM', type: 'walk-in', status: 'waiting', priority: 'normal', phone: '0300-9988776', age: 28, gender: 'Male', chiefComplaint: 'Acne and scarring treatment', vitals: { bp: '118/74', temp: '98.4°F', pulse: '68 bpm' } },
  { id: '17', token: 'T-017', patientName: 'Kiran Batool', mrNumber: 'MR-2026-00017', doctorName: 'Dr. Imran Malik', department: 'Orthopedics', time: '01:00 PM', type: 'scheduled', status: 'waiting', priority: 'normal', phone: '0321-8877665', age: 44, gender: 'Female', chiefComplaint: 'Lower back pain for 2 weeks', vitals: { bp: '125/80', temp: '98.6°F', pulse: '72 bpm' } },
  { id: '18', token: 'T-018', patientName: 'Adeel Qureshi', mrNumber: 'MR-2026-00018', doctorName: 'Dr. Faisal Iqbal', department: 'ENT', time: '01:15 PM', type: 'walk-in', status: 'waiting', priority: 'urgent', phone: '0333-7766554', age: 39, gender: 'Male', chiefComplaint: 'Vertigo and dizziness episodes', vitals: { bp: '130/85', temp: '98.4°F', pulse: '80 bpm' } },
  { id: '19', token: 'T-019', patientName: 'Mehreen Shahid', mrNumber: 'MR-2026-00019', doctorName: 'Dr. Amna Rashid', department: 'Gynecology', time: '01:30 PM', type: 'scheduled', status: 'cancelled', priority: 'normal', phone: '0345-6655443', age: 30, gender: 'Female', chiefComplaint: 'Prenatal checkup', vitals: { bp: '—', temp: '—', pulse: '—' } },
  { id: '20', token: 'T-020', patientName: 'Usman Ghani', mrNumber: 'MR-2026-00020', doctorName: 'Dr. Saira Khan', department: 'General Medicine', time: '01:45 PM', type: 'walk-in', status: 'no_show', priority: 'normal', phone: '0312-5544332', age: 56, gender: 'Male', chiefComplaint: 'Annual health screening', vitals: { bp: '—', temp: '—', pulse: '—' } },
];

const DOCTOR_OPTIONS = [
  { value: '', label: 'All Doctors' },
  { value: 'Dr. Tariq Ahmed', label: 'Dr. Tariq Ahmed' },
  { value: 'Dr. Saira Khan', label: 'Dr. Saira Khan' },
  { value: 'Dr. Imran Malik', label: 'Dr. Imran Malik' },
  { value: 'Dr. Amna Rashid', label: 'Dr. Amna Rashid' },
  { value: 'Dr. Faisal Iqbal', label: 'Dr. Faisal Iqbal' },
  { value: 'Dr. Nadia Zafar', label: 'Dr. Nadia Zafar' },
];

const DEPARTMENT_OPTIONS = [
  { value: '', label: 'All Departments' },
  { value: 'Cardiology', label: 'Cardiology' },
  { value: 'General Medicine', label: 'General Medicine' },
  { value: 'Orthopedics', label: 'Orthopedics' },
  { value: 'Gynecology', label: 'Gynecology' },
  { value: 'ENT', label: 'ENT' },
  { value: 'Dermatology', label: 'Dermatology' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'scheduled', label: 'Scheduled' },
];

const statusBadgeVariant: Record<AppointmentStatus, 'waiting' | 'in_progress' | 'completed' | 'cancelled'> = {
  waiting: 'waiting',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
  no_show: 'cancelled',
};

const statusLabel: Record<AppointmentStatus, string> = {
  waiting: 'Waiting',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

const priorityBadge: Record<Priority, { variant: 'default' | 'warning' | 'danger'; label: string }> = {
  normal: { variant: 'default', label: 'Normal' },
  urgent: { variant: 'warning', label: 'Urgent' },
  emergency: { variant: 'danger', label: 'Emergency' },
};

export function AdminAppointments() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('2026-03-29');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const filtered = demoAppointments.filter((a) => {
    const matchesSearch =
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.mrNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.token.toLowerCase().includes(search.toLowerCase());
    const matchesDoctor = !doctorFilter || a.doctorName === doctorFilter;
    const matchesDept = !deptFilter || a.department === deptFilter;
    const matchesStatus = !statusFilter || a.status === statusFilter;
    const matchesType = !typeFilter || a.type === typeFilter;
    return matchesSearch && matchesDoctor && matchesDept && matchesStatus && matchesType;
  });

  const totalToday = demoAppointments.length;
  const completed = demoAppointments.filter((a) => a.status === 'completed').length;
  const inProgress = demoAppointments.filter((a) => a.status === 'in_progress').length;
  const waiting = demoAppointments.filter((a) => a.status === 'waiting').length;

  if (viewMode === 'calendar') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Appointments</h1>
          <div className="flex items-center rounded-[var(--radius-sm)] border border-[var(--surface-border)] overflow-hidden bg-[var(--surface)]">
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-all"
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--primary)] text-white shadow-sm transition-all"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Calendar
            </button>
          </div>
        </div>
        <AppointmentCalendar
          title=""
          subtitle="Admin view · All doctors and departments"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Appointments</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage all appointments across doctors and departments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-[var(--radius-sm)] border border-[var(--surface-border)] overflow-hidden bg-[var(--surface)]">
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--primary)] text-white shadow-sm transition-all"
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-all"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Calendar
            </button>
          </div>
          <div className="w-44">
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} icon={<Calendar className="w-4 h-4" />} />
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <MetricCard title="Total Today" value={totalToday} icon={Calendar} subtitle="All appointments" />
        <MetricCard title="Completed" value={completed} icon={CheckCircle} trend={{ value: 12, positive: true }} iconColor="bg-emerald-500/10 text-emerald-500" />
        <MetricCard title="In Progress" value={inProgress} icon={Loader2} subtitle="Currently consulting" iconColor="bg-blue-500/10 text-blue-500" />
        <MetricCard title="Waiting" value={waiting} icon={Users} subtitle="In queue" iconColor="bg-amber-500/10 text-amber-500" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[220px] max-w-sm">
          <Input
            placeholder="Search patient, MR#, token..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-44">
          <Select options={DOCTOR_OPTIONS} value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} />
        </div>
        <div className="w-44">
          <Select options={DEPARTMENT_OPTIONS} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} />
        </div>
        <div className="w-36">
          <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
        </div>
        <div className="w-36">
          <Select options={TYPE_OPTIONS} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Token</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>MR#</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((appt) => (
            <TableRow key={appt.id} className="cursor-pointer" onClick={() => setSelectedAppt(appt)}>
              <TableCell>
                <span className="font-mono text-xs font-bold text-[var(--primary)]">{appt.token}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xs font-semibold">
                    {appt.patientName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className="font-semibold text-sm">{appt.patientName}</span>
                </div>
              </TableCell>
              <TableCell><span className="font-mono text-xs">{appt.mrNumber}</span></TableCell>
              <TableCell><span className="text-sm">{appt.doctorName}</span></TableCell>
              <TableCell><span className="text-sm">{appt.department}</span></TableCell>
              <TableCell>
                <span className="text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[var(--text-tertiary)]" /> {appt.time}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={appt.type === 'scheduled' ? 'info' : 'accent'}>
                  {appt.type === 'scheduled' ? 'Scheduled' : 'Walk-in'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={statusBadgeVariant[appt.status]} dot>
                  {statusLabel[appt.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={priorityBadge[appt.priority].variant}>
                  {priorityBadge[appt.priority].label}
                </Badge>
              </TableCell>
              <TableCell>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedAppt(appt); }}
                  className="p-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4 text-[var(--primary)]" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--text-tertiary)]">No appointments match your filters.</p>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <Modal open={true} onClose={() => setSelectedAppt(null)} title={`Appointment Details — ${selectedAppt.token}`} size="lg">
          <div className="space-y-6">
            {/* Status Row */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={statusBadgeVariant[selectedAppt.status]} dot>
                {statusLabel[selectedAppt.status]}
              </Badge>
              <Badge variant={selectedAppt.type === 'scheduled' ? 'info' : 'accent'}>
                {selectedAppt.type === 'scheduled' ? 'Scheduled' : 'Walk-in'}
              </Badge>
              <Badge variant={priorityBadge[selectedAppt.priority].variant}>
                {priorityBadge[selectedAppt.priority].label}
              </Badge>
              <span className="text-sm text-[var(--text-secondary)] flex items-center gap-1 ml-auto">
                <Clock className="w-4 h-4" /> {selectedAppt.time}
              </span>
            </div>

            {/* Patient Info */}
            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Patient Information</p>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-lg font-bold">
                  {selectedAppt.patientName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{selectedAppt.patientName}</h3>
                  <p className="text-sm text-[var(--primary)] font-mono font-semibold">{selectedAppt.mrNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Age</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{selectedAppt.age}y</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Gender</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{selectedAppt.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{selectedAppt.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1"><FileText className="w-3 h-3" /> Complaint</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{selectedAppt.chiefComplaint}</p>
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3 flex items-center gap-1">
                <Stethoscope className="w-3 h-3" /> Assigned Doctor
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Doctor</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{selectedAppt.doctorName}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Department</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{selectedAppt.department}</p>
                </div>
              </div>
            </div>

            {/* Vitals */}
            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Vitals</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Blood Pressure</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{selectedAppt.vitals.bp}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Temperature</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{selectedAppt.vitals.temp}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Pulse</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{selectedAppt.vitals.pulse}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setSelectedAppt(null)}>Close</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
