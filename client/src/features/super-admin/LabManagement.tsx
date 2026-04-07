import { useState } from 'react';
import {
  FlaskConical, Clock, CheckCircle, Loader2, Search,
  Eye, ToggleLeft, ToggleRight, TestTubes, BarChart3, Users,
} from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { toast } from '@/components/ui/Toast';

type LabOrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type PaymentStatus = 'paid' | 'unpaid' | 'partial';
type LabPriority = 'routine' | 'urgent' | 'stat';

interface LabOrder {
  id: string;
  patientName: string;
  mrNumber: string;
  doctorName: string;
  tests: string[];
  priority: LabPriority;
  paymentStatus: PaymentStatus;
  status: LabOrderStatus;
  date: string;
  amount: number;
}

interface TestTemplate {
  id: string;
  name: string;
  category: string;
  parameters: number;
  sampleType: string;
  turnaroundTime: string;
  price: number;
  active: boolean;
}

const demoOrders: LabOrder[] = [
  { id: 'L-001', patientName: 'Ahmad Khan', mrNumber: 'MR-2026-00001', doctorName: 'Dr. Tariq Ahmed', tests: ['CBC', 'Lipid Profile', 'HbA1c'], priority: 'urgent', paymentStatus: 'paid', status: 'completed', date: '2026-03-29', amount: 3200 },
  { id: 'L-002', patientName: 'Fatima Bibi', mrNumber: 'MR-2026-00002', doctorName: 'Dr. Saira Khan', tests: ['CBC', 'Urine R/E'], priority: 'routine', paymentStatus: 'paid', status: 'completed', date: '2026-03-29', amount: 1200 },
  { id: 'L-003', patientName: 'Muhammad Usman', mrNumber: 'MR-2026-00003', doctorName: 'Dr. Tariq Ahmed', tests: ['Lipid Profile', 'LFTs'], priority: 'routine', paymentStatus: 'paid', status: 'completed', date: '2026-03-29', amount: 2400 },
  { id: 'L-004', patientName: 'Hassan Mahmood', mrNumber: 'MR-2026-00005', doctorName: 'Dr. Imran Malik', tests: ['RFTs', 'Serum Uric Acid', 'ESR'], priority: 'urgent', paymentStatus: 'paid', status: 'completed', date: '2026-03-29', amount: 2800 },
  { id: 'L-005', patientName: 'Ayesha Siddiqui', mrNumber: 'MR-2026-00006', doctorName: 'Dr. Amna Rashid', tests: ['Thyroid Profile'], priority: 'routine', paymentStatus: 'paid', status: 'completed', date: '2026-03-29', amount: 1800 },
  { id: 'L-006', patientName: 'Zainab Akhtar', mrNumber: 'MR-2026-00008', doctorName: 'Dr. Saira Khan', tests: ['CBC', 'Serum Iron', 'Ferritin'], priority: 'routine', paymentStatus: 'paid', status: 'completed', date: '2026-03-29', amount: 2600 },
  { id: 'L-007', patientName: 'Tariq Mehmood', mrNumber: 'MR-2026-00009', doctorName: 'Dr. Tariq Ahmed', tests: ['HbA1c', 'RFTs', 'Fasting Glucose'], priority: 'urgent', paymentStatus: 'paid', status: 'in_progress', date: '2026-03-29', amount: 2200 },
  { id: 'L-008', patientName: 'Imran Hussain', mrNumber: 'MR-2026-00011', doctorName: 'Dr. Imran Malik', tests: ['Serum Uric Acid', 'CRP'], priority: 'routine', paymentStatus: 'partial', status: 'in_progress', date: '2026-03-29', amount: 1600 },
  { id: 'L-009', patientName: 'Nadia Pervez', mrNumber: 'MR-2026-00012', doctorName: 'Dr. Amna Rashid', tests: ['CBC', 'ESR', 'Rheumatoid Factor'], priority: 'routine', paymentStatus: 'paid', status: 'in_progress', date: '2026-03-29', amount: 2400 },
  { id: 'L-010', patientName: 'Waqas Ahmed', mrNumber: 'MR-2026-00015', doctorName: 'Dr. Tariq Ahmed', tests: ['RFTs', 'Electrolytes', 'CBC', 'Urine R/E'], priority: 'stat', paymentStatus: 'unpaid', status: 'in_progress', date: '2026-03-29', amount: 3600 },
  { id: 'L-011', patientName: 'Saba Malik', mrNumber: 'MR-2026-00014', doctorName: 'Dr. Saira Khan', tests: ['Fasting Glucose', 'Insulin Levels'], priority: 'routine', paymentStatus: 'paid', status: 'pending', date: '2026-03-29', amount: 1800 },
  { id: 'L-012', patientName: 'Rabia Aslam', mrNumber: 'MR-2026-00010', doctorName: 'Dr. Nadia Zafar', tests: ['CBC'], priority: 'routine', paymentStatus: 'paid', status: 'pending', date: '2026-03-29', amount: 600 },
  { id: 'L-013', patientName: 'Bilal Shah', mrNumber: 'MR-2026-00007', doctorName: 'Dr. Faisal Iqbal', tests: ['Throat Culture'], priority: 'routine', paymentStatus: 'unpaid', status: 'pending', date: '2026-03-29', amount: 1200 },
  { id: 'L-014', patientName: 'Farhan Raza', mrNumber: 'MR-2026-00013', doctorName: 'Dr. Faisal Iqbal', tests: ['CBC', 'CRP'], priority: 'routine', paymentStatus: 'paid', status: 'pending', date: '2026-03-29', amount: 1400 },
  { id: 'L-015', patientName: 'Saima Noor', mrNumber: 'MR-2026-00004', doctorName: 'Dr. Saira Khan', tests: ['Pulmonary Function Test'], priority: 'urgent', paymentStatus: 'partial', status: 'pending', date: '2026-03-29', amount: 2000 },
];

const demoTemplates: TestTemplate[] = [
  { id: 'T-01', name: 'Complete Blood Count (CBC)', category: 'Hematology', parameters: 18, sampleType: 'EDTA Blood', turnaroundTime: '2 hours', price: 600, active: true },
  { id: 'T-02', name: 'Lipid Profile', category: 'Biochemistry', parameters: 6, sampleType: 'Serum', turnaroundTime: '4 hours', price: 1200, active: true },
  { id: 'T-03', name: 'Liver Function Tests (LFTs)', category: 'Biochemistry', parameters: 8, sampleType: 'Serum', turnaroundTime: '4 hours', price: 1400, active: true },
  { id: 'T-04', name: 'Renal Function Tests (RFTs)', category: 'Biochemistry', parameters: 5, sampleType: 'Serum', turnaroundTime: '4 hours', price: 1000, active: true },
  { id: 'T-05', name: 'Thyroid Profile (T3, T4, TSH)', category: 'Immunology', parameters: 3, sampleType: 'Serum', turnaroundTime: '6 hours', price: 1800, active: true },
  { id: 'T-06', name: 'HbA1c', category: 'Biochemistry', parameters: 1, sampleType: 'EDTA Blood', turnaroundTime: '3 hours', price: 800, active: true },
  { id: 'T-07', name: 'Urine Routine Examination', category: 'Urinalysis', parameters: 12, sampleType: 'Urine', turnaroundTime: '1 hour', price: 400, active: true },
  { id: 'T-08', name: 'Fasting Blood Glucose', category: 'Biochemistry', parameters: 1, sampleType: 'Fluoride Blood', turnaroundTime: '1 hour', price: 300, active: true },
  { id: 'T-09', name: 'ESR (Erythrocyte Sedimentation Rate)', category: 'Hematology', parameters: 1, sampleType: 'Citrate Blood', turnaroundTime: '2 hours', price: 300, active: true },
  { id: 'T-10', name: 'C-Reactive Protein (CRP)', category: 'Immunology', parameters: 1, sampleType: 'Serum', turnaroundTime: '3 hours', price: 800, active: true },
  { id: 'T-11', name: 'Serum Electrolytes', category: 'Biochemistry', parameters: 4, sampleType: 'Serum', turnaroundTime: '2 hours', price: 800, active: true },
  { id: 'T-12', name: 'Rheumatoid Factor', category: 'Immunology', parameters: 1, sampleType: 'Serum', turnaroundTime: '4 hours', price: 600, active: false },
];

const categoryColors: Record<string, string> = {
  Hematology: 'bg-red-500/10 text-red-600',
  Biochemistry: 'bg-blue-500/10 text-blue-600',
  Immunology: 'bg-purple-500/10 text-purple-600',
  Urinalysis: 'bg-amber-500/10 text-amber-600',
};

const statusBadge: Record<LabOrderStatus, { variant: 'waiting' | 'in_progress' | 'completed' | 'cancelled'; label: string }> = {
  pending: { variant: 'waiting', label: 'Pending' },
  in_progress: { variant: 'in_progress', label: 'In Progress' },
  completed: { variant: 'completed', label: 'Completed' },
  cancelled: { variant: 'cancelled', label: 'Cancelled' },
};

const paymentBadge: Record<PaymentStatus, { variant: 'completed' | 'cancelled' | 'waiting'; label: string }> = {
  paid: { variant: 'completed', label: 'Paid' },
  unpaid: { variant: 'cancelled', label: 'Unpaid' },
  partial: { variant: 'waiting', label: 'Partial' },
};

const priorityBadge: Record<LabPriority, { variant: 'default' | 'warning' | 'danger'; label: string }> = {
  routine: { variant: 'default', label: 'Routine' },
  urgent: { variant: 'warning', label: 'Urgent' },
  stat: { variant: 'danger', label: 'STAT' },
};

// Performance data
const testsByCategory = [
  { category: 'Biochemistry', count: 28, color: 'bg-blue-500' },
  { category: 'Hematology', count: 18, color: 'bg-red-500' },
  { category: 'Immunology', count: 8, color: 'bg-purple-500' },
  { category: 'Urinalysis', count: 5, color: 'bg-amber-500' },
];

const busiestHours = [
  { hour: '9 AM', count: 8 },
  { hour: '10 AM', count: 14 },
  { hour: '11 AM', count: 18 },
  { hour: '12 PM', count: 12 },
  { hour: '1 PM', count: 9 },
  { hour: '2 PM', count: 6 },
  { hour: '3 PM', count: 4 },
];

const technicianStats = [
  { name: 'Hamza Ali', testsCompleted: 24, avgTime: '2.1 hrs', accuracy: '99.2%' },
  { name: 'Bilal Shah', testsCompleted: 18, avgTime: '2.4 hrs', accuracy: '98.8%' },
  { name: 'Sana Rashid', testsCompleted: 15, avgTime: '1.9 hrs', accuracy: '99.5%' },
];

type Tab = 'orders' | 'templates' | 'performance';

export function LabManagement() {
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [search, setSearch] = useState('');
  const [templates, setTemplates] = useState(demoTemplates);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);

  const pendingOrders = demoOrders.filter((o) => o.status === 'pending').length;
  const inProgressOrders = demoOrders.filter((o) => o.status === 'in_progress').length;
  const completedToday = demoOrders.filter((o) => o.status === 'completed').length;

  const filteredOrders = demoOrders.filter((o) =>
    o.patientName.toLowerCase().includes(search.toLowerCase()) ||
    o.mrNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.doctorName.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  );

  const toggleTemplate = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
    toast.success('Template status updated');
  };

  const tabs: { key: Tab; label: string; icon: typeof FlaskConical }[] = [
    { key: 'orders', label: 'Orders', icon: FlaskConical },
    { key: 'templates', label: 'Templates', icon: TestTubes },
    { key: 'performance', label: 'Performance', icon: BarChart3 },
  ];

  const maxHourCount = Math.max(...busiestHours.map((h) => h.count));
  const maxCategoryCount = Math.max(...testsByCategory.map((c) => c.count));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Lab Management</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Oversee lab orders, test templates, and performance</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <MetricCard title="Pending Orders" value={pendingOrders} icon={Clock} subtitle="Awaiting processing" iconColor="bg-amber-500/10 text-amber-500" />
        <MetricCard title="In Progress" value={inProgressOrders} icon={Loader2} subtitle="Currently processing" iconColor="bg-blue-500/10 text-blue-500" />
        <MetricCard title="Completed Today" value={completedToday} icon={CheckCircle} trend={{ value: 15, positive: true }} iconColor="bg-emerald-500/10 text-emerald-500" />
        <MetricCard title="Avg Turnaround" value="2.8 hrs" icon={FlaskConical} subtitle="From order to report" iconColor="bg-purple-500/10 text-purple-500" />
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)] w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-xs)] text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fade-in">
          <div className="max-w-sm">
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Tests</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <span className="font-mono text-xs font-bold text-[var(--primary)]">{order.id}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-semibold text-sm">{order.patientName}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{order.mrNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-sm">{order.doctorName}</span></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {order.tests.slice(0, 2).map((t) => (
                        <Badge key={t} variant="default">{t}</Badge>
                      ))}
                      {order.tests.length > 2 && (
                        <Badge variant="info">+{order.tests.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityBadge[order.priority].variant}>
                      {priorityBadge[order.priority].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={paymentBadge[order.paymentStatus].variant}>
                      {paymentBadge[order.paymentStatus].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadge[order.status].variant} dot>
                      {statusBadge[order.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell><span className="text-xs text-[var(--text-secondary)]">{order.date}</span></TableCell>
                  <TableCell>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-[var(--primary)]" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in stagger-children">
          {templates.map((template) => (
            <Card key={template.id} hover className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{template.name}</h3>
                  <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${categoryColors[template.category] || 'bg-gray-100 text-gray-600'}`}>
                    {template.category}
                  </span>
                </div>
                <button
                  onClick={() => toggleTemplate(template.id)}
                  className="p-1 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors shrink-0"
                  title={template.active ? 'Deactivate' : 'Activate'}
                >
                  {template.active
                    ? <ToggleRight className="w-6 h-6 text-[var(--success)]" />
                    : <ToggleLeft className="w-6 h-6 text-[var(--text-tertiary)]" />
                  }
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">Parameters</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{template.parameters}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">Sample</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{template.sampleType}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">Turnaround</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{template.turnaroundTime}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">Price</p>
                  <p className="text-sm font-bold text-[var(--primary)]">Rs. {template.price.toLocaleString()}</p>
                </div>
              </div>
              {!template.active && (
                <div className="mt-3 p-2 rounded-[var(--radius-xs)] bg-[var(--danger-bg)] text-center">
                  <span className="text-xs font-semibold text-red-600">Inactive</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Tests by Category */}
          <Card hover={false} className="p-6">
            <CardTitle>Tests by Category</CardTitle>
            <p className="text-sm text-[var(--text-secondary)] mb-5">Distribution of tests processed today</p>
            <div className="space-y-4">
              {testsByCategory.map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{cat.category}</span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{cat.count}</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[var(--surface)] border border-[var(--surface-border)] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cat.color} transition-all duration-700 ease-out`}
                      style={{ width: `${(cat.count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Busiest Hours */}
          <Card hover={false} className="p-6">
            <CardTitle>Busiest Hours</CardTitle>
            <p className="text-sm text-[var(--text-secondary)] mb-5">Lab order volume by hour</p>
            <div className="flex items-end gap-3 h-48">
              {busiestHours.map((h) => (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[11px] font-semibold text-[var(--text-secondary)]">{h.count}</span>
                  <div className="w-full relative rounded-t-lg overflow-hidden bg-[var(--surface)] border border-[var(--surface-border)]" style={{ height: '100%' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--primary)] to-[var(--accent)] rounded-t-lg transition-all duration-700 ease-out"
                      style={{ height: `${(h.count / maxHourCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-[var(--text-tertiary)]">{h.hour}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Technician Stats */}
          <Card hover={false} className="lg:col-span-2 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[var(--primary)]" />
              <CardTitle>Technician Performance</CardTitle>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {technicianStats.map((tech) => (
                <div key={tech.name} className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)] hover:border-[var(--surface-border-hover)] transition-all duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-sm font-semibold">
                      {tech.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{tech.name}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">Tests</p>
                      <p className="text-lg font-bold text-[var(--text-primary)]">{tech.testsCompleted}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">Avg Time</p>
                      <p className="text-lg font-bold text-[var(--text-primary)]">{tech.avgTime}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wider">Accuracy</p>
                      <p className="text-lg font-bold text-emerald-600">{tech.accuracy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal open={true} onClose={() => setSelectedOrder(null)} title={`Lab Order — ${selectedOrder.id}`} size="md">
          <div className="space-y-5">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={statusBadge[selectedOrder.status].variant} dot>
                {statusBadge[selectedOrder.status].label}
              </Badge>
              <Badge variant={priorityBadge[selectedOrder.priority].variant}>
                {priorityBadge[selectedOrder.priority].label}
              </Badge>
              <Badge variant={paymentBadge[selectedOrder.paymentStatus].variant}>
                {paymentBadge[selectedOrder.paymentStatus].label}
              </Badge>
            </div>

            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Patient</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Name</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{selectedOrder.patientName}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">MR#</p>
                  <p className="text-sm font-mono font-semibold text-[var(--primary)]">{selectedOrder.mrNumber}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Ordered By</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{selectedOrder.doctorName}</p>
            </div>

            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Tests Ordered</p>
              <div className="flex flex-wrap gap-2">
                {selectedOrder.tests.map((t) => (
                  <Badge key={t} variant="info">{t}</Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <span className="text-sm text-[var(--text-secondary)]">Total Amount</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">Rs. {selectedOrder.amount.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setSelectedOrder(null)}>Close</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
