import { Users, Calendar, FlaskConical, ShoppingCart, TrendingUp, Activity, AlertCircle, Clock, Sun, Cloud, Moon } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { MetricCard } from '@/components/shared/MetricCard';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LineChart, DonutChart, BarChart, SparkLine } from '@/components/shared/MiniChart';
import { WidgetWrapper, CustomizeDashboard } from '@/components/shared/DashboardWidgets';

const recentActivity = [
  { id: 1, text: 'Patient Fatima Bibi (MR-2026-00002) registered', time: '2 min ago', type: 'registration' },
  { id: 2, text: 'Dr. Tariq Ahmed completed consultation — Token #12', time: '5 min ago', type: 'consultation' },
  { id: 3, text: 'CBC Report ready — Ahmad Khan (MR-2026-00001)', time: '8 min ago', type: 'lab' },
  { id: 4, text: 'Pharmacy sale #1042 completed — Rs. 2,450', time: '12 min ago', type: 'pharmacy' },
  { id: 5, text: 'Dr. Saira Khan started consultation — Token #15', time: '15 min ago', type: 'consultation' },
  { id: 6, text: 'Lab order placed for Usman Ali — Lipid Profile, RFTs', time: '18 min ago', type: 'lab' },
  { id: 7, text: 'Patient Hassan Mahmood (MR-2026-00009) registered', time: '22 min ago', type: 'registration' },
  { id: 8, text: 'Prescription dispensed for Saima Noor — 3 items', time: '25 min ago', type: 'pharmacy' },
];

const departmentPulse = [
  { name: 'OPD', count: 28, icon: Activity, color: 'bg-blue-500/10 text-blue-500' },
  { name: 'Lab', count: 12, icon: FlaskConical, color: 'bg-purple-500/10 text-purple-500' },
  { name: 'Pharmacy', count: 34, icon: ShoppingCart, color: 'bg-teal-500/10 text-teal-500' },
];

const alerts = [
  { text: 'Paracetamol 500mg — Stock below reorder level (15 units)', type: 'warning' as const },
  { text: '3 lab reports pending verification for 2+ hours', type: 'warning' as const },
  { text: 'Insulin Mixtard 70/30 — Expiring in 15 days', type: 'danger' as const },
];

// Chart data
const revenueTrendData = [
  { label: 'Mon', value: 45000 },
  { label: 'Tue', value: 62000 },
  { label: 'Wed', value: 58000 },
  { label: 'Thu', value: 71000 },
  { label: 'Fri', value: 95000 },
  { label: 'Sat', value: 82000 },
  { label: 'Sun', value: 35000 },
];

const patientsByDepartment = [
  { label: 'General OPD', value: 312, color: '#3b82f6' },
  { label: 'Cardiology', value: 124, color: '#ef4444' },
  { label: 'Gynecology', value: 148, color: '#ec4899' },
  { label: 'Orthopedics', value: 98, color: '#f59e0b' },
  { label: 'Pediatrics', value: 185, color: '#10b981' },
];

const dailyAppointments = [
  { label: 'Mon', value: 42 },
  { label: 'Tue', value: 55 },
  { label: 'Wed', value: 48 },
  { label: 'Thu', value: 62 },
  { label: 'Fri', value: 51 },
  { label: 'Sat', value: 35 },
  { label: 'Sun', value: 18 },
];

const sparkRevenue = [45, 62, 58, 71, 95, 82, 35];
const sparkPatients = [38, 42, 55, 48, 62, 51, 47];

const adminWidgets = [
  { id: 'metrics', title: 'Key Metrics' },
  { id: 'revenue-trend', title: 'Revenue Trend' },
  { id: 'patients-dept', title: 'Patients by Department' },
  { id: 'daily-appointments', title: 'Daily Appointments' },
  { id: 'department-pulse', title: 'Department Pulse' },
  { id: 'activity-feed', title: 'Recent Activity' },
  { id: 'alerts', title: 'System Alerts' },
];

function getAdminGreeting(): { text: string; icon: typeof Sun; iconClass: string } {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { text: 'Good morning', icon: Sun, iconClass: 'text-amber-400' };
  if (h >= 12 && h < 17) return { text: 'Good afternoon', icon: Cloud, iconClass: 'text-sky-400' };
  if (h >= 17 && h < 21) return { text: 'Good evening', icon: Cloud, iconClass: 'text-orange-400' };
  return { text: 'Working late? Good night', icon: Moon, iconClass: 'text-indigo-400' };
}

const today = new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

export function AdminDashboard() {
  const { user } = useAuthStore();
  const greeting = getAdminGreeting();
  const GreetIcon = greeting.icon;
  const displayName = user?.fullName ?? 'Admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-2 rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] ${greeting.iconClass}`}>
              <GreetIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {greeting.text}, {displayName}.
            </h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Here's your hospital overview for {today}.</p>
        </div>
        <CustomizeDashboard widgets={adminWidgets} />
      </div>

      {/* Metric Cards */}
      <WidgetWrapper id="metrics" title="Key Metrics">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <div className="glass-card p-5 group">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Patients Today</p>
                <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">47</p>
                <p className="text-xs text-[var(--text-secondary)]">8 currently waiting</p>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--success-bg)] text-emerald-600">
                  <TrendingUp className="w-3 h-3" /> +12%
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--primary-light)] text-[var(--primary)]">
                  <Users className="w-5 h-5" />
                </div>
                <SparkLine data={sparkPatients} color="var(--primary)" />
              </div>
            </div>
          </div>
          <div className="glass-card p-5 group">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Appointments</p>
                <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">52</p>
                <p className="text-xs text-[var(--text-secondary)]">38 completed, 14 remaining</p>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--success-bg)] text-emerald-600">
                  <TrendingUp className="w-3 h-3" /> +5%
                </div>
              </div>
              <div className="p-3 rounded-[var(--radius-sm)] bg-blue-500/10 text-blue-500">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div className="glass-card p-5 group">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Lab Orders</p>
                <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">18</p>
                <p className="text-xs text-[var(--text-secondary)]">6 pending, 12 completed</p>
              </div>
              <div className="p-3 rounded-[var(--radius-sm)] bg-purple-500/10 text-purple-500">
                <FlaskConical className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div className="glass-card p-5 group">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Revenue Today</p>
                <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Rs. 148,500</p>
                <p className="text-xs text-[var(--text-secondary)]">Across all departments</p>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--success-bg)] text-emerald-600">
                  <TrendingUp className="w-3 h-3" /> +8%
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="p-3 rounded-[var(--radius-sm)] bg-emerald-500/10 text-emerald-500">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <SparkLine data={sparkRevenue} color="#10b981" />
              </div>
            </div>
          </div>
        </div>
      </WidgetWrapper>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Line Chart */}
        <WidgetWrapper id="revenue-trend" title="Revenue Trend (Last 7 Days)" className="lg:col-span-2">
          <LineChart
            data={revenueTrendData}
            width={600}
            height={200}
            color="var(--primary)"
            fillColor="var(--primary)"
          />
        </WidgetWrapper>

        {/* Patients by Department Donut */}
        <WidgetWrapper id="patients-dept" title="Patients by Department">
          <div className="flex flex-col items-center gap-4">
            <DonutChart
              data={patientsByDepartment}
              size={160}
              centerValue="867"
              centerLabel="Total"
            />
            <div className="w-full space-y-2">
              {patientsByDepartment.map((d) => (
                <div key={d.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-[var(--text-primary)]">{d.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </WidgetWrapper>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Appointments Bar Chart */}
        <WidgetWrapper id="daily-appointments" title="Daily Appointments (This Week)" className="lg:col-span-2">
          <BarChart
            data={dailyAppointments}
            height={180}
            color="from-blue-500 to-blue-400"
          />
        </WidgetWrapper>

        {/* Department Pulse */}
        <WidgetWrapper id="department-pulse" title="Department Pulse">
          <div className="space-y-4">
            {departmentPulse.map((dept) => (
              <div key={dept.name} className="flex items-center gap-4 p-3 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--surface-border-hover)] transition-all duration-200">
                <div className={`p-2.5 rounded-[var(--radius-sm)] ${dept.color}`}>
                  <dept.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{dept.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">orders today</p>
                </div>
                <span className="text-2xl font-bold text-[var(--text-primary)]">{dept.count}</span>
              </div>
            ))}
          </div>
        </WidgetWrapper>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <WidgetWrapper id="activity-feed" title="Recent Activity" className="lg:col-span-2">
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-[var(--radius-sm)] hover:bg-[var(--surface)] transition-all duration-200 group">
                <div className="w-2 h-2 rounded-full bg-[var(--primary)] mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)]">{item.text}</p>
                  <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </WidgetWrapper>

        {/* System Alerts */}
        <WidgetWrapper id="alerts" title="System Alerts">
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className="p-3 rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)]">
                <div className="flex items-start gap-2">
                  <Badge variant={alert.type} dot className="mt-0.5 shrink-0">
                    {alert.type === 'danger' ? 'Critical' : 'Warning'}
                  </Badge>
                </div>
                <p className="text-sm text-[var(--text-primary)] mt-2">{alert.text}</p>
              </div>
            ))}
          </div>
        </WidgetWrapper>
      </div>
    </div>
  );
}
