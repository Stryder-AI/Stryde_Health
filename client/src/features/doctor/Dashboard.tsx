import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Clock, CheckCircle2, XCircle, CalendarClock, Activity,
  Stethoscope, ArrowRight, Bell, Phone, Eye, AlertTriangle,
  Sun, Cloud, Moon,
} from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import PatientHoverCard, { type PatientPreview } from '@/components/ui/PatientHoverCard';

// ── Demo Data ─────────────────────────────────────────────────

const doctor = {
  name: 'Dr. Tariq Ahmed',
  specialty: 'Cardiologist',
  department: 'Cardiology',
};

// ── Greeting intelligence ────────────────────────────────────

function getGreeting(): { text: string; icon: typeof Sun; iconClass: string } {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { text: 'Good morning', icon: Sun, iconClass: 'text-amber-400' };
  if (h >= 12 && h < 17) return { text: 'Good afternoon', icon: Cloud, iconClass: 'text-sky-400' };
  if (h >= 17 && h < 21) return { text: 'Good evening', icon: Cloud, iconClass: 'text-orange-400' };
  return { text: 'Working late? Good night,', icon: Moon, iconClass: 'text-indigo-400' };
}

const INSIGHT_MESSAGES = [
  "You've seen 24 patients today — great work!",
  '142 patients seen this week, 8% more than last week.',
  'Your avg consultation time is 12 minutes — well within target.',
  '3 follow-up reminders need attention today.',
  'You have 5 upcoming appointments this afternoon.',
];

function getDailyInsight(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return INSIGHT_MESSAGES[dayOfYear % INSIGHT_MESSAGES.length];
}

const weeklyData = [
  { day: 'Mon', count: 18, max: 30 },
  { day: 'Tue', count: 24, max: 30 },
  { day: 'Wed', count: 21, max: 30 },
  { day: 'Thu', count: 27, max: 30 },
  { day: 'Fri', count: 15, max: 30 },
  { day: 'Sat', count: 12, max: 30 },
  { day: 'Sun', count: 0, max: 30 },
];

const upcomingAppointments = [
  {
    id: 1,
    name: 'Fatima Bibi',
    mr: 'MR-20241087',
    time: '11:30 AM',
    type: 'Follow-up',
    condition: 'Hypertension',
    avatar: 'FB',
    preview: {
      id: 'apt-1', mr: 'MR-20241087', name: 'Fatima Bibi', age: 47, gender: 'F' as const,
      bloodGroup: 'O+', conditions: ['Hypertension'], allergies: [], lastVisit: '01 Mar 2026',
    } as PatientPreview,
  },
  {
    id: 2,
    name: 'Muhammad Usman',
    mr: 'MR-20241132',
    time: '12:00 PM',
    type: 'New Patient',
    condition: 'Chest Pain',
    avatar: 'MU',
    preview: {
      id: 'apt-2', mr: 'MR-20241132', name: 'Muhammad Usman', age: 38, gender: 'M' as const,
      bloodGroup: 'B+', conditions: ['Chest Pain'], allergies: [], lastVisit: undefined,
    } as PatientPreview,
  },
  {
    id: 3,
    name: 'Ayesha Siddiqui',
    mr: 'MR-20240956',
    time: '12:30 PM',
    type: 'Follow-up',
    condition: 'Arrhythmia',
    avatar: 'AS',
    preview: {
      id: 'apt-3', mr: 'MR-20240956', name: 'Ayesha Siddiqui', age: 52, gender: 'F' as const,
      bloodGroup: 'A+', conditions: ['Arrhythmia'], allergies: ['Codeine'], lastVisit: '10 Feb 2026',
    } as PatientPreview,
  },
];

interface FollowUpReminder {
  id: number;
  name: string;
  mr: string;
  condition: string;
  followUpDate: string; // ISO date string
  avatar: string;
  phone: string;
}

const followUpReminders: FollowUpReminder[] = [
  { id: 1, name: 'Rashid Mehmood', mr: 'MR-20240812', condition: 'Hypertension + CKD', followUpDate: '2026-03-26', avatar: 'RM', phone: '+92 321 4567890' },
  { id: 2, name: 'Bushra Nawaz', mr: 'MR-20240876', condition: 'Diabetes Type 2', followUpDate: '2026-03-29', avatar: 'BN', phone: '+92 322 4445566' },
  { id: 3, name: 'Ahmad Khan', mr: 'MR-20240445', condition: 'Cardiac + CKD', followUpDate: '2026-03-29', avatar: 'AK', phone: '+92 300 1234567' },
  { id: 4, name: 'Sadia Parveen', mr: 'MR-20241345', condition: 'Palpitations', followUpDate: '2026-03-31', avatar: 'SP', phone: '+92 312 5551234' },
  { id: 5, name: 'Imran Saeed', mr: 'MR-20240654', condition: 'COPD Exacerbation', followUpDate: '2026-04-02', avatar: 'IS', phone: '+92 333 9876543' },
  { id: 6, name: 'Zainab Fatima', mr: 'MR-20240998', condition: 'Valvular Disease', followUpDate: '2026-04-04', avatar: 'ZF', phone: '+92 345 6789012' },
];

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getFollowUpStatus(days: number): { label: string; variant: string; color: string; bgColor: string } {
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, variant: 'danger', color: 'text-red-500', bgColor: 'bg-red-500' };
  if (days === 0) return { label: 'Today', variant: 'warning', color: 'text-amber-500', bgColor: 'bg-amber-500' };
  return { label: `In ${days}d`, variant: 'success', color: 'text-emerald-500', bgColor: 'bg-emerald-500' };
}

// ── Component ─────────────────────────────────────────────────

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [selectedDay] = useState<number | null>(null);
  const greeting = getGreeting();
  const GreetIcon = greeting.icon;
  const insight = getDailyInsight();
  const today = new Date().toLocaleDateString('en-PK', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-2 rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] ${greeting.iconClass}`}>
              <GreetIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {greeting.text}, {doctor.name}
            </h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {doctor.specialty} &middot; {today}
          </p>
          <p className="text-xs text-[var(--primary)] font-medium mt-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            {insight}
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={() => { toast.success('OPD session started. Redirecting to queue...'); navigate('/doctor/opd'); }}>
          <Stethoscope className="w-4 h-4" />
          Start OPD
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 stagger-children">
        <MetricCard
          title="Patients Today"
          value={24}
          subtitle="18 of 30 slots filled"
          icon={Users}
          trend={{ value: 12, positive: true }}
        />
        <MetricCard
          title="In Waiting"
          value={6}
          subtitle="Avg wait 14 min"
          icon={Clock}
          iconColor="bg-[var(--warning-bg)] text-amber-600"
        />
        <MetricCard
          title="Completed"
          value={11}
          subtitle="45% of today's list"
          icon={CheckCircle2}
          iconColor="bg-[var(--success-bg)] text-emerald-600"
          trend={{ value: 8, positive: true }}
        />
        <MetricCard
          title="Cancelled / No-show"
          value={2}
          subtitle="1 cancelled, 1 no-show"
          icon={XCircle}
          iconColor="bg-[var(--danger-bg)] text-red-600"
        />
        <MetricCard
          title="Upcoming"
          value={5}
          subtitle="Next at 11:30 AM"
          icon={CalendarClock}
          iconColor="bg-[var(--info-bg)] text-blue-600"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Weekly Summary Chart */}
        <Card className="lg:col-span-3" hover={false}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Weekly Summary</CardTitle>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Patients seen this week</p>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {weeklyData.reduce((s, d) => s + d.count, 0)} total
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-3 h-48 pt-4">
              {weeklyData.map((d, i) => {
                const pct = d.max > 0 ? (d.count / d.max) * 100 : 0;
                const isToday = i === new Date().getDay() - 1;
                return (
                  <div
                    key={d.day}
                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    {/* Count label */}
                    <span className="text-xs font-semibold text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count}
                    </span>
                    {/* Bar */}
                    <div className="w-full flex items-end justify-center" style={{ height: '140px' }}>
                      <div
                        className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ease-out ${
                          isToday
                            ? 'bg-gradient-to-t from-[var(--primary)] to-teal-400 shadow-[0_0_16px_var(--primary-glow)]'
                            : 'bg-gradient-to-t from-[var(--primary)]/60 to-[var(--primary)]/20 group-hover:from-[var(--primary)] group-hover:to-teal-400'
                        }`}
                        style={{
                          height: `${Math.max(pct, 4)}%`,
                          animationDelay: `${i * 0.08}s`,
                        }}
                      />
                    </div>
                    {/* Day label */}
                    <span
                      className={`text-xs font-medium ${
                        isToday ? 'text-[var(--primary)] font-bold' : 'text-[var(--text-tertiary)]'
                      }`}
                    >
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2" hover={false}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Next Appointments</CardTitle>
              <Badge variant="info" dot>
                {upcomingAppointments.length} upcoming
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 stagger-children">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="glass-card-static p-4 flex items-center gap-4 group cursor-pointer hover:border-[var(--primary)]/30 transition-all"
                  onClick={() => navigate('/doctor/opd')}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-teal-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {apt.avatar}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <PatientHoverCard
                      patient={apt.preview}
                      onStartConsult={() => navigate('/doctor/opd')}
                      onOpenRecord={() => navigate('/doctor/patients')}
                    >
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate cursor-pointer hover:text-[var(--primary)] transition-colors w-fit">
                        {apt.name}
                      </p>
                    </PatientHoverCard>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {apt.mr} &middot; {apt.condition}
                    </p>
                  </div>
                  {/* Time + type */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{apt.time}</p>
                    <Badge
                      variant={apt.type === 'New Patient' ? 'accent' : 'default'}
                      className="text-[10px] mt-1"
                    >
                      {apt.type}
                    </Badge>
                  </div>
                </div>
              ))}

              {/* View all link */}
              <button
                onClick={() => navigate('/doctor/schedule')}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary-light)] rounded-[var(--radius-sm)] transition-colors"
              >
                View Full Schedule
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Follow-up Reminders */}
      <Card hover={false}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              <CardTitle>Follow-up Reminders</CardTitle>
            </div>
            <Badge variant="warning" dot>
              {followUpReminders.filter((r) => getDaysUntil(r.followUpDate) <= 0).length} need attention
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 stagger-children">
            {followUpReminders
              .sort((a, b) => getDaysUntil(a.followUpDate) - getDaysUntil(b.followUpDate))
              .map((reminder) => {
                const days = getDaysUntil(reminder.followUpDate);
                const status = getFollowUpStatus(days);
                return (
                  <div
                    key={reminder.id}
                    className={`glass-card-static p-4 flex items-center gap-4 group transition-all ${
                      days < 0 ? 'border-l-4 border-l-red-500' : days === 0 ? 'border-l-4 border-l-amber-500' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                      days < 0
                        ? 'bg-gradient-to-br from-red-500 to-rose-400'
                        : days === 0
                        ? 'bg-gradient-to-br from-amber-500 to-orange-400'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-400'
                    }`}>
                      {reminder.avatar}
                    </div>

                    {/* Patient info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                          {reminder.name}
                        </p>
                        {days < 0 && (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {reminder.mr} &middot; {reminder.condition}
                      </p>
                    </div>

                    {/* Date & Status */}
                    <div className="text-right shrink-0">
                      <p className="text-xs text-[var(--text-secondary)]">
                        {new Date(reminder.followUpDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </p>
                      <Badge variant={status.variant as any} className="text-[10px] mt-0.5">
                        {status.label}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { toast.info(`Calling ${reminder.name} at ${reminder.phone}...`); }}
                        title="Call Patient"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { navigate('/doctor/patients'); toast.info(`Opening record for ${reminder.name}`); }}
                        title="View Record"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Footer */}
      <Card hover={false} className="!p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[var(--text-secondary)]">OPD Status:</span>
            <span className="font-semibold text-emerald-600">Active</span>
          </div>
          <div className="text-[var(--text-tertiary)]">
            Next break: <span className="text-[var(--text-primary)] font-medium">1:00 PM - 2:00 PM</span>
          </div>
          <div className="text-[var(--text-tertiary)]">
            Avg. consultation time: <span className="text-[var(--text-primary)] font-medium">12 min</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
