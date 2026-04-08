import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Clock,
  User,
  Phone,
  MapPin,
  Droplets,
  Calendar,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';

/* ------------------------------------------------------------------ */
/*  Demo Data                                                         */
/* ------------------------------------------------------------------ */

interface Appointment {
  token: string;
  patient: string;
  mr: string;
  phone: string;
  gender: string;
  bloodGroup: string;
  dob: string;
  address: string;
  doctor: string;
  department: string;
  status: string;
  time: string;
  type: string;
}

const demoAppointments: Appointment[] = [
  { token: 'T-001', patient: 'Ahmed Raza', mr: 'MR-10234', phone: '0321-5551234', gender: 'Male', bloodGroup: 'B+', dob: '1985-03-12', address: 'Johar Town, Lahore', doctor: 'Dr. Farhan Sheikh', department: 'Cardiology', status: 'completed', time: '09:00 AM', type: 'Scheduled' },
  { token: 'T-002', patient: 'Fatima Bibi', mr: 'MR-10235', phone: '0300-6782345', gender: 'Female', bloodGroup: 'A+', dob: '1992-07-25', address: 'Askari, Rawalpindi', doctor: 'Dr. Sana Malik', department: 'Gynecology', status: 'completed', time: '09:15 AM', type: 'Scheduled' },
  { token: 'T-003', patient: 'Usman Tariq', mr: 'MR-10236', phone: '0333-9014567', gender: 'Male', bloodGroup: 'O+', dob: '1978-11-03', address: 'Gulberg III, Lahore', doctor: 'Dr. Asif Javed', department: 'Orthopedics', status: 'in_progress', time: '09:30 AM', type: 'Scheduled' },
  { token: 'T-004', patient: 'Ayesha Noor', mr: 'MR-10237', phone: '0345-8901234', gender: 'Female', bloodGroup: 'AB+', dob: '1995-01-18', address: 'DHA Phase 5, Islamabad', doctor: 'Dr. Farhan Sheikh', department: 'Cardiology', status: 'in_progress', time: '09:45 AM', type: 'Walk-in' },
  { token: 'T-005', patient: 'Bilal Hussain', mr: 'MR-10238', phone: '0321-5551234', gender: 'Male', bloodGroup: 'B-', dob: '1988-06-30', address: 'Model Town, Lahore', doctor: 'Dr. Nadia Qureshi', department: 'General Medicine', status: 'waiting', time: '10:00 AM', type: 'Walk-in' },
  { token: 'T-006', patient: 'Zainab Akhtar', mr: 'MR-10239', phone: '0300-6782345', gender: 'Female', bloodGroup: 'O-', dob: '2001-09-14', address: 'Satellite Town, Sargodha', doctor: 'Dr. Imran Aslam', department: 'ENT', status: 'waiting', time: '10:15 AM', type: 'Scheduled' },
  { token: 'T-007', patient: 'Hassan Ali', mr: 'MR-10240', phone: '0333-9014567', gender: 'Male', bloodGroup: 'A-', dob: '1970-12-05', address: 'Officers Colony, Multan', doctor: 'Dr. Sana Malik', department: 'Gynecology', status: 'waiting', time: '10:30 AM', type: 'Scheduled' },
  { token: 'T-008', patient: 'Rabia Kanwal', mr: 'MR-10241', phone: '0312-2345678', gender: 'Female', bloodGroup: 'AB-', dob: '1998-04-22', address: 'Al-Noor Plaza, Faisalabad', doctor: 'Dr. Asif Javed', department: 'Orthopedics', status: 'cancelled', time: '10:45 AM', type: 'Scheduled' },
  { token: 'T-009', patient: 'Naveed Iqbal', mr: 'MR-10242', phone: '0345-1237890', gender: 'Male', bloodGroup: 'O+', dob: '1982-08-19', address: 'Cantt Area, Lahore', doctor: 'Dr. Nadia Qureshi', department: 'General Medicine', status: 'waiting', time: '10:45 AM', type: 'Walk-in' },
  { token: 'T-010', patient: 'Sadia Parveen', mr: 'MR-10243', phone: '0300-4561234', gender: 'Female', bloodGroup: 'A+', dob: '1990-02-14', address: 'Iqbal Town, Lahore', doctor: 'Dr. Anam Zahra', department: 'Dermatology', status: 'waiting', time: '11:00 AM', type: 'Scheduled' },
];

const doctorOptions = [
  { value: '', label: 'All Doctors' },
  { value: 'Dr. Farhan Sheikh', label: 'Dr. Farhan Sheikh' },
  { value: 'Dr. Sana Malik', label: 'Dr. Sana Malik' },
  { value: 'Dr. Asif Javed', label: 'Dr. Asif Javed' },
  { value: 'Dr. Nadia Qureshi', label: 'Dr. Nadia Qureshi' },
  { value: 'Dr. Imran Aslam', label: 'Dr. Imran Aslam' },
  { value: 'Dr. Anam Zahra', label: 'Dr. Anam Zahra' },
];

const departmentOptions = [
  { value: '', label: 'All Departments' },
  { value: 'Cardiology', label: 'Cardiology' },
  { value: 'Gynecology', label: 'Gynecology' },
  { value: 'Orthopedics', label: 'Orthopedics' },
  { value: 'General Medicine', label: 'General Medicine' },
  { value: 'ENT', label: 'ENT' },
  { value: 'Dermatology', label: 'Dermatology' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function Appointments() {
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const filtered = useMemo(() => {
    return demoAppointments.filter((a) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        a.patient.toLowerCase().includes(q) ||
        a.mr.toLowerCase().includes(q) ||
        a.token.toLowerCase().includes(q);
      const matchesDoctor = !doctorFilter || a.doctor === doctorFilter;
      const matchesDept = !deptFilter || a.department === deptFilter;
      const matchesStatus = !statusFilter || a.status === statusFilter;
      return matchesSearch && matchesDoctor && matchesDept && matchesStatus;
    });
  }, [search, doctorFilter, deptFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Today's Appointments
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {filtered.length} appointments &middot;{' '}
            {filtered.filter((a) => a.status === 'waiting').length} waiting
          </p>
        </div>
        <Badge variant="info" dot className="text-sm">
          {new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </Badge>
      </div>

      {/* Filter bar */}
      <Card hover={false} className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search patient, MR#, token..."
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            options={doctorOptions}
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
          />
          <Select
            options={departmentOptions}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </Card>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Token #</TableHead>
            <TableHead>Patient Name</TableHead>
            <TableHead>MR #</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="stagger-children">
          {filtered.map((a) => (
            <TableRow key={a.token}>
              <TableCell className="font-mono font-semibold text-[var(--primary)]">
                {a.token}
              </TableCell>
              <TableCell>
                <button
                  className="font-medium text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors underline-offset-2 hover:underline"
                  onClick={() => setSelectedAppt(a)}
                >
                  {a.patient}
                </button>
              </TableCell>
              <TableCell className="text-[var(--text-secondary)] font-mono text-xs">
                {a.mr}
              </TableCell>
              <TableCell>{a.doctor}</TableCell>
              <TableCell className="text-[var(--text-secondary)] text-xs">
                {a.department}
              </TableCell>
              <TableCell>
                <StatusBadge status={a.status} />
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                  <Clock className="w-3 h-3" />
                  {a.time}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={a.type === 'Walk-in' ? 'accent' : 'default'}>
                  {a.type}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-[var(--text-tertiary)]">
                No appointments match the selected filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Patient profile modal */}
      <Modal
        open={!!selectedAppt}
        onClose={() => setSelectedAppt(null)}
        title="Patient Profile"
        description={selectedAppt ? `${selectedAppt.mr} — ${selectedAppt.token}` : ''}
        size="lg"
      >
        {selectedAppt && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                <User className="w-7 h-7 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {selectedAppt.patient}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {selectedAppt.gender} &middot; DOB: {selectedAppt.dob}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="info">{selectedAppt.bloodGroup}</Badge>
                <StatusBadge status={selectedAppt.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DetailRow icon={<Phone className="w-4 h-4" />} label="Phone" value={selectedAppt.phone} />
              <DetailRow icon={<MapPin className="w-4 h-4" />} label="Address" value={selectedAppt.address} />
              <DetailRow icon={<Droplets className="w-4 h-4" />} label="Blood Group" value={selectedAppt.bloodGroup} />
              <DetailRow icon={<Calendar className="w-4 h-4" />} label="Appointment" value={`${selectedAppt.time} — ${selectedAppt.type}`} />
            </div>

            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                Visit Details
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[var(--text-tertiary)]">Doctor:</span>{' '}
                  <span className="text-[var(--text-primary)] font-medium">{selectedAppt.doctor}</span>
                </div>
                <div>
                  <span className="text-[var(--text-tertiary)]">Department:</span>{' '}
                  <span className="text-[var(--text-primary)] font-medium">{selectedAppt.department}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-[var(--radius-sm)] bg-[var(--surface)]">
      <div className="text-[var(--text-tertiary)] mt-0.5">{icon}</div>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">{label}</p>
        <p className="text-sm text-[var(--text-primary)] mt-0.5">{value}</p>
      </div>
    </div>
  );
}
