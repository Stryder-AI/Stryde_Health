import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Timer,
  ArrowRight,
  FileText,
  User,
  Stethoscope,
  TrendingUp,
} from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/shared/StatusBadge';

// ─── Demo Data ─────────────────────────────────────────────────────────────

const recentReports = [
  { id: 'RPT-2026-0451', patient: 'Ahmed Khan', mrn: 'MR-10234', test: 'Complete Blood Count', doctor: 'Dr. Sarah Ali', completedAt: '10:45 AM', status: 'completed' as const, urgent: false },
  { id: 'RPT-2026-0450', patient: 'Fatima Noor', mrn: 'MR-10189', test: 'Lipid Profile', doctor: 'Dr. Imran Shah', completedAt: '10:22 AM', status: 'completed' as const, urgent: false },
  { id: 'RPT-2026-0449', patient: 'Ali Raza', mrn: 'MR-10301', test: 'Liver Function Test', doctor: 'Dr. Ayesha Malik', completedAt: '09:58 AM', status: 'completed' as const, urgent: true },
  { id: 'RPT-2026-0448', patient: 'Zainab Bibi', mrn: 'MR-10156', test: 'Thyroid Panel', doctor: 'Dr. Kamran Javed', completedAt: '09:31 AM', status: 'completed' as const, urgent: false },
  { id: 'RPT-2026-0447', patient: 'Hassan Mehmood', mrn: 'MR-10278', test: 'Renal Function Test', doctor: 'Dr. Sarah Ali', completedAt: '09:12 AM', status: 'completed' as const, urgent: true },
  { id: 'RPT-2026-0446', patient: 'Saima Akram', mrn: 'MR-10345', test: 'Urinalysis', doctor: 'Dr. Bilal Ahmed', completedAt: '08:47 AM', status: 'completed' as const, urgent: false },
];

const activeOrders = [
  { id: 'ORD-3021', patient: 'Tariq Hussain', test: 'CBC', stage: 'Collection', progress: 25 },
  { id: 'ORD-3019', patient: 'Nadia Perveen', test: 'LFT', stage: 'Processing', progress: 60 },
  { id: 'ORD-3017', patient: 'Usman Ghani', test: 'Lipid Profile', stage: 'Analysis', progress: 85 },
];

// ─── Component ─────────────────────────────────────────────────────────────

export function Dashboard() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`space-y-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Lab Dashboard
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Overview of laboratory operations &mdash; {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Pending Orders', value: 18, icon: FlaskConical, subtitle: '6 urgent', iconColor: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', trend: { value: 12, positive: false } },
          { title: 'In Progress', value: 7, icon: Clock, subtitle: '3 samples processing', iconColor: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
          { title: 'Completed Today', value: 43, icon: CheckCircle2, subtitle: 'Out of 68 orders', iconColor: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', trend: { value: 8, positive: true } },
          { title: 'Urgent Orders', value: 6, icon: AlertTriangle, subtitle: '2 critical', iconColor: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
          { title: 'Average TAT', value: '47m', icon: Timer, subtitle: 'Target: 60 min', iconColor: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', trend: { value: 15, positive: true } },
        ].map((metric, i) => (
          <div
            key={metric.title}
            className="transition-all duration-500"
            style={{ transitionDelay: `${i * 80}ms`, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)' }}
          >
            <MetricCard {...metric} />
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports - 2/3 width */}
        <Card hover={false} className="lg:col-span-2 p-0" style={{ transitionDelay: '400ms', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.5s ease' }}>
          <CardHeader className="px-6 pt-6 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Completed Reports</CardTitle>
                <CardDescription>Latest results submitted today</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/lab/completed')}>
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 mt-4">
            <div className="space-y-1">
              {recentReports.map((report, i) => (
                <div
                  key={report.id}
                  className="flex items-center gap-4 px-4 py-3 rounded-[var(--radius-sm)] hover:bg-[var(--surface-hover)] transition-all duration-200 group cursor-pointer"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--success-bg)] flex items-center justify-center">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {report.patient}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)]">{report.mrn}</span>
                      {report.urgent && (
                        <Badge variant="danger" className="text-[10px] px-1.5 py-0.5">URGENT</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[var(--text-secondary)]">{report.test}</span>
                      <span className="text-[var(--text-tertiary)]">&middot;</span>
                      <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" /> {report.doctor}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--text-tertiary)]">{report.completedAt}</span>
                    <StatusBadge status={report.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Processing */}
        <Card hover={false} className="p-0" style={{ transitionDelay: '500ms', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.5s ease' }}>
          <CardHeader className="px-6 pt-6 pb-0">
            <CardTitle>Active Processing</CardTitle>
            <CardDescription>Samples currently in the pipeline</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 mt-4">
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="glass-card-static p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{order.patient}</p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{order.id} &middot; {order.test}</p>
                    </div>
                    <Badge variant="in_progress" dot>{order.stage}</Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                      <span>Progress</span>
                      <span className="font-semibold">{order.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--surface)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-teal-400 transition-all duration-1000 ease-out"
                        style={{ width: `${order.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-5 border-t border-[var(--surface-border)]">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Today's Stats</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Samples Collected', val: '52' },
                  { label: 'Reports Verified', val: '43' },
                  { label: 'Avg Wait Time', val: '12m' },
                  { label: 'Rejection Rate', val: '2.1%' },
                ].map((s) => (
                  <div key={s.label} className="text-center p-2 rounded-[var(--radius-xs)] bg-[var(--surface)]">
                    <p className="text-lg font-bold text-[var(--text-primary)]">{s.val}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
