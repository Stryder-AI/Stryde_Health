import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  User,
  Stethoscope,
  FlaskConical,
  Droplets,
  Play,
  Ban,
  Search,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────

interface LabOrder {
  id: string;
  patient: string;
  mrn: string;
  doctor: string;
  orderTime: string;
  tests: string[];
  sampleType: 'Blood' | 'Urine' | 'Serum' | 'Swab';
  priority: 'urgent' | 'normal';
  paymentStatus: 'paid' | 'unpaid';
}

// ─── Demo Data ─────────────────────────────────────────────────────────────

const demoOrders: LabOrder[] = [
  // Urgent orders
  { id: 'ORD-3045', patient: 'Mohammad Irfan', mrn: 'MR-10412', doctor: 'Dr. Sarah Ali', orderTime: '08:12 AM', tests: ['CBC', 'ESR', 'Blood Glucose (Fasting)'], sampleType: 'Blood', priority: 'urgent', paymentStatus: 'paid' },
  { id: 'ORD-3042', patient: 'Amina Khatoon', mrn: 'MR-10389', doctor: 'Dr. Kamran Javed', orderTime: '07:45 AM', tests: ['Liver Function Test', 'Renal Function Test'], sampleType: 'Blood', priority: 'urgent', paymentStatus: 'paid' },
  { id: 'ORD-3040', patient: 'Rashid Mehmood', mrn: 'MR-10401', doctor: 'Dr. Ayesha Malik', orderTime: '07:30 AM', tests: ['Troponin I', 'D-Dimer', 'CBC'], sampleType: 'Blood', priority: 'urgent', paymentStatus: 'unpaid' },
  { id: 'ORD-3038', patient: 'Bushra Naz', mrn: 'MR-10378', doctor: 'Dr. Imran Shah', orderTime: '07:15 AM', tests: ['Blood Culture', 'CBC'], sampleType: 'Blood', priority: 'urgent', paymentStatus: 'paid' },
  // Normal orders
  { id: 'ORD-3044', patient: 'Khalid Mahmood', mrn: 'MR-10405', doctor: 'Dr. Bilal Ahmed', orderTime: '08:05 AM', tests: ['Lipid Profile'], sampleType: 'Serum', priority: 'normal', paymentStatus: 'paid' },
  { id: 'ORD-3043', patient: 'Sadia Parveen', mrn: 'MR-10398', doctor: 'Dr. Sarah Ali', orderTime: '07:58 AM', tests: ['Thyroid Panel (T3, T4, TSH)'], sampleType: 'Blood', priority: 'normal', paymentStatus: 'paid' },
  { id: 'ORD-3041', patient: 'Farhan Ali', mrn: 'MR-10392', doctor: 'Dr. Kamran Javed', orderTime: '07:40 AM', tests: ['Urinalysis', 'Urine Culture'], sampleType: 'Urine', priority: 'normal', paymentStatus: 'unpaid' },
  { id: 'ORD-3039', patient: 'Rabia Aslam', mrn: 'MR-10385', doctor: 'Dr. Ayesha Malik', orderTime: '07:25 AM', tests: ['CBC', 'HbA1c'], sampleType: 'Blood', priority: 'normal', paymentStatus: 'paid' },
  { id: 'ORD-3037', patient: 'Naveed Akhtar', mrn: 'MR-10372', doctor: 'Dr. Bilal Ahmed', orderTime: '07:10 AM', tests: ['Lipid Profile', 'Blood Glucose (Random)'], sampleType: 'Blood', priority: 'normal', paymentStatus: 'paid' },
  { id: 'ORD-3036', patient: 'Nusrat Jahan', mrn: 'MR-10365', doctor: 'Dr. Imran Shah', orderTime: '06:55 AM', tests: ['Vitamin D', 'Calcium', 'Phosphorus'], sampleType: 'Serum', priority: 'normal', paymentStatus: 'paid' },
  { id: 'ORD-3035', patient: 'Waqar Younis', mrn: 'MR-10359', doctor: 'Dr. Sarah Ali', orderTime: '06:40 AM', tests: ['Complete Urine Examination'], sampleType: 'Urine', priority: 'normal', paymentStatus: 'unpaid' },
];

const sampleColors: Record<string, string> = {
  Blood: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Urine: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Serum: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Swab: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

// ─── Order Card ────────────────────────────────────────────────────────────

function OrderCard({ order, index, onAccepted }: { order: LabOrder; index: number; onAccepted?: (id: string) => void }) {
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const isPaid = order.paymentStatus === 'paid';

  const handleAccept = () => {
    setAccepting(true);
    setTimeout(() => {
      toast.success(`Order ${order.id} accepted for processing`, 'Order Accepted');
      setAccepting(false);
      setAccepted(true);
      onAccepted?.(order.id);
    }, 800);
  };

  if (accepted) return null;

  return (
    <div
      className={cn(
        'glass-card p-5 transition-all duration-500 group relative overflow-hidden',
        !isPaid && 'opacity-60 grayscale-[30%]',
        order.priority === 'urgent' && isPaid && 'ring-1 ring-red-300/50 dark:ring-red-800/50'
      )}
      style={{
        animationDelay: `${index * 60}ms`,
        animation: 'fadeInUp 0.4s ease forwards',
        opacity: 0,
      }}
    >
      {/* Urgent indicator stripe */}
      {order.priority === 'urgent' && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-400 rounded-l" />
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Left content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Patient row */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                order.priority === 'urgent'
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-[var(--primary-light)]'
              )}>
                <User className={cn('w-4 h-4', order.priority === 'urgent' ? 'text-red-600 dark:text-red-400' : 'text-[var(--primary)]')} />
              </div>
              <div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {order.patient}
                </span>
                <span className="text-xs text-[var(--text-tertiary)] ml-2">{order.mrn}</span>
              </div>
            </div>
            {order.priority === 'urgent' && (
              <Badge variant="danger" className="text-[10px] animate-pulse-soft">
                <AlertTriangle className="w-3 h-3 mr-1" /> URGENT
              </Badge>
            )}
          </div>

          {/* Doctor + Time */}
          <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              {order.doctor}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              {order.orderTime}
            </span>
          </div>

          {/* Tests */}
          <div className="flex items-start gap-2">
            <FlaskConical className="w-3.5 h-3.5 text-[var(--text-tertiary)] mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {order.tests.map((test) => (
                <span
                  key={test}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--surface-border)]"
                >
                  {test}
                </span>
              ))}
            </div>
          </div>

          {/* Sample type */}
          <div className="flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold', sampleColors[order.sampleType])}>
              {order.sampleType}
            </span>
          </div>
        </div>

        {/* Right action */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{order.id}</span>
          {isPaid ? (
            <Button
              size="sm"
              variant={order.priority === 'urgent' ? 'primary' : 'secondary'}
              loading={accepting}
              onClick={handleAccept}
            >
              <Play className="w-3.5 h-3.5" />
              Accept & Process
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <Ban className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
              <span className="text-xs font-medium text-[var(--text-tertiary)]">Awaiting Payment</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function PendingOrders() {
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const filteredOrders = demoOrders.filter(
    (o) =>
      o.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.tests.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const urgentOrders = filteredOrders.filter((o) => o.priority === 'urgent');
  const normalOrders = filteredOrders.filter((o) => o.priority === 'normal');

  return (
    <div className={`space-y-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Inline keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Pending Orders
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {filteredOrders.length} orders in queue &middot; {urgentOrders.length} urgent
          </p>
        </div>
        <div className="w-72">
          <Input
            placeholder="Search patient, MR#, or test..."
            icon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Urgent Section */}
      {urgentOrders.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Urgent Priority
              </span>
            </div>
            <div className="flex-1 h-px bg-red-200 dark:bg-red-900/30" />
            <span className="text-xs text-[var(--text-tertiary)]">{urgentOrders.length} orders</span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {urgentOrders.map((order, i) => (
              <OrderCard key={order.id} order={order} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Normal Section */}
      {normalOrders.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)]">
              <FlaskConical className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Normal Priority
              </span>
            </div>
            <div className="flex-1 h-px bg-[var(--surface-border)]" />
            <span className="text-xs text-[var(--text-tertiary)]">{normalOrders.length} orders</span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {normalOrders.map((order, i) => (
              <OrderCard key={order.id} order={order} index={i + urgentOrders.length} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredOrders.length === 0 && (
        <EmptyState
          type="no-orders"
          title="No pending orders"
          description={searchQuery ? 'No orders match your current search. Try different keywords or clear the search.' : 'All orders have been processed. New orders from doctors will appear here automatically.'}
          size="md"
        />
      )}
    </div>
  );
}
