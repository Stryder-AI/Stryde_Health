import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, User,
  Stethoscope, Calendar, CheckCircle2, XCircle, RotateCcw,
  AlertTriangle, Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';
export type AppointmentType = 'new_patient' | 'follow_up' | 'emergency';

export interface CalendarAppointment {
  id: string;
  patientName: string;
  mrNumber: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM 24h
  durationMinutes: number;
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  phone?: string;
}

type ViewMode = 'month' | 'week' | 'day';

// ─── Doctor Color Map ─────────────────────────────────────────────────────────

interface DoctorColor {
  bg: string;
  border: string;
  text: string;
  dot: string;
}

const doctorColors: Record<string, DoctorColor> = {
  dr_tariq: {
    bg: 'rgba(13,148,136,0.12)',
    border: '#0D9488',
    text: '#0f766e',
    dot: 'bg-teal-500',
  },
  dr_saira: {
    bg: 'rgba(139,92,246,0.12)',
    border: '#8B5CF6',
    text: '#7c3aed',
    dot: 'bg-violet-500',
  },
  dr_imran: {
    bg: 'rgba(59,130,246,0.12)',
    border: '#3B82F6',
    text: '#2563eb',
    dot: 'bg-blue-500',
  },
  dr_farhan: {
    bg: 'rgba(245,158,11,0.12)',
    border: '#F59E0B',
    text: '#d97706',
    dot: 'bg-amber-500',
  },
  dr_hina: {
    bg: 'rgba(244,63,94,0.12)',
    border: '#F43F5E',
    text: '#e11d48',
    dot: 'bg-rose-500',
  },
};

function getDoctorColor(doctorId: string): DoctorColor {
  return doctorColors[doctorId] ?? {
    bg: 'rgba(100,116,139,0.12)',
    border: '#64748B',
    text: '#475569',
    dot: 'bg-slate-500',
  };
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function statusVariant(s: AppointmentStatus): 'success' | 'warning' | 'cancelled' | 'info' {
  if (s === 'confirmed') return 'success';
  if (s === 'pending') return 'warning';
  if (s === 'cancelled') return 'cancelled';
  return 'info';
}

function statusLabel(s: AppointmentStatus) {
  const m: Record<AppointmentStatus, string> = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    completed: 'Completed',
  };
  return m[s];
}

function typeLabel(t: AppointmentType) {
  const m: Record<AppointmentType, string> = {
    new_patient: 'New Patient',
    follow_up: 'Follow-up',
    emergency: 'Emergency',
  };
  return m[t];
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getWeekStart(d: Date): Date {
  const date = new Date(d);
  const dow = date.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ─── Demo Data Generation ─────────────────────────────────────────────────────

function generateDemoData(): CalendarAppointment[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function d(offsetDays: number): string {
    return formatDateKey(addDays(today, offsetDays));
  }

  return [
    // Today
    { id: 'a1', patientName: 'Ahmad Khan', mrNumber: 'MR-2026-00001', doctorId: 'dr_tariq', doctorName: 'Dr. Tariq Ahmed', department: 'Cardiology', date: d(0), startTime: '09:00', durationMinutes: 30, status: 'confirmed', type: 'follow_up', phone: '0300-1234567', notes: 'Follow-up for hypertension. Check BP logs.' },
    { id: 'a2', patientName: 'Fatima Bibi', mrNumber: 'MR-2026-00002', doctorId: 'dr_saira', doctorName: 'Dr. Saira Khan', department: 'General Medicine', date: d(0), startTime: '09:30', durationMinutes: 20, status: 'completed', type: 'new_patient', phone: '0321-2345678', notes: 'Fever and body aches.' },
    { id: 'a3', patientName: 'Rashid Mehmood', mrNumber: 'MR-2026-00003', doctorId: 'dr_tariq', doctorName: 'Dr. Tariq Ahmed', department: 'Cardiology', date: d(0), startTime: '10:00', durationMinutes: 45, status: 'confirmed', type: 'emergency', phone: '0333-5678901', notes: 'Chest pain since morning.' },
    { id: 'a4', patientName: 'Sadia Parveen', mrNumber: 'MR-2026-00004', doctorId: 'dr_imran', doctorName: 'Dr. Imran Malik', department: 'Orthopedics', date: d(0), startTime: '11:00', durationMinutes: 30, status: 'pending', type: 'new_patient', phone: '0312-4567890', notes: 'Knee pain bilateral.' },
    { id: 'a5', patientName: 'Zainab Fatima', mrNumber: 'MR-2026-00005', doctorId: 'dr_hina', doctorName: 'Dr. Hina Rauf', department: 'Cardiology', date: d(0), startTime: '14:00', durationMinutes: 30, status: 'confirmed', type: 'follow_up', phone: '0345-6789012', notes: 'Valvular disease follow-up.' },
    // Tomorrow
    { id: 'a6', patientName: 'Hassan Raza', mrNumber: 'MR-2026-00006', doctorId: 'dr_saira', doctorName: 'Dr. Saira Khan', department: 'General Medicine', date: d(1), startTime: '09:00', durationMinutes: 20, status: 'confirmed', type: 'follow_up', phone: '0300-7890123', notes: 'Iron deficiency follow-up.' },
    { id: 'a7', patientName: 'Amna Bibi', mrNumber: 'MR-2026-00007', doctorId: 'dr_farhan', doctorName: 'Dr. Farhan Sheikh', department: 'Cardiology', date: d(1), startTime: '10:30', durationMinutes: 30, status: 'pending', type: 'new_patient', phone: '0321-8901234', notes: 'Palpitations.' },
    { id: 'a8', patientName: 'Tariq Hussain', mrNumber: 'MR-2026-00008', doctorId: 'dr_imran', doctorName: 'Dr. Imran Malik', department: 'Orthopedics', date: d(1), startTime: '11:00', durationMinutes: 45, status: 'confirmed', type: 'follow_up', phone: '0333-0123456', notes: 'Post-surgery review.' },
    { id: 'a9', patientName: 'Nasreen Bano', mrNumber: 'MR-2026-00009', doctorId: 'dr_tariq', doctorName: 'Dr. Tariq Ahmed', department: 'Cardiology', date: d(1), startTime: '15:00', durationMinutes: 30, status: 'confirmed', type: 'follow_up', phone: '0312-1234567', notes: 'Cardiac + CKD management.' },
    // Day after tomorrow
    { id: 'a10', patientName: 'Khalid Mahmood', mrNumber: 'MR-2026-00010', doctorId: 'dr_saira', doctorName: 'Dr. Saira Khan', department: 'General Medicine', date: d(2), startTime: '09:30', durationMinutes: 20, status: 'pending', type: 'new_patient', phone: '0345-2345678', notes: 'Asthma exacerbation.' },
    { id: 'a11', patientName: 'Rubina Shah', mrNumber: 'MR-2026-00011', doctorId: 'dr_hina', doctorName: 'Dr. Hina Rauf', department: 'Cardiology', date: d(2), startTime: '10:00', durationMinutes: 30, status: 'confirmed', type: 'follow_up', phone: '0300-3456789', notes: 'Anxiety and palpitations review.' },
    { id: 'a12', patientName: 'Waqar Ahmed', mrNumber: 'MR-2026-00012', doctorId: 'dr_tariq', doctorName: 'Dr. Tariq Ahmed', department: 'Cardiology', date: d(2), startTime: '11:30', durationMinutes: 45, status: 'confirmed', type: 'emergency', phone: '0321-4567890', notes: 'Arrhythmia evaluation.' },
    { id: 'a13', patientName: 'Samina Akhtar', mrNumber: 'MR-2026-00013', doctorId: 'dr_farhan', doctorName: 'Dr. Farhan Sheikh', department: 'Cardiology', date: d(2), startTime: '14:30', durationMinutes: 30, status: 'cancelled', type: 'follow_up', phone: '0333-5678901', notes: 'Patient cancelled.' },
    // Earlier this week
    { id: 'a14', patientName: 'Bushra Nawaz', mrNumber: 'MR-2026-00014', doctorId: 'dr_imran', doctorName: 'Dr. Imran Malik', department: 'Orthopedics', date: d(-1), startTime: '09:00', durationMinutes: 30, status: 'completed', type: 'follow_up', phone: '0312-6789012', notes: 'HTN + DM management.' },
    { id: 'a15', patientName: 'Faisal Iqbal', mrNumber: 'MR-2026-00015', doctorId: 'dr_saira', doctorName: 'Dr. Saira Khan', department: 'General Medicine', date: d(-1), startTime: '10:00', durationMinutes: 20, status: 'completed', type: 'follow_up', phone: '0345-7890123', notes: 'Routine checkup.' },
    { id: 'a16', patientName: 'Nazia Begum', mrNumber: 'MR-2026-00016', doctorId: 'dr_tariq', doctorName: 'Dr. Tariq Ahmed', department: 'Cardiology', date: d(-2), startTime: '09:30', durationMinutes: 30, status: 'completed', type: 'follow_up', phone: '0300-8901234', notes: 'Hypertension management.' },
    { id: 'a17', patientName: 'Imran Saeed', mrNumber: 'MR-2026-00017', doctorId: 'dr_hina', doctorName: 'Dr. Hina Rauf', department: 'Cardiology', date: d(-2), startTime: '11:00', durationMinutes: 45, status: 'completed', type: 'emergency', phone: '0321-9012345', notes: 'Cardiac + COPD.' },
    { id: 'a18', patientName: 'Aslam Pervez', mrNumber: 'MR-2026-00018', doctorId: 'dr_farhan', doctorName: 'Dr. Farhan Sheikh', department: 'Cardiology', date: d(3), startTime: '09:00', durationMinutes: 30, status: 'confirmed', type: 'follow_up', phone: '0333-0123457', notes: 'CHF NYHA II.' },
    { id: 'a19', patientName: 'Fahad Ali', mrNumber: 'MR-2026-00019', doctorId: 'dr_imran', doctorName: 'Dr. Imran Malik', department: 'Orthopedics', date: d(3), startTime: '10:30', durationMinutes: 30, status: 'pending', type: 'new_patient', phone: '0312-1234568', notes: 'Back pain evaluation.' },
    { id: 'a20', patientName: 'Rabia Aslam', mrNumber: 'MR-2026-00020', doctorId: 'dr_saira', doctorName: 'Dr. Saira Khan', department: 'General Medicine', date: d(4), startTime: '09:00', durationMinutes: 20, status: 'confirmed', type: 'follow_up', phone: '0345-2345679', notes: 'PCOS follow-up.' },
    { id: 'a21', patientName: 'Bilal Shah', mrNumber: 'MR-2026-00021', doctorId: 'dr_tariq', doctorName: 'Dr. Tariq Ahmed', department: 'Cardiology', date: d(4), startTime: '11:00', durationMinutes: 30, status: 'confirmed', type: 'follow_up', phone: '0300-3456790', notes: 'IHD follow-up.' },
    { id: 'a22', patientName: 'Ayesha Siddiqui', mrNumber: 'MR-2026-00022', doctorId: 'dr_hina', doctorName: 'Dr. Hina Rauf', department: 'Cardiology', date: d(5), startTime: '10:00', durationMinutes: 30, status: 'pending', type: 'new_patient', phone: '0321-4567891', notes: 'Chest tightness.' },
  ];
}

const DEMO_APPOINTMENTS = generateDemoData();

// ─── Time slots ───────────────────────────────────────────────────────────────

const HOUR_START = 8;
const HOUR_END = 20;
const SLOT_HEIGHT = 48; // px per hour

const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Appointment Detail Modal ─────────────────────────────────────────────────

interface DetailModalProps {
  appointment: CalendarAppointment;
  onClose: () => void;
  onUpdate: (id: string, update: Partial<CalendarAppointment>) => void;
}

function AppointmentDetailModal({ appointment, onClose, onUpdate }: DetailModalProps) {
  const [action, setAction] = useState<'view' | 'reschedule' | 'cancel'>('view');
  const [cancelReason, setCancelReason] = useState('');
  const [newDate, setNewDate] = useState(appointment.date);
  const [newTime, setNewTime] = useState(appointment.startTime);

  const dc = getDoctorColor(appointment.doctorId);

  const handleConfirm = () => {
    onUpdate(appointment.id, { status: 'confirmed' });
    toast.success(`Appointment confirmed for ${appointment.patientName}`, 'Confirmed');
    onClose();
  };

  const handleComplete = () => {
    onUpdate(appointment.id, { status: 'completed' });
    toast.success(`Consultation marked as complete`, 'Completed');
    onClose();
  };

  const handleCancel = () => {
    if (!cancelReason.trim()) {
      toast.error('Please enter a cancellation reason.', 'Required');
      return;
    }
    onUpdate(appointment.id, { status: 'cancelled' });
    toast.info(`Appointment cancelled: ${cancelReason}`, 'Cancelled');
    onClose();
  };

  const handleReschedule = () => {
    onUpdate(appointment.id, { date: newDate, startTime: newTime });
    toast.success(`Rescheduled to ${newDate} at ${formatTime12(newTime)}`, 'Rescheduled');
    onClose();
  };

  const availableSlots: string[] = [];
  for (let h = HOUR_START; h < HOUR_END; h++) {
    availableSlots.push(`${String(h).padStart(2, '0')}:00`);
    availableSlots.push(`${String(h).padStart(2, '0')}:30`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-md" />
      <div
        className="relative glass-elevated w-full max-w-md animate-fade-in-scale"
        style={{ borderRadius: 'var(--radius-md)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-5 border-b border-[var(--surface-border)]"
          style={{ borderLeft: `4px solid ${dc.border}`, borderRadius: 'var(--radius-md) var(--radius-md) 0 0' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: `linear-gradient(135deg, ${dc.border}, ${dc.border}aa)` }}
            >
              {appointment.patientName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">{appointment.patientName}</h3>
              <p className="text-xs text-[var(--text-tertiary)]">{appointment.mrNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors text-[var(--text-tertiary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card-static p-3 rounded-[var(--radius-sm)]">
              <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Type</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{typeLabel(appointment.type)}</p>
            </div>
            <div className="glass-card-static p-3 rounded-[var(--radius-sm)]">
              <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Status</p>
              <Badge variant={statusVariant(appointment.status)} dot className="text-[10px]">
                {statusLabel(appointment.status)}
              </Badge>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
              <Stethoscope className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
              <span>{appointment.doctorName} &middot; {appointment.department}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
              <Clock className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
              <span>{appointment.date} &middot; {formatTime12(appointment.startTime)} &middot; {appointment.durationMinutes} min</span>
            </div>
            {appointment.phone && (
              <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                <User className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
                <span>{appointment.phone}</span>
              </div>
            )}
            {appointment.notes && (
              <div className="glass-card-static p-3 rounded-[var(--radius-sm)]">
                <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase mb-1">Notes</p>
                <p className="text-sm text-[var(--text-secondary)]">{appointment.notes}</p>
              </div>
            )}
          </div>

          {/* Reschedule form */}
          {action === 'reschedule' && (
            <div className="space-y-3 pt-2 border-t border-[var(--surface-border)]">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Reschedule Appointment</p>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={formatDateKey(new Date())}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              />
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              >
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>{formatTime12(slot)}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" onClick={handleReschedule} className="flex-1">Confirm Reschedule</Button>
                <Button size="sm" variant="ghost" onClick={() => setAction('view')}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Cancel form */}
          {action === 'cancel' && (
            <div className="space-y-3 pt-2 border-t border-[var(--surface-border)]">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Cancellation Reason</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                rows={3}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="danger" onClick={handleCancel} className="flex-1">Cancel Appointment</Button>
                <Button size="sm" variant="ghost" onClick={() => setAction('view')}>Go Back</Button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {action === 'view' && (
          <div className="p-5 pt-0 flex flex-wrap gap-2">
            {appointment.status === 'pending' && (
              <Button size="sm" variant="primary" onClick={handleConfirm} className="flex-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirm
              </Button>
            )}
            {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
              <Button size="sm" variant="primary" onClick={handleComplete} className="flex-1" style={{ background: 'var(--success)' }}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Complete
              </Button>
            )}
            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
              <Button size="sm" variant="ghost" onClick={() => setAction('reschedule')}>
                <RotateCcw className="w-3.5 h-3.5" />
                Reschedule
              </Button>
            )}
            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
              <Button size="sm" variant="danger" onClick={() => setAction('cancel')}>
                <XCircle className="w-3.5 h-3.5" />
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── New Appointment Modal ─────────────────────────────────────────────────────

interface NewApptModalProps {
  defaultDate?: string;
  onClose: () => void;
  onAdd: (appt: CalendarAppointment) => void;
}

const DOCTORS = [
  { value: 'dr_tariq', label: 'Dr. Tariq Ahmed (Cardiology)' },
  { value: 'dr_saira', label: 'Dr. Saira Khan (General Medicine)' },
  { value: 'dr_imran', label: 'Dr. Imran Malik (Orthopedics)' },
  { value: 'dr_farhan', label: 'Dr. Farhan Sheikh (Cardiology)' },
  { value: 'dr_hina', label: 'Dr. Hina Rauf (Cardiology)' },
];

const DOCTOR_DEPT: Record<string, string> = {
  dr_tariq: 'Cardiology',
  dr_saira: 'General Medicine',
  dr_imran: 'Orthopedics',
  dr_farhan: 'Cardiology',
  dr_hina: 'Cardiology',
};

const DOCTOR_NAMES: Record<string, string> = {
  dr_tariq: 'Dr. Tariq Ahmed',
  dr_saira: 'Dr. Saira Khan',
  dr_imran: 'Dr. Imran Malik',
  dr_farhan: 'Dr. Farhan Sheikh',
  dr_hina: 'Dr. Hina Rauf',
};

function NewAppointmentModal({ defaultDate, onClose, onAdd }: NewApptModalProps) {
  const [patientName, setPatientName] = useState('');
  const [mrNumber, setMrNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [doctorId, setDoctorId] = useState('dr_tariq');
  const [date, setDate] = useState(defaultDate ?? formatDateKey(new Date()));
  const [timeSlot, setTimeSlot] = useState('09:00');
  const [duration, setDuration] = useState('30');
  const [type, setType] = useState<AppointmentType>('new_patient');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const availableSlots: string[] = [];
  for (let h = HOUR_START; h < HOUR_END; h++) {
    availableSlots.push(`${String(h).padStart(2, '0')}:00`);
    availableSlots.push(`${String(h).padStart(2, '0')}:30`);
  }

  const handleSubmit = () => {
    if (!patientName.trim()) { toast.error('Patient name is required.', 'Validation'); return; }
    if (!mrNumber.trim()) { toast.error('MR Number is required.', 'Validation'); return; }

    setBookingLoading(true);
    setTimeout(() => {
      setBookingLoading(false);
      doBook();
    }, 700);
  };

  const doBook = () => {
    const newAppt: CalendarAppointment = {
      id: `new-${Date.now()}`,
      patientName: patientName.trim(),
      mrNumber: mrNumber.trim(),
      doctorId,
      doctorName: DOCTOR_NAMES[doctorId],
      department: DOCTOR_DEPT[doctorId],
      date,
      startTime: timeSlot,
      durationMinutes: Number(duration),
      status: 'pending',
      type,
      notes: notes.trim() || undefined,
      phone: phone.trim() || undefined,
    };
    onAdd(newAppt);
    toast.success(`Appointment booked for ${patientName} on ${date} at ${formatTime12(timeSlot)}`, 'Appointment Booked');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-md" />
      <div
        className="relative glass-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in-scale"
        style={{ borderRadius: 'var(--radius-md)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--surface-border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--primary-light)] flex items-center justify-center">
              <Plus className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">New Appointment</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors text-[var(--text-tertiary)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input
                label="Patient Full Name"
                placeholder="e.g. Ahmad Khan"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            <Input
              label="MR Number"
              placeholder="MR-2026-XXXXX"
              value={mrNumber}
              onChange={(e) => setMrNumber(e.target.value)}
            />
            <Input
              label="Phone (optional)"
              placeholder="0300-1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Select
            label="Doctor"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            options={DOCTORS}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={formatDateKey(new Date())}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] transition-all"
              >
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>{formatTime12(slot)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all"
              >
                <option value="15">15 minutes</option>
                <option value="20">20 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">Appointment Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AppointmentType)}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all"
              >
                <option value="new_patient">New Patient</option>
                <option value="follow_up">Follow-up</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Chief complaint or any notes..."
              rows={3}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_var(--primary-glow)] resize-none transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-0 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="glow" size="sm" loading={bookingLoading} loadingText="Booking..." onClick={handleSubmit}>
            <Plus className="w-3.5 h-3.5" />
            Book Appointment
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Month View ───────────────────────────────────────────────────────────────

interface MonthViewProps {
  year: number;
  month: number;
  appointments: CalendarAppointment[];
  today: Date;
  onDayClick: (date: Date) => void;
  onApptClick: (appt: CalendarAppointment) => void;
}

function MonthView({ year, month, appointments, today, onDayClick, onApptClick }: MonthViewProps) {
  // Build calendar grid (Mon start)
  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay();
  const gridStart = addDays(firstDay, startDow === 0 ? -6 : 1 - startDow);
  const cells: Date[] = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  const apptsByDate = useMemo(() => {
    const map: Record<string, CalendarAppointment[]> = {};
    appointments.forEach((a) => {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    });
    return map;
  }, [appointments]);

  const todayKey = formatDateKey(today);

  return (
    <div className="flex-1 min-h-0">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-[var(--surface-border)]">
        {DAYS_SHORT.map((d) => (
          <div key={d} className="py-2.5 text-center text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7" style={{ gridTemplateRows: 'repeat(6, minmax(100px, 1fr))' }}>
        {cells.map((cell, idx) => {
          const key = formatDateKey(cell);
          const isCurrentMonth = cell.getMonth() === month;
          const isToday = key === todayKey;
          const dayAppts = apptsByDate[key] ?? [];
          const shown = dayAppts.slice(0, 3);
          const overflow = dayAppts.length - 3;

          return (
            <div
              key={idx}
              onClick={() => onDayClick(cell)}
              className={cn(
                'border-b border-r border-[var(--surface-border)] p-1.5 cursor-pointer transition-colors',
                'hover:bg-[var(--primary-light)] group',
                !isCurrentMonth && 'opacity-40',
                isToday && 'bg-[var(--primary-light)]'
              )}
            >
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold mb-1 transition-colors',
                isToday
                  ? 'bg-[var(--primary)] text-white shadow-md'
                  : 'text-[var(--text-primary)] group-hover:bg-[var(--primary)] group-hover:text-white'
              )}>
                {cell.getDate()}
              </div>

              <div className="space-y-0.5">
                {shown.map((appt) => {
                  const dc = getDoctorColor(appt.doctorId);
                  return (
                    <button
                      key={appt.id}
                      onClick={(e) => { e.stopPropagation(); onApptClick(appt); }}
                      className="w-full text-left rounded px-1.5 py-0.5 text-[10px] font-medium truncate transition-opacity hover:opacity-80"
                      style={{
                        background: dc.bg,
                        color: dc.text,
                        borderLeft: `2px solid ${dc.border}`,
                      }}
                    >
                      {formatTime12(appt.startTime)} {appt.patientName.split(' ')[0]}
                    </button>
                  );
                })}
                {overflow > 0 && (
                  <div className="text-[10px] font-semibold text-[var(--text-tertiary)] px-1">+{overflow} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────

interface WeekViewProps {
  weekStart: Date;
  appointments: CalendarAppointment[];
  today: Date;
  onApptClick: (appt: CalendarAppointment) => void;
  onSlotClick: (date: Date, hour: number) => void;
}

function WeekView({ weekStart, appointments, today, onApptClick, onSlotClick }: WeekViewProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const todayKey = formatDateKey(today);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (9 - HOUR_START) * SLOT_HEIGHT;
    }
  }, []);

  const apptsByDate = useMemo(() => {
    const map: Record<string, CalendarAppointment[]> = {};
    appointments.forEach((a) => {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    });
    return map;
  }, [appointments]);

  // Current time indicator
  const now = new Date();
  const nowKey = formatDateKey(now);
  const nowOffset = now.getHours() >= HOUR_START && now.getHours() < HOUR_END
    ? (now.getHours() - HOUR_START + now.getMinutes() / 60) * SLOT_HEIGHT
    : null;

  const [tooltip, setTooltip] = useState<{ appt: CalendarAppointment; x: number; y: number } | null>(null);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-[var(--surface-border)] shrink-0">
        <div className="p-2 text-[10px] text-[var(--text-tertiary)] font-semibold text-center">Time</div>
        {days.map((day, i) => {
          const key = formatDateKey(day);
          const isToday = key === todayKey;
          return (
            <div
              key={i}
              className={cn(
                'py-2.5 text-center border-l border-[var(--surface-border)]',
                isToday && 'bg-[var(--primary-light)]'
              )}
            >
              <p className={cn(
                'text-[11px] font-semibold uppercase tracking-wider',
                isToday ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'
              )}>
                {DAYS_SHORT[i]}
              </p>
              <p className={cn(
                'text-lg font-bold mt-0.5',
                isToday ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'
              )}>
                {day.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div
          className="grid grid-cols-[64px_repeat(7,1fr)] relative"
          style={{ minHeight: `${(HOUR_END - HOUR_START) * SLOT_HEIGHT}px` }}
        >
          {/* Time labels */}
          <div className="relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="border-b border-[var(--surface-border)]/50 flex items-start pt-1 px-2"
                style={{ height: `${SLOT_HEIGHT}px` }}
              >
                <span className="text-[10px] text-[var(--text-tertiary)] font-medium whitespace-nowrap">
                  {h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, dayIdx) => {
            const key = formatDateKey(day);
            const isToday = key === todayKey;
            const dayAppts = (apptsByDate[key] ?? []).filter(
              (a) => a.status !== 'cancelled'
            );

            return (
              <div
                key={dayIdx}
                className={cn(
                  'relative border-l border-[var(--surface-border)]',
                  isToday && 'bg-[var(--primary-light)]/30'
                )}
                style={{ minHeight: `${(HOUR_END - HOUR_START) * SLOT_HEIGHT}px` }}
              >
                {/* Hour lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="border-b border-[var(--surface-border)]/50 hover:bg-[var(--primary-light)]/50 transition-colors cursor-pointer"
                    style={{ height: `${SLOT_HEIGHT}px` }}
                    onClick={() => onSlotClick(day, h)}
                  />
                ))}

                {/* Appointments */}
                {dayAppts.map((appt) => {
                  const startMins = timeToMinutes(appt.startTime);
                  const topPx = (startMins / 60 - HOUR_START) * SLOT_HEIGHT;
                  const heightPx = Math.max((appt.durationMinutes / 60) * SLOT_HEIGHT - 4, 24);
                  const dc = getDoctorColor(appt.doctorId);

                  return (
                    <div
                      key={appt.id}
                      className="appt-block select-none"
                      style={{
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        background: dc.bg,
                        borderLeft: `3px solid ${dc.border}`,
                        color: dc.text,
                        opacity: appt.status === 'cancelled' ? 0.5 : 1,
                      }}
                      onClick={() => onApptClick(appt)}
                      onMouseEnter={(e) => setTooltip({ appt, x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <p className="text-[10px] font-bold truncate leading-tight">{appt.patientName}</p>
                      {heightPx > 32 && (
                        <p className="text-[9px] opacity-75 truncate">{formatTime12(appt.startTime)}</p>
                      )}
                      {heightPx > 44 && (
                        <p className="text-[9px] opacity-60 truncate">{appt.doctorName.split(' ').slice(1).join(' ')}</p>
                      )}
                      {appt.type === 'emergency' && (
                        <AlertTriangle className="w-2.5 h-2.5 absolute top-1 right-1 text-current opacity-70" />
                      )}
                    </div>
                  );
                })}

                {/* Current time indicator */}
                {isToday && nowOffset !== null && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: `${nowOffset}px` }}
                  >
                    <div className="h-0.5 bg-red-500 relative">
                      <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-red-500" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-[100] glass-elevated p-3 rounded-[var(--radius-sm)] text-xs max-w-[200px] shadow-xl pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <p className="font-bold text-[var(--text-primary)] mb-1">{tooltip.appt.patientName}</p>
          <p className="text-[var(--text-secondary)]">{tooltip.appt.doctorName}</p>
          <p className="text-[var(--text-tertiary)]">{formatTime12(tooltip.appt.startTime)} &middot; {tooltip.appt.durationMinutes} min</p>
          <p className="text-[var(--text-tertiary)]">{typeLabel(tooltip.appt.type)}</p>
        </div>
      )}
    </div>
  );
}

// ─── Day View ─────────────────────────────────────────────────────────────────

interface DayViewProps {
  date: Date;
  appointments: CalendarAppointment[];
  onApptClick: (appt: CalendarAppointment) => void;
  onSlotClick: (date: Date, hour: number) => void;
}

function DayView({ date, appointments, onApptClick, onSlotClick }: DayViewProps) {
  const key = formatDateKey(date);
  const scrollRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const isToday = formatDateKey(date) === formatDateKey(now);
  const nowOffset = isToday && now.getHours() >= HOUR_START && now.getHours() < HOUR_END
    ? (now.getHours() - HOUR_START + now.getMinutes() / 60) * SLOT_HEIGHT
    : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (9 - HOUR_START) * SLOT_HEIGHT;
    }
  }, [key]);

  const dayAppts = appointments.filter((a) => a.date === key);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-[var(--surface-border)] px-4 py-3 shrink-0">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {date.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          {dayAppts.filter((a) => a.status !== 'cancelled').length} appointments
        </p>
      </div>

      {/* Scrollable timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div
          className="grid grid-cols-[64px_1fr] relative"
          style={{ minHeight: `${(HOUR_END - HOUR_START) * SLOT_HEIGHT}px` }}
        >
          {/* Time labels */}
          <div>
            {HOURS.map((h) => (
              <div
                key={h}
                className="border-b border-[var(--surface-border)]/50 flex items-start pt-1 px-2"
                style={{ height: `${SLOT_HEIGHT}px` }}
              >
                <span className="text-[10px] text-[var(--text-tertiary)] font-medium">
                  {h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`}
                </span>
              </div>
            ))}
          </div>

          {/* Main column */}
          <div className="relative border-l border-[var(--surface-border)]" style={{ minHeight: `${(HOUR_END - HOUR_START) * SLOT_HEIGHT}px` }}>
            {HOURS.map((h) => (
              <div
                key={h}
                className="border-b border-[var(--surface-border)]/50 hover:bg-[var(--primary-light)]/50 transition-colors cursor-pointer group relative"
                style={{ height: `${SLOT_HEIGHT}px` }}
                onClick={() => onSlotClick(date, h)}
              >
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <Plus className="w-3 h-3" />
                  Book
                </span>
              </div>
            ))}

            {/* Appointment cards */}
            {dayAppts.map((appt) => {
              const startMins = timeToMinutes(appt.startTime);
              const topPx = (startMins / 60 - HOUR_START) * SLOT_HEIGHT;
              const heightPx = Math.max((appt.durationMinutes / 60) * SLOT_HEIGHT - 6, 40);
              const dc = getDoctorColor(appt.doctorId);

              return (
                <div
                  key={appt.id}
                  className="absolute left-2 right-2 rounded-lg cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:scale-[1.01] group/card"
                  style={{
                    top: `${topPx}px`,
                    height: `${heightPx}px`,
                    background: dc.bg,
                    borderLeft: `4px solid ${dc.border}`,
                    border: `1px solid ${dc.border}40`,
                    borderLeftWidth: '4px',
                    opacity: appt.status === 'cancelled' ? 0.5 : 1,
                  }}
                  onClick={() => onApptClick(appt)}
                >
                  <div className="p-2 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-bold truncate" style={{ color: dc.text }}>{appt.patientName}</p>
                        <Badge variant={statusVariant(appt.status)} className="text-[9px] shrink-0">{statusLabel(appt.status)}</Badge>
                      </div>
                      <p className="text-[11px] opacity-75 truncate" style={{ color: dc.text }}>{appt.mrNumber}</p>
                    </div>
                    {heightPx > 50 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="w-3 h-3 opacity-60" style={{ color: dc.text }} />
                          <span className="text-[10px] opacity-70 truncate" style={{ color: dc.text }}>{appt.doctorName}</span>
                        </div>
                        <span className="text-[10px] opacity-60" style={{ color: dc.text }}>
                          {formatTime12(appt.startTime)} · {appt.durationMinutes}m
                        </span>
                      </div>
                    )}
                    {appt.type === 'emergency' && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] text-amber-600 font-semibold">Emergency</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Current time line */}
            {isToday && nowOffset !== null && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{ top: `${nowOffset}px` }}
              >
                <div className="h-0.5 bg-red-500">
                  <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-red-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Doctor Legend ────────────────────────────────────────────────────────────

function DoctorLegend() {
  const doctors = [
    { id: 'dr_tariq', name: 'Dr. Tariq Ahmed' },
    { id: 'dr_saira', name: 'Dr. Saira Khan' },
    { id: 'dr_imran', name: 'Dr. Imran Malik' },
    { id: 'dr_farhan', name: 'Dr. Farhan Sheikh' },
    { id: 'dr_hina', name: 'Dr. Hina Rauf' },
  ];
  return (
    <div className="flex flex-wrap items-center gap-3">
      {doctors.map((doc) => {
        const dc = getDoctorColor(doc.id);
        return (
          <div key={doc.id} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: dc.border }} />
            <span className="text-[11px] text-[var(--text-tertiary)]">{doc.name.split(' ').slice(1).join(' ')}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface AppointmentCalendarProps {
  title?: string;
  subtitle?: string;
  /** Restrict to a specific doctorId to show only that doctor's appointments */
  filterDoctorId?: string;
}

export function AppointmentCalendar({
  title = 'Appointment Calendar',
  subtitle,
  filterDoctorId,
}: AppointmentCalendarProps) {
  const [view, setView] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<CalendarAppointment[]>(DEMO_APPOINTMENTS);
  const [selectedAppt, setSelectedAppt] = useState<CalendarAppointment | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newApptDate, setNewApptDate] = useState<string | undefined>();

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  const filtered = useMemo(
    () => filterDoctorId ? appointments.filter((a) => a.doctorId === filterDoctorId) : appointments,
    [appointments, filterDoctorId]
  );

  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);

  function goToToday() {
    setCurrentDate(new Date());
  }

  function goPrev() {
    if (view === 'month') {
      setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    } else if (view === 'week') {
      setCurrentDate((d) => addDays(d, -7));
    } else {
      setCurrentDate((d) => addDays(d, -1));
    }
  }

  function goNext() {
    if (view === 'month') {
      setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    } else if (view === 'week') {
      setCurrentDate((d) => addDays(d, 7));
    } else {
      setCurrentDate((d) => addDays(d, 1));
    }
  }

  function handleDayClick(date: Date) {
    setCurrentDate(date);
    setView('day');
  }

  function handleSlotClick(date: Date, hour: number) {
    const dateKey = formatDateKey(date);
    setNewApptDate(dateKey);
    setShowNewModal(true);
  }

  function handleApptUpdate(id: string, update: Partial<CalendarAppointment>) {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...update } : a)));
  }

  function handleApptAdd(appt: CalendarAppointment) {
    setAppointments((prev) => [...prev, appt]);
  }

  // Header label
  let headerLabel = '';
  if (view === 'month') {
    headerLabel = `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  } else if (view === 'week') {
    const ws = weekStart;
    const we = addDays(ws, 6);
    headerLabel = ws.getMonth() === we.getMonth()
      ? `${ws.getDate()} – ${we.getDate()} ${MONTH_NAMES[ws.getMonth()]} ${ws.getFullYear()}`
      : `${ws.getDate()} ${MONTH_NAMES[ws.getMonth()]} – ${we.getDate()} ${MONTH_NAMES[we.getMonth()]} ${ws.getFullYear()}`;
  } else {
    headerLabel = currentDate.toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  return (
    <div className="flex flex-col h-full gap-4 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>}
        </div>
        <Button
          variant="glow"
          size="sm"
          onClick={() => { setNewApptDate(undefined); setShowNewModal(true); }}
        >
          <Plus className="w-4 h-4" />
          New Appointment
        </Button>
      </div>

      {/* Calendar panel */}
      <div className="glass-card-static flex flex-col overflow-hidden" style={{ minHeight: '600px', borderRadius: 'var(--radius-md)' }}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--surface-border)] shrink-0 flex-wrap gap-2">
          {/* Nav */}
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--surface)] transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 rounded-[var(--radius-sm)] text-xs font-semibold bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] transition-colors border border-[var(--surface-border)]"
            >
              Today
            </button>
            <button
              onClick={goNext}
              className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--surface)] transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] ml-1">{headerLabel}</h2>
          </div>

          {/* View toggle */}
          <div className="flex items-center rounded-[var(--radius-sm)] border border-[var(--surface-border)] overflow-hidden bg-[var(--surface)]">
            {(['month', 'week', 'day'] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold capitalize transition-all',
                  view === v
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor legend (week/day) */}
        {(view === 'week' || view === 'day') && (
          <div className="px-4 py-2 border-b border-[var(--surface-border)] shrink-0">
            <DoctorLegend />
          </div>
        )}

        {/* Calendar body */}
        {view === 'month' && (
          <MonthView
            year={currentDate.getFullYear()}
            month={currentDate.getMonth()}
            appointments={filtered}
            today={today}
            onDayClick={handleDayClick}
            onApptClick={setSelectedAppt}
          />
        )}
        {view === 'week' && (
          <WeekView
            weekStart={weekStart}
            appointments={filtered}
            today={today}
            onApptClick={setSelectedAppt}
            onSlotClick={handleSlotClick}
          />
        )}
        {view === 'day' && (
          <DayView
            date={currentDate}
            appointments={filtered}
            onApptClick={setSelectedAppt}
            onSlotClick={handleSlotClick}
          />
        )}
      </div>

      {/* Modals */}
      {selectedAppt && (
        <AppointmentDetailModal
          appointment={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onUpdate={handleApptUpdate}
        />
      )}
      {showNewModal && (
        <NewAppointmentModal
          defaultDate={newApptDate}
          onClose={() => setShowNewModal(false)}
          onAdd={handleApptAdd}
        />
      )}
    </div>
  );
}
