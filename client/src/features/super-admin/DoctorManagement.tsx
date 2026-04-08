import { useState } from 'react';
import {
  Stethoscope, Users, Building2, TrendingUp, Plus, Calendar,
  Edit2, Clock, CheckCircle, X,
} from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';

type DoctorStatus = 'active' | 'on_leave' | 'unavailable';

interface DoctorScheduleDay {
  day: string;
  hours: string;
  slots: number;
}

interface RecentPatient {
  name: string;
  mrNumber: string;
  complaint: string;
  time: string;
}

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  status: DoctorStatus;
  patientsToday: number;
  totalAssigned: number;
  avgRating: number;
  totalPatients: number;
  schedule: DoctorScheduleDay[];
  recentPatients: RecentPatient[];
  experience: string;
}

const demoDoctors: Doctor[] = [
  {
    id: '1', name: 'Dr. Tariq Ahmed', email: 'dr.tariq@strydehealth.com', phone: '0300-1112233',
    specialization: 'Interventional Cardiologist', department: 'Cardiology', status: 'active',
    patientsToday: 12, totalAssigned: 15, avgRating: 4.8, totalPatients: 1420, experience: '18 years',
    schedule: [
      { day: 'Mon', hours: '9:00 AM - 2:00 PM', slots: 15 },
      { day: 'Tue', hours: '9:00 AM - 2:00 PM', slots: 15 },
      { day: 'Wed', hours: '9:00 AM - 12:00 PM', slots: 10 },
      { day: 'Thu', hours: '9:00 AM - 2:00 PM', slots: 15 },
      { day: 'Fri', hours: '9:00 AM - 1:00 PM', slots: 12 },
      { day: 'Sat', hours: '10:00 AM - 1:00 PM', slots: 8 },
    ],
    recentPatients: [
      { name: 'Ahmad Khan', mrNumber: 'MR-2026-00001', complaint: 'Chest pain', time: '09:00 AM' },
      { name: 'Muhammad Usman', mrNumber: 'MR-2026-00003', complaint: 'HTN follow-up', time: '09:30 AM' },
      { name: 'Tariq Mehmood', mrNumber: 'MR-2026-00009', complaint: 'Diabetic neuropathy', time: '11:00 AM' },
    ],
  },
  {
    id: '2', name: 'Dr. Saira Khan', email: 'dr.saira@strydehealth.com', phone: '0321-2223344',
    specialization: 'General Physician', department: 'General Medicine', status: 'active',
    patientsToday: 18, totalAssigned: 22, avgRating: 4.9, totalPatients: 2150, experience: '12 years',
    schedule: [
      { day: 'Mon', hours: '9:00 AM - 3:00 PM', slots: 20 },
      { day: 'Tue', hours: '9:00 AM - 3:00 PM', slots: 20 },
      { day: 'Wed', hours: '9:00 AM - 3:00 PM', slots: 20 },
      { day: 'Thu', hours: '9:00 AM - 3:00 PM', slots: 20 },
      { day: 'Fri', hours: '9:00 AM - 1:00 PM', slots: 12 },
      { day: 'Sat', hours: '10:00 AM - 2:00 PM', slots: 12 },
    ],
    recentPatients: [
      { name: 'Fatima Bibi', mrNumber: 'MR-2026-00002', complaint: 'Fever', time: '09:15 AM' },
      { name: 'Saima Noor', mrNumber: 'MR-2026-00004', complaint: 'Asthma', time: '09:45 AM' },
      { name: 'Zainab Akhtar', mrNumber: 'MR-2026-00008', complaint: 'Anemia follow-up', time: '10:45 AM' },
    ],
  },
  {
    id: '3', name: 'Dr. Imran Malik', email: 'dr.imran@strydehealth.com', phone: '0333-3334455',
    specialization: 'Orthopedic Surgeon', department: 'Orthopedics', status: 'active',
    patientsToday: 8, totalAssigned: 12, avgRating: 4.7, totalPatients: 980, experience: '15 years',
    schedule: [
      { day: 'Mon', hours: '10:00 AM - 2:00 PM', slots: 12 },
      { day: 'Tue', hours: '10:00 AM - 2:00 PM', slots: 12 },
      { day: 'Wed', hours: 'Surgery Day', slots: 0 },
      { day: 'Thu', hours: '10:00 AM - 2:00 PM', slots: 12 },
      { day: 'Fri', hours: '10:00 AM - 1:00 PM', slots: 8 },
      { day: 'Sat', hours: 'Off', slots: 0 },
    ],
    recentPatients: [
      { name: 'Hassan Mahmood', mrNumber: 'MR-2026-00005', complaint: 'Knee pain', time: '10:00 AM' },
      { name: 'Imran Hussain', mrNumber: 'MR-2026-00011', complaint: 'Gout flare', time: '11:30 AM' },
    ],
  },
  {
    id: '4', name: 'Dr. Amna Rashid', email: 'dr.amna@strydehealth.com', phone: '0345-4445566',
    specialization: 'Gynecologist & Obstetrician', department: 'Gynecology', status: 'on_leave',
    patientsToday: 0, totalAssigned: 0, avgRating: 4.9, totalPatients: 1780, experience: '14 years',
    schedule: [
      { day: 'Mon', hours: '9:00 AM - 2:00 PM', slots: 14 },
      { day: 'Tue', hours: '9:00 AM - 2:00 PM', slots: 14 },
      { day: 'Wed', hours: '9:00 AM - 2:00 PM', slots: 14 },
      { day: 'Thu', hours: '9:00 AM - 12:00 PM', slots: 8 },
      { day: 'Fri', hours: '9:00 AM - 1:00 PM', slots: 10 },
      { day: 'Sat', hours: 'Off', slots: 0 },
    ],
    recentPatients: [
      { name: 'Ayesha Siddiqui', mrNumber: 'MR-2026-00006', complaint: 'Thyroid follow-up', time: '10:15 AM' },
    ],
  },
  {
    id: '5', name: 'Dr. Faisal Iqbal', email: 'dr.faisal@strydehealth.com', phone: '0312-5556677',
    specialization: 'ENT Specialist', department: 'ENT', status: 'active',
    patientsToday: 6, totalAssigned: 10, avgRating: 4.6, totalPatients: 870, experience: '10 years',
    schedule: [
      { day: 'Mon', hours: '10:00 AM - 2:00 PM', slots: 10 },
      { day: 'Tue', hours: '10:00 AM - 2:00 PM', slots: 10 },
      { day: 'Wed', hours: '10:00 AM - 2:00 PM', slots: 10 },
      { day: 'Thu', hours: 'Surgery Day', slots: 0 },
      { day: 'Fri', hours: '10:00 AM - 1:00 PM', slots: 8 },
      { day: 'Sat', hours: '10:00 AM - 12:00 PM', slots: 6 },
    ],
    recentPatients: [
      { name: 'Bilal Shah', mrNumber: 'MR-2026-00007', complaint: 'Ear pain', time: '10:30 AM' },
      { name: 'Farhan Raza', mrNumber: 'MR-2026-00013', complaint: 'Sore throat', time: '12:00 PM' },
    ],
  },
  {
    id: '6', name: 'Dr. Nadia Zafar', email: 'dr.nadia@strydehealth.com', phone: '0300-6667788',
    specialization: 'Dermatologist', department: 'Dermatology', status: 'unavailable',
    patientsToday: 0, totalAssigned: 0, avgRating: 4.8, totalPatients: 620, experience: '8 years',
    schedule: [
      { day: 'Mon', hours: '11:00 AM - 3:00 PM', slots: 12 },
      { day: 'Tue', hours: '11:00 AM - 3:00 PM', slots: 12 },
      { day: 'Wed', hours: 'Off', slots: 0 },
      { day: 'Thu', hours: '11:00 AM - 3:00 PM', slots: 12 },
      { day: 'Fri', hours: '11:00 AM - 2:00 PM', slots: 8 },
      { day: 'Sat', hours: '11:00 AM - 1:00 PM', slots: 6 },
    ],
    recentPatients: [
      { name: 'Rabia Aslam', mrNumber: 'MR-2026-00010', complaint: 'Skin rash', time: '11:15 AM' },
    ],
  },
];

const statusConfig: Record<DoctorStatus, { variant: 'success' | 'warning' | 'cancelled'; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  on_leave: { variant: 'warning', label: 'On Leave' },
  unavailable: { variant: 'cancelled', label: 'Unavailable' },
};

const DEPARTMENT_OPTIONS = [
  { value: 'Cardiology', label: 'Cardiology' },
  { value: 'General Medicine', label: 'General Medicine' },
  { value: 'Orthopedics', label: 'Orthopedics' },
  { value: 'Gynecology', label: 'Gynecology' },
  { value: 'ENT', label: 'ENT' },
  { value: 'Dermatology', label: 'Dermatology' },
];

export function DoctorManagement() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const totalDoctors = demoDoctors.length;
  const activeToday = demoDoctors.filter((d) => d.status === 'active').length;
  const departments = new Set(demoDoctors.map((d) => d.department)).size;
  const avgPatientsPerDay = Math.round(
    demoDoctors.filter((d) => d.status === 'active').reduce((sum, d) => sum + d.patientsToday, 0) / activeToday
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Doctor Management</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage doctors, schedules, and performance</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Add Doctor
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <MetricCard title="Total Doctors" value={totalDoctors} icon={Stethoscope} subtitle="Registered physicians" />
        <MetricCard title="Active Today" value={activeToday} icon={Users} trend={{ value: 5, positive: true }} iconColor="bg-emerald-500/10 text-emerald-500" />
        <MetricCard title="Departments" value={departments} icon={Building2} subtitle="Across specializations" iconColor="bg-purple-500/10 text-purple-500" />
        <MetricCard title="Avg Patients/Day" value={avgPatientsPerDay} icon={TrendingUp} trend={{ value: 3, positive: true }} iconColor="bg-blue-500/10 text-blue-500" />
      </div>

      {/* Doctor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {demoDoctors.map((doctor) => (
          <Card
            key={doctor.id}
            hover
            className="p-5 cursor-pointer"
            onClick={() => setSelectedDoctor(doctor)}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-lg font-bold shrink-0">
                {doctor.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{doctor.name}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{doctor.specialization}</p>
                <p className="text-xs text-[var(--primary)] font-medium mt-0.5">{doctor.department}</p>
              </div>
              <Badge variant={statusConfig[doctor.status].variant} dot>
                {statusConfig[doctor.status].label}
              </Badge>
            </div>

            {/* Today's Stats */}
            <div className="mt-4 p-3 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">Today's Progress</span>
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  {doctor.patientsToday} / {doctor.totalAssigned}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--surface-border)] mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-500"
                  style={{ width: `${doctor.totalAssigned > 0 ? (doctor.patientsToday / doctor.totalAssigned) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedDoctor(doctor); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[var(--primary)] rounded-[var(--radius-sm)] bg-[var(--primary-light)] hover:bg-[var(--primary)] hover:text-white transition-all duration-200"
              >
                <Calendar className="w-3.5 h-3.5" /> View Schedule
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toast.info(`Edit profile for ${doctor.name}`); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[var(--text-secondary)] rounded-[var(--radius-sm)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] transition-all duration-200"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Doctor Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Doctor" size="md">
        <div className="space-y-4">
          <Input label="Full Name" placeholder="Dr. Full Name" />
          <Input label="Email" type="email" placeholder="doctor@strydehealth.com" />
          <Input label="Phone" placeholder="0300-XXXXXXX" />
          <Input label="Specialization" placeholder="e.g. Cardiologist" />
          <Select label="Department" options={DEPARTMENT_OPTIONS} placeholder="Select department" />
          <Input label="Password" type="password" placeholder="Minimum 8 characters" />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button onClick={() => { setShowAddModal(false); toast.success('Doctor added successfully'); }}>
            <Plus className="w-4 h-4" /> Add Doctor
          </Button>
        </div>
      </Modal>

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <Modal open={true} onClose={() => setSelectedDoctor(null)} title={selectedDoctor.name} size="lg">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xl font-bold">
                {selectedDoctor.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{selectedDoctor.name}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{selectedDoctor.specialization}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={statusConfig[selectedDoctor.status].variant} dot>
                    {statusConfig[selectedDoctor.status].label}
                  </Badge>
                  <span className="text-xs text-[var(--text-tertiary)]">{selectedDoctor.department}</span>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Patients', value: selectedDoctor.totalPatients.toLocaleString() },
                { label: 'Avg Rating', value: `${selectedDoctor.avgRating} / 5` },
                { label: 'Experience', value: selectedDoctor.experience },
                { label: 'Today', value: `${selectedDoctor.patientsToday} / ${selectedDoctor.totalAssigned}` },
              ].map((stat) => (
                <div key={stat.label} className="p-3 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)] text-center">
                  <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg font-bold text-[var(--text-primary)] mt-1">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Weekly Schedule */}
            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1 mb-3">
                <Clock className="w-3 h-3" /> Weekly Schedule
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedDoctor.schedule.map((day) => (
                  <div key={day.day} className="p-2.5 rounded-[var(--radius-xs)] border border-[var(--surface-border)] bg-[var(--surface)]">
                    <p className="text-xs font-bold text-[var(--text-primary)]">{day.day}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{day.hours}</p>
                    {day.slots > 0 && (
                      <p className="text-[11px] text-[var(--primary)] font-medium mt-0.5">{day.slots} slots</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Patients */}
            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1 mb-3">
                <CheckCircle className="w-3 h-3" /> Recent Patients
              </p>
              <div className="space-y-2">
                {selectedDoctor.recentPatients.map((patient) => (
                  <div key={patient.mrNumber} className="flex items-center gap-3 p-2.5 rounded-[var(--radius-xs)] hover:bg-[var(--surface-hover)] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xs font-semibold">
                      {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{patient.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{patient.mrNumber} — {patient.complaint}</p>
                    </div>
                    <span className="text-xs text-[var(--text-secondary)]">{patient.time}</span>
                  </div>
                ))}
                {selectedDoctor.recentPatients.length === 0 && (
                  <p className="text-sm text-[var(--text-tertiary)]">No recent patients</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setSelectedDoctor(null)}>Close</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
