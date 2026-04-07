import { useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  Banknote,
  AlertCircle,
  Clock,
  UserPlus,
  ArrowRight,
  Search,
  CalendarDays,
  Zap,
  Sun,
  Cloud,
  Moon,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

/* ------------------------------------------------------------------ */
/*  Demo Data                                                         */
/* ------------------------------------------------------------------ */

const todaysQueue = [
  { token: 'T-001', patient: 'Ahmed Raza', mr: 'MR-10234', doctor: 'Dr. Farhan Sheikh', department: 'Cardiology', status: 'completed', time: '09:00 AM' },
  { token: 'T-002', patient: 'Fatima Bibi', mr: 'MR-10235', doctor: 'Dr. Sana Malik', department: 'Gynecology', status: 'completed', time: '09:15 AM' },
  { token: 'T-003', patient: 'Usman Tariq', mr: 'MR-10236', doctor: 'Dr. Asif Javed', department: 'Orthopedics', status: 'in_progress', time: '09:30 AM' },
  { token: 'T-004', patient: 'Ayesha Noor', mr: 'MR-10237', doctor: 'Dr. Farhan Sheikh', department: 'Cardiology', status: 'in_progress', time: '09:45 AM' },
  { token: 'T-005', patient: 'Bilal Hussain', mr: 'MR-10238', doctor: 'Dr. Nadia Qureshi', department: 'General Medicine', status: 'waiting', time: '10:00 AM' },
  { token: 'T-006', patient: 'Zainab Akhtar', mr: 'MR-10239', doctor: 'Dr. Imran Aslam', department: 'ENT', status: 'waiting', time: '10:15 AM' },
  { token: 'T-007', patient: 'Hassan Ali', mr: 'MR-10240', doctor: 'Dr. Sana Malik', department: 'Gynecology', status: 'waiting', time: '10:30 AM' },
  { token: 'T-008', patient: 'Rabia Kanwal', mr: 'MR-10241', doctor: 'Dr. Asif Javed', department: 'Orthopedics', status: 'cancelled', time: '10:45 AM' },
];

const recentRegistrations = [
  { name: 'Bilal Hussain', mr: 'MR-10238', phone: '0321-5551234', time: '9:52 AM' },
  { name: 'Zainab Akhtar', mr: 'MR-10239', phone: '0300-6782345', time: '9:48 AM' },
  { name: 'Hassan Ali', mr: 'MR-10240', phone: '0333-9014567', time: '9:35 AM' },
  { name: 'Rabia Kanwal', mr: 'MR-10241', phone: '0312-2345678', time: '9:20 AM' },
  { name: 'Ayesha Noor', mr: 'MR-10237', phone: '0345-8901234', time: '9:10 AM' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

function getReceptionGreeting(): { text: string; icon: typeof Sun; iconClass: string } {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { text: 'Good morning', icon: Sun, iconClass: 'text-amber-400' };
  if (h >= 12 && h < 17) return { text: 'Good afternoon', icon: Cloud, iconClass: 'text-sky-400' };
  if (h >= 17 && h < 21) return { text: 'Good evening', icon: Cloud, iconClass: 'text-orange-400' };
  return { text: 'Working late? Good night,', icon: Moon, iconClass: 'text-indigo-400' };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const greeting = getReceptionGreeting();
  const GreetIcon = greeting.icon;
  const displayName = user?.fullName ?? 'Staff';

  const waitingCount = todaysQueue.filter((a) => a.status === 'waiting').length;
  const inProgressCount = todaysQueue.filter((a) => a.status === 'in_progress').length;
  const completedCount = todaysQueue.filter((a) => a.status === 'completed').length;
  const appointmentsToday = todaysQueue.length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className={`p-2 rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] ${greeting.iconClass}`}>
            <GreetIcon className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {greeting.text}, {displayName}.
          </h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          {waitingCount} patient{waitingCount !== 1 ? 's' : ''} waiting &middot; {appointmentsToday} appointments today
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/reception/register')}
          className="glass-card p-5 flex items-center gap-4 group cursor-pointer hover:border-[var(--primary)] transition-all duration-300"
        >
          <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--primary-light)] text-[var(--primary)] group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Register Walk-in</p>
            <p className="text-xs text-[var(--text-tertiary)]">Quick registration for walk-in patients</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <button
          onClick={() => navigate('/reception/patients')}
          className="glass-card p-5 flex items-center gap-4 group cursor-pointer hover:border-blue-500 transition-all duration-300"
        >
          <div className="p-3 rounded-[var(--radius-sm)] bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
            <Search className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Search Patient</p>
            <p className="text-xs text-[var(--text-tertiary)]">Find existing patient records</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <button
          onClick={() => navigate('/reception/appointments')}
          className="glass-card p-5 flex items-center gap-4 group cursor-pointer hover:border-purple-500 transition-all duration-300"
        >
          <div className="p-3 rounded-[var(--radius-sm)] bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[var(--text-primary)]">Today's Schedule</p>
            <p className="text-xs text-[var(--text-tertiary)]">View all scheduled appointments</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 stagger-children">
        <MetricCard
          title="Today's Patients"
          value={42}
          subtitle="6 new registrations"
          icon={Users}
          trend={{ value: 12, positive: true }}
        />
        <MetricCard
          title="Appointments"
          value={38}
          subtitle="5 walk-ins, 33 scheduled"
          icon={CalendarCheck}
          trend={{ value: 8, positive: true }}
          iconColor="bg-[rgba(59,130,246,0.12)] text-blue-500"
        />
        <MetricCard
          title="Revenue Collected"
          value="Rs. 87,500"
          subtitle="From 29 payments"
          icon={Banknote}
          trend={{ value: 15, positive: true }}
          iconColor="bg-[rgba(16,185,129,0.12)] text-emerald-500"
        />
        <MetricCard
          title="Pending Payments"
          value="Rs. 23,200"
          subtitle="9 invoices pending"
          icon={AlertCircle}
          trend={{ value: 3, positive: false }}
          iconColor="bg-[rgba(245,158,11,0.12)] text-amber-500"
        />
      </div>

      {/* Today's Queue Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card hover={false} className="p-4 text-center">
          <p className="text-3xl font-bold text-amber-500">{waitingCount}</p>
          <p className="text-xs font-medium text-[var(--text-secondary)] mt-1">Waiting</p>
        </Card>
        <Card hover={false} className="p-4 text-center">
          <p className="text-3xl font-bold text-blue-500">{inProgressCount}</p>
          <p className="text-xs font-medium text-[var(--text-secondary)] mt-1">In Progress</p>
        </Card>
        <Card hover={false} className="p-4 text-center">
          <p className="text-3xl font-bold text-emerald-500">{completedCount}</p>
          <p className="text-xs font-medium text-[var(--text-secondary)] mt-1">Completed</p>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Appointment queue — takes 2 cols */}
        <div className="xl:col-span-2 space-y-4">
          <Card hover={false} className="p-0">
            <CardHeader className="px-6 pt-5 pb-0 flex items-center justify-between">
              <CardTitle>Today's Queue</CardTitle>
              <Badge variant="info" dot>
                {waitingCount} waiting
              </Badge>
            </CardHeader>
            <CardContent className="px-0 pb-0 mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token #</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="stagger-children">
                  {todaysQueue.map((row) => (
                    <TableRow key={row.token}>
                      <TableCell className="font-mono font-semibold text-[var(--primary)]">
                        {row.token}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{row.patient}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">{row.mr}</p>
                        </div>
                      </TableCell>
                      <TableCell>{row.doctor}</TableCell>
                      <TableCell>
                        <span className="text-xs text-[var(--text-secondary)]">{row.department}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                          <Clock className="w-3 h-3" />
                          {row.time}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Recent registrations sidebar */}
        <div className="space-y-4">
          <Card hover={false}>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Recent Registrations</CardTitle>
              <UserPlus className="w-4 h-4 text-[var(--text-tertiary)]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4 stagger-children">
                {recentRegistrations.map((r) => (
                  <div
                    key={r.mr}
                    className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors duration-200"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {r.name}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {r.mr} &middot; {r.phone}
                      </p>
                    </div>
                    <span className="text-[11px] text-[var(--text-tertiary)] whitespace-nowrap ml-3">
                      {r.time}
                    </span>
                  </div>
                ))}
              </div>

              <Button variant="ghost" size="sm" className="w-full mt-4 gap-1" onClick={() => navigate('/reception/patients')}>
                View all registrations <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
