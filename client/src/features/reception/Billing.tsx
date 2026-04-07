import { useState, useMemo } from 'react';
import {
  Search,
  Receipt,
  CreditCard,
  Banknote,
  Printer,
  User,
  CheckCircle2,
  UserSearch,
  ListChecks,
  BadgeCheck,
  FileText,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { QRCode } from '@/components/ui/QRCode';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Demo Data                                                         */
/* ------------------------------------------------------------------ */

interface PendingItem {
  id: string;
  description: string;
  category: string;
  amount: number;
}

interface PatientBill {
  mr: string;
  name: string;
  phone: string;
  doctor: string;
  department: string;
  token: string;
  items: PendingItem[];
}

const demoPatients: Record<string, PatientBill> = {
  'MR-10234': {
    mr: 'MR-10234',
    name: 'Ahmed Raza',
    phone: '0321-5551234',
    doctor: 'Dr. Farhan Sheikh',
    department: 'Cardiology',
    token: 'T-001',
    items: [
      { id: '1', description: 'Consultation Fee — Cardiology', category: 'Consultation', amount: 3000 },
      { id: '2', description: 'ECG Test', category: 'Lab', amount: 1500 },
      { id: '3', description: 'Echocardiography', category: 'Lab', amount: 5000 },
      { id: '4', description: 'Amlodipine 5mg (30 tabs)', category: 'Medicine', amount: 450 },
      { id: '5', description: 'Aspirin 75mg (30 tabs)', category: 'Medicine', amount: 200 },
    ],
  },
  'MR-10236': {
    mr: 'MR-10236',
    name: 'Usman Tariq',
    phone: '0333-9014567',
    doctor: 'Dr. Asif Javed',
    department: 'Orthopedics',
    token: 'T-003',
    items: [
      { id: '1', description: 'Consultation Fee — Orthopedics', category: 'Consultation', amount: 2500 },
      { id: '2', description: 'X-Ray (Knee AP/Lateral)', category: 'Lab', amount: 2000 },
      { id: '3', description: 'Diclofenac 50mg (20 tabs)', category: 'Medicine', amount: 350 },
      { id: '4', description: 'Calcium + Vitamin D (30 tabs)', category: 'Medicine', amount: 600 },
    ],
  },
  'MR-10237': {
    mr: 'MR-10237',
    name: 'Ayesha Noor',
    phone: '0345-8901234',
    doctor: 'Dr. Farhan Sheikh',
    department: 'Cardiology',
    token: 'T-004',
    items: [
      { id: '1', description: 'Consultation Fee — Cardiology', category: 'Consultation', amount: 3000 },
      { id: '2', description: 'Complete Blood Count (CBC)', category: 'Lab', amount: 800 },
      { id: '3', description: 'Thyroid Profile (T3, T4, TSH)', category: 'Lab', amount: 2500 },
      { id: '4', description: 'Thyroxine 50mcg (30 tabs)', category: 'Medicine', amount: 380 },
    ],
  },
};

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'easypaisa', label: 'EasyPaisa / JazzCash' },
  { value: 'credit', label: 'Credit / Debit Card' },
  { value: 'cheque', label: 'Cheque' },
];

/* ------------------------------------------------------------------ */
/*  Billing Timeline                                                  */
/* ------------------------------------------------------------------ */

type BillingStep = 'patient_found' | 'items_selected' | 'payment_processed' | 'receipt_printed';
type StepStatus = 'pending' | 'active' | 'complete';

interface TimelineStep {
  key: BillingStep;
  label: string;
  icon: React.ReactNode;
}

const timelineSteps: TimelineStep[] = [
  { key: 'patient_found', label: 'Patient Found', icon: <UserSearch className="w-4 h-4" /> },
  { key: 'items_selected', label: 'Items Selected', icon: <ListChecks className="w-4 h-4" /> },
  { key: 'payment_processed', label: 'Payment Processed', icon: <BadgeCheck className="w-4 h-4" /> },
  { key: 'receipt_printed', label: 'Receipt Printed', icon: <FileText className="w-4 h-4" /> },
];

function getStepStatus(stepKey: BillingStep, activeStep: BillingStep): StepStatus {
  const order: BillingStep[] = ['patient_found', 'items_selected', 'payment_processed', 'receipt_printed'];
  const stepIdx = order.indexOf(stepKey);
  const activeIdx = order.indexOf(activeStep);
  if (stepIdx < activeIdx) return 'complete';
  if (stepIdx === activeIdx) return 'active';
  return 'pending';
}

function BillingTimeline({ activeStep }: { activeStep: BillingStep }) {
  const order: BillingStep[] = ['patient_found', 'items_selected', 'payment_processed', 'receipt_printed'];
  const activeIdx = order.indexOf(activeStep);

  return (
    <div className="relative flex items-center justify-between px-2 py-4">
      {/* Background connecting line */}
      <div className="absolute left-[calc(12.5%)] right-[calc(12.5%)] top-1/2 -translate-y-1/2 h-1 bg-[var(--surface-border)] rounded-full overflow-hidden">
        {/* Filled progress line */}
        <div
          className="h-full bg-[var(--primary)] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${(activeIdx / (order.length - 1)) * 100}%` }}
        />
      </div>

      {timelineSteps.map((step, idx) => {
        const status = getStepStatus(step.key, activeStep);
        return (
          <div key={step.key} className="relative flex flex-col items-center gap-2 z-10" style={{ flex: '1' }}>
            {/* Step circle */}
            <div
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500',
                status === 'complete' && 'bg-[var(--primary)] border-[var(--primary)] text-white',
                status === 'active' && 'bg-[var(--primary-light)] border-[var(--primary)] text-[var(--primary)] billing-step-pulse',
                status === 'pending' && 'bg-[var(--surface)] border-[var(--surface-border)] text-[var(--text-tertiary)]',
              )}
            >
              {status === 'complete' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                step.icon
              )}
            </div>
            {/* Label */}
            <span
              className={cn(
                'text-[11px] font-medium text-center leading-tight transition-colors duration-300',
                status === 'complete' && 'text-[var(--primary)]',
                status === 'active' && 'text-[var(--text-primary)]',
                status === 'pending' && 'text-[var(--text-tertiary)]',
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}

      <style>{`
        @keyframes billingPulse {
          0%, 100% { box-shadow: 0 0 0 0 var(--primary-glow); }
          50% { box-shadow: 0 0 0 6px transparent; }
        }
        .billing-step-pulse {
          animation: billingPulse 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function Billing() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientBill | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [loading, setLoading] = useState(false);

  // Billing timeline state
  const [billingStep, setBillingStep] = useState<BillingStep>('patient_found');

  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

  // Search patient
  const handleSearch = () => {
    const q = searchQuery.trim().toUpperCase();
    const found = Object.values(demoPatients).find(
      (p) => p.mr.toUpperCase() === q || p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    if (found) {
      setSelectedPatient(found);
      setCheckedItems({});
      setAmountReceived('');
      setBillingStep('patient_found');
    } else {
      toast.warning('No patient found with that MR# or name.');
    }
  };

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      // Advance to step 2 if any items are checked
      const anyChecked = Object.values(next).some(Boolean);
      if (anyChecked && billingStep === 'patient_found') {
        setBillingStep('items_selected');
      } else if (!anyChecked && billingStep === 'items_selected') {
        setBillingStep('patient_found');
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (!selectedPatient) return;
    const allChecked = selectedPatient.items.every((i) => checkedItems[i.id]);
    const next: Record<string, boolean> = {};
    selectedPatient.items.forEach((i) => { next[i.id] = !allChecked; });
    setCheckedItems(next);
    const anyChecked = !allChecked;
    if (anyChecked && billingStep === 'patient_found') setBillingStep('items_selected');
    else if (!anyChecked && billingStep === 'items_selected') setBillingStep('patient_found');
  };

  const selectedTotal = useMemo(() => {
    if (!selectedPatient) return 0;
    return selectedPatient.items
      .filter((i) => checkedItems[i.id])
      .reduce((sum, i) => sum + i.amount, 0);
  }, [selectedPatient, checkedItems]);

  const change = useMemo(() => {
    const recv = parseFloat(amountReceived) || 0;
    return Math.max(0, recv - selectedTotal);
  }, [amountReceived, selectedTotal]);

  const handleCollect = async () => {
    if (selectedTotal === 0) {
      toast.warning('Please select at least one item to collect payment.');
      return;
    }

    const methodLabel = paymentMethods.find((m) => m.value === paymentMethod)?.label ?? paymentMethod;
    const ok = await confirm({
      title: 'Confirm Payment',
      message: `Collect Rs. ${selectedTotal.toLocaleString()} via ${methodLabel}? This action cannot be undone.`,
      confirmText: 'Collect Payment',
      cancelText: 'Cancel',
      variant: 'info',
    });

    if (!ok) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setBillingStep('payment_processed');
      toast.success(
        `Payment of Rs. ${selectedTotal.toLocaleString()} collected successfully via ${methodLabel}.`,
        'Payment Received',
      );
      setCheckedItems({});
      setAmountReceived('');
    }, 1000);
  };

  const handlePrint = () => {
    setBillingStep('receipt_printed');
    toast.success('Receipt sent to printer.', 'Print Receipt');
  };

  const categoryBadge = (cat: string) => {
    switch (cat) {
      case 'Consultation': return <Badge variant="info">{cat}</Badge>;
      case 'Lab': return <Badge variant="accent">{cat}</Badge>;
      case 'Medicine': return <Badge variant="success">{cat}</Badge>;
      default: return <Badge>{cat}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
          <Receipt className="w-6 h-6 text-[var(--primary)]" />
          Billing &amp; Cashier
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Search a patient to view pending charges and collect payment
        </p>
      </div>

      {/* Search */}
      <Card hover={false} className="p-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Enter MR# (e.g. MR-10234) or patient name..."
              icon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4" />
            Search
          </Button>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Try: MR-10234, MR-10236, MR-10237, or "Ahmed", "Usman", "Ayesha"
        </p>
      </Card>

      {selectedPatient && (
        <>
          {/* Billing Status Timeline */}
          <Card hover={false} className="px-6 py-2">
            <BillingTimeline activeStep={billingStep} />
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left: Patient info + items table */}
            <div className="xl:col-span-2 space-y-6">
              {/* Patient info card */}
              <Card hover={false} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {selectedPatient.name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {selectedPatient.mr} &middot; {selectedPatient.phone}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {selectedPatient.doctor}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {selectedPatient.department} &middot; {selectedPatient.token}
                  </p>
                </div>
              </Card>

              {/* Pending items table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={
                          selectedPatient.items.length > 0 &&
                          selectedPatient.items.every((i) => checkedItems[i.id])
                        }
                        onChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount (Rs.)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="stagger-children">
                  {selectedPatient.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={!!checkedItems[item.id]}
                          onChange={() => toggleItem(item.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell>{categoryBadge(item.category)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {item.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Total row */}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-semibold text-[var(--text-secondary)]">
                      Grand Total
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg tabular-nums">
                      Rs. {selectedPatient.items.reduce((s, i) => s + i.amount, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Right: Payment panel */}
            <div>
              <Card hover={false} glow className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[var(--primary)]" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Selected total */}
                  <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] text-center">
                    <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
                      Selected Total
                    </p>
                    <p className="text-3xl font-bold text-[var(--primary)] tabular-nums">
                      Rs. {selectedTotal.toLocaleString()}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      {Object.values(checkedItems).filter(Boolean).length} of{' '}
                      {selectedPatient.items.length} items selected
                    </p>
                  </div>

                  {/* Payment method */}
                  <Select
                    label="Payment Method"
                    options={paymentMethods}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />

                  {/* Amount received */}
                  <Input
                    label="Amount Received (Rs.)"
                    type="number"
                    placeholder="0"
                    icon={<Banknote className="w-4 h-4" />}
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                  />

                  {/* Change */}
                  {parseFloat(amountReceived) > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-[var(--success-bg)]">
                      <span className="text-sm font-medium text-emerald-700">Change</span>
                      <span className="text-lg font-bold text-emerald-700 tabular-nums">
                        Rs. {change.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Collect button */}
                  <Button
                    variant="glow"
                    size="lg"
                    className="w-full"
                    loading={loading}
                    onClick={handleCollect}
                  >
                    <CreditCard className="w-5 h-5" />
                    Collect Payment
                  </Button>

                  {/* Print Receipt button — available after payment processed */}
                  {(billingStep === 'payment_processed' || billingStep === 'receipt_printed') && (
                    <>
                      <Button
                        variant="secondary"
                        size="lg"
                        className="w-full animate-fade-in"
                        onClick={handlePrint}
                      >
                        <Printer className="w-5 h-5" />
                        {billingStep === 'receipt_printed' ? 'Reprint Receipt' : 'Print Receipt'}
                      </Button>
                      {/* Receipt QR Code */}
                      <div className="flex flex-col items-center gap-2 pt-2 animate-fade-in">
                        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Receipt QR Code</p>
                        <QRCode
                          data={`SHIFA:receipt:${selectedPatient?.mr ?? 'MR-00000'}:${selectedPatient?.name ?? 'Patient'}:${selectedTotal}:${new Date().toISOString().split('T')[0]}`}
                          size={88}
                        />
                        <p className="text-[10px] text-[var(--text-tertiary)] text-center max-w-[160px]">
                          Scan to verify receipt. Save as PDF from print dialog.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {!selectedPatient && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--surface)] flex items-center justify-center mb-4">
            <Receipt className="w-10 h-10 text-[var(--text-tertiary)]" />
          </div>
          <p className="text-[var(--text-secondary)] font-medium">Search for a patient to begin billing</p>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Enter MR# or patient name in the search box above
          </p>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmState.open}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
        loading={confirmState.loading}
      />
    </div>
  );
}
