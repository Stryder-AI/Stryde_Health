import { useState } from 'react';
import { DollarSign, CheckCircle, Clock, Receipt, Eye, Search, Filter, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

type PaymentStatus = 'paid' | 'partial' | 'unpaid';
type PaymentMethod = 'cash' | 'card' | 'online' | 'insurance';

interface InvoiceItem {
  type: 'consultation' | 'lab' | 'medicine' | 'procedure';
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

interface PaymentRecord {
  date: string;
  amount: number;
  method: PaymentMethod;
}

interface Invoice {
  id: string;
  date: string;
  patient: string;
  mrNo: string;
  items: InvoiceItem[];
  total: number;
  paid: number;
  status: PaymentStatus;
  method: PaymentMethod;
  tax: number;
  discount: number;
  payments: PaymentRecord[];
}

const invoices: Invoice[] = [
  { id: 'INV-2026-001', date: '2026-03-29', patient: 'Ahmad Khan', mrNo: 'MR-2026-00001', items: [{ type: 'consultation', description: 'General OPD Consultation — Dr. Tariq', qty: 1, unitPrice: 2000, total: 2000 }, { type: 'lab', description: 'CBC — Complete Blood Count', qty: 1, unitPrice: 800, total: 800 }, { type: 'medicine', description: 'Augmentin 625mg x10', qty: 1, unitPrice: 450, total: 450 }], total: 3250, paid: 3250, status: 'paid', method: 'cash', tax: 0, discount: 0, payments: [{ date: '2026-03-29', amount: 3250, method: 'cash' }] },
  { id: 'INV-2026-002', date: '2026-03-29', patient: 'Fatima Bibi', mrNo: 'MR-2026-00002', items: [{ type: 'consultation', description: 'Gynecology Consultation — Dr. Saira', qty: 1, unitPrice: 3000, total: 3000 }, { type: 'lab', description: 'Ultrasound — Pelvic', qty: 1, unitPrice: 2500, total: 2500 }], total: 5500, paid: 3000, status: 'partial', method: 'cash', tax: 0, discount: 0, payments: [{ date: '2026-03-29', amount: 3000, method: 'cash' }] },
  { id: 'INV-2026-003', date: '2026-03-29', patient: 'Usman Ali', mrNo: 'MR-2026-00003', items: [{ type: 'consultation', description: 'Cardiology Consultation — Dr. Rizwan', qty: 1, unitPrice: 3500, total: 3500 }, { type: 'lab', description: 'Lipid Profile', qty: 1, unitPrice: 1200, total: 1200 }, { type: 'lab', description: 'ECG', qty: 1, unitPrice: 500, total: 500 }, { type: 'medicine', description: 'Amlodipine 5mg x30', qty: 1, unitPrice: 300, total: 300 }], total: 5500, paid: 5500, status: 'paid', method: 'card', tax: 0, discount: 0, payments: [{ date: '2026-03-29', amount: 5500, method: 'card' }] },
  { id: 'INV-2026-004', date: '2026-03-29', patient: 'Saima Noor', mrNo: 'MR-2026-00004', items: [{ type: 'consultation', description: 'Dermatology Consultation — Dr. Nadia', qty: 1, unitPrice: 2500, total: 2500 }, { type: 'medicine', description: 'Skin cream compound x2', qty: 2, unitPrice: 650, total: 1300 }], total: 3800, paid: 0, status: 'unpaid', method: 'cash', tax: 0, discount: 0, payments: [] },
  { id: 'INV-2026-005', date: '2026-03-29', patient: 'Hassan Mahmood', mrNo: 'MR-2026-00009', items: [{ type: 'consultation', description: 'ENT Consultation — Dr. Imran', qty: 1, unitPrice: 2000, total: 2000 }, { type: 'procedure', description: 'Ear Wax Removal', qty: 1, unitPrice: 1500, total: 1500 }], total: 3500, paid: 3500, status: 'paid', method: 'cash', tax: 0, discount: 0, payments: [{ date: '2026-03-29', amount: 3500, method: 'cash' }] },
  { id: 'INV-2026-006', date: '2026-03-28', patient: 'Ayesha Siddiqui', mrNo: 'MR-2026-00005', items: [{ type: 'consultation', description: 'Pediatrics Consultation — Dr. Amna', qty: 1, unitPrice: 1500, total: 1500 }, { type: 'lab', description: 'Urine DR', qty: 1, unitPrice: 400, total: 400 }, { type: 'medicine', description: 'Cefixime Syrup 60ml', qty: 1, unitPrice: 350, total: 350 }], total: 2250, paid: 2250, status: 'paid', method: 'online', tax: 0, discount: 0, payments: [{ date: '2026-03-28', amount: 2250, method: 'online' }] },
  { id: 'INV-2026-007', date: '2026-03-28', patient: 'Bilal Ahmed', mrNo: 'MR-2026-00006', items: [{ type: 'lab', description: 'HbA1c', qty: 1, unitPrice: 1500, total: 1500 }, { type: 'lab', description: 'Fasting Blood Sugar', qty: 1, unitPrice: 300, total: 300 }, { type: 'medicine', description: 'Metformin 500mg x60', qty: 1, unitPrice: 600, total: 600 }], total: 2400, paid: 2400, status: 'paid', method: 'cash', tax: 0, discount: 0, payments: [{ date: '2026-03-28', amount: 2400, method: 'cash' }] },
  { id: 'INV-2026-008', date: '2026-03-28', patient: 'Nadia Parveen', mrNo: 'MR-2026-00007', items: [{ type: 'consultation', description: 'Orthopedic Consultation — Dr. Khalid', qty: 1, unitPrice: 2500, total: 2500 }, { type: 'lab', description: 'X-Ray — Knee AP/Lateral', qty: 1, unitPrice: 1800, total: 1800 }, { type: 'medicine', description: 'Diclofenac 50mg x20', qty: 1, unitPrice: 250, total: 250 }], total: 4550, paid: 2500, status: 'partial', method: 'cash', tax: 0, discount: 0, payments: [{ date: '2026-03-28', amount: 2500, method: 'cash' }] },
  { id: 'INV-2026-009', date: '2026-03-28', patient: 'Tariq Mehmood', mrNo: 'MR-2026-00008', items: [{ type: 'consultation', description: 'General OPD — Dr. Tariq', qty: 1, unitPrice: 2000, total: 2000 }, { type: 'lab', description: 'RFTs — Renal Function Tests', qty: 1, unitPrice: 1000, total: 1000 }, { type: 'lab', description: 'LFTs — Liver Function Tests', qty: 1, unitPrice: 1000, total: 1000 }], total: 4000, paid: 4000, status: 'paid', method: 'card', tax: 0, discount: 0, payments: [{ date: '2026-03-28', amount: 4000, method: 'card' }] },
  { id: 'INV-2026-010', date: '2026-03-28', patient: 'Sana Malik', mrNo: 'MR-2026-00010', items: [{ type: 'medicine', description: 'Insulin Mixtard 70/30', qty: 2, unitPrice: 1500, total: 3000 }, { type: 'medicine', description: 'Glucometer Strips x50', qty: 1, unitPrice: 1200, total: 1200 }], total: 4200, paid: 0, status: 'unpaid', method: 'cash', tax: 0, discount: 0, payments: [] },
  { id: 'INV-2026-011', date: '2026-03-27', patient: 'Kamran Yousaf', mrNo: 'MR-2026-00011', items: [{ type: 'consultation', description: 'Neurology Consultation — Dr. Faisal', qty: 1, unitPrice: 4000, total: 4000 }, { type: 'lab', description: 'MRI Brain', qty: 1, unitPrice: 12000, total: 12000 }], total: 16000, paid: 16000, status: 'paid', method: 'card', tax: 0, discount: 0, payments: [{ date: '2026-03-27', amount: 16000, method: 'card' }] },
  { id: 'INV-2026-012', date: '2026-03-27', patient: 'Zainab Fatima', mrNo: 'MR-2026-00012', items: [{ type: 'consultation', description: 'Ophthalmology — Dr. Asim', qty: 1, unitPrice: 2500, total: 2500 }, { type: 'procedure', description: 'Visual Acuity Test', qty: 1, unitPrice: 500, total: 500 }], total: 3000, paid: 3000, status: 'paid', method: 'cash', tax: 0, discount: 0, payments: [{ date: '2026-03-27', amount: 3000, method: 'cash' }] },
  { id: 'INV-2026-013', date: '2026-03-27', patient: 'Rizwan Shah', mrNo: 'MR-2026-00013', items: [{ type: 'consultation', description: 'Pulmonology — Dr. Hasan', qty: 1, unitPrice: 3000, total: 3000 }, { type: 'lab', description: 'Chest X-Ray', qty: 1, unitPrice: 1200, total: 1200 }, { type: 'lab', description: 'PFTs — Pulmonary Function Tests', qty: 1, unitPrice: 2000, total: 2000 }, { type: 'medicine', description: 'Montelukast 10mg x30', qty: 1, unitPrice: 450, total: 450 }], total: 6650, paid: 3000, status: 'partial', method: 'cash', tax: 0, discount: 0, payments: [{ date: '2026-03-27', amount: 3000, method: 'cash' }] },
  { id: 'INV-2026-014', date: '2026-03-27', patient: 'Mehwish Rana', mrNo: 'MR-2026-00014', items: [{ type: 'consultation', description: 'General OPD — Dr. Tariq', qty: 1, unitPrice: 2000, total: 2000 }, { type: 'medicine', description: 'Omeprazole 20mg x30', qty: 1, unitPrice: 300, total: 300 }], total: 2300, paid: 2300, status: 'paid', method: 'online', tax: 0, discount: 0, payments: [{ date: '2026-03-27', amount: 2300, method: 'online' }] },
  { id: 'INV-2026-015', date: '2026-03-27', patient: 'Adeel Qureshi', mrNo: 'MR-2026-00015', items: [{ type: 'lab', description: 'Thyroid Profile (T3, T4, TSH)', qty: 1, unitPrice: 2500, total: 2500 }], total: 2500, paid: 2500, status: 'paid', method: 'cash', tax: 0, discount: 0, payments: [{ date: '2026-03-27', amount: 2500, method: 'cash' }] },
  { id: 'INV-2026-016', date: '2026-03-26', patient: 'Rabia Kanwal', mrNo: 'MR-2026-00016', items: [{ type: 'consultation', description: 'Gynecology — Dr. Saira', qty: 1, unitPrice: 3000, total: 3000 }, { type: 'lab', description: 'Ultrasound — Abdominal', qty: 1, unitPrice: 2500, total: 2500 }, { type: 'lab', description: 'CBC', qty: 1, unitPrice: 800, total: 800 }], total: 6300, paid: 6300, status: 'paid', method: 'cash', tax: 0, discount: 0, payments: [{ date: '2026-03-26', amount: 6300, method: 'cash' }] },
  { id: 'INV-2026-017', date: '2026-03-26', patient: 'Farhan Javed', mrNo: 'MR-2026-00017', items: [{ type: 'consultation', description: 'Urology — Dr. Naveed', qty: 1, unitPrice: 3000, total: 3000 }, { type: 'lab', description: 'Urine Complete', qty: 1, unitPrice: 400, total: 400 }, { type: 'lab', description: 'PSA', qty: 1, unitPrice: 1500, total: 1500 }], total: 4900, paid: 0, status: 'unpaid', method: 'cash', tax: 0, discount: 0, payments: [] },
  { id: 'INV-2026-018', date: '2026-03-26', patient: 'Samina Begum', mrNo: 'MR-2026-00018', items: [{ type: 'consultation', description: 'Endocrinology — Dr. Asma', qty: 1, unitPrice: 3500, total: 3500 }, { type: 'lab', description: 'HbA1c', qty: 1, unitPrice: 1500, total: 1500 }, { type: 'medicine', description: 'Insulin Glargine', qty: 1, unitPrice: 2800, total: 2800 }], total: 7800, paid: 7800, status: 'paid', method: 'card', tax: 0, discount: 0, payments: [{ date: '2026-03-26', amount: 7800, method: 'card' }] },
  { id: 'INV-2026-019', date: '2026-03-26', patient: 'Imran Sohail', mrNo: 'MR-2026-00019', items: [{ type: 'consultation', description: 'General OPD — Dr. Tariq', qty: 1, unitPrice: 2000, total: 2000 }, { type: 'medicine', description: 'Cetirizine 10mg x20', qty: 1, unitPrice: 100, total: 100 }], total: 2100, paid: 2100, status: 'paid', method: 'cash', tax: 0, discount: 0, payments: [{ date: '2026-03-26', amount: 2100, method: 'cash' }] },
  { id: 'INV-2026-020', date: '2026-03-26', patient: 'Hira Aftab', mrNo: 'MR-2026-00020', items: [{ type: 'consultation', description: 'Pediatrics — Dr. Amna', qty: 1, unitPrice: 1500, total: 1500 }, { type: 'lab', description: 'CBC', qty: 1, unitPrice: 800, total: 800 }, { type: 'medicine', description: 'Amoxicillin Syrup 125mg', qty: 1, unitPrice: 280, total: 280 }], total: 2580, paid: 2580, status: 'paid', method: 'online', tax: 0, discount: 0, payments: [{ date: '2026-03-26', amount: 2580, method: 'online' }] },
];

const statusBadgeMap: Record<PaymentStatus, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  partial: 'warning',
  unpaid: 'danger',
};

const statusLabel: Record<PaymentStatus, string> = {
  paid: 'Paid',
  partial: 'Partial',
  unpaid: 'Unpaid',
};

const methodIcon: Record<PaymentMethod, typeof CreditCard> = {
  cash: Banknote,
  card: CreditCard,
  online: Smartphone,
  insurance: Receipt,
};

const typeBadgeMap: Record<string, 'info' | 'accent' | 'success' | 'warning'> = {
  consultation: 'info',
  lab: 'accent',
  medicine: 'success',
  procedure: 'warning',
};

export function BillingInvoices() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (methodFilter !== 'all' && inv.method !== methodFilter) return false;
    if (typeFilter !== 'all' && !inv.items.some((item) => item.type === typeFilter)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return inv.id.toLowerCase().includes(q) || inv.patient.toLowerCase().includes(q) || inv.mrNo.toLowerCase().includes(q);
    }
    return true;
  });

  const totalRevenue = filtered.reduce((s, i) => s + i.total, 0);
  const totalCollected = filtered.reduce((s, i) => s + i.paid, 0);
  const totalOutstanding = totalRevenue - totalCollected;

  const paidCount = invoices.filter((i) => i.status === 'paid').length;
  const pendingCount = invoices.filter((i) => i.status !== 'paid').length;
  const avgInvoice = Math.round(invoices.reduce((s, i) => s + i.total, 0) / invoices.length);
  const todayRevenue = invoices.filter((i) => i.date === '2026-03-29').reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Billing & Invoices</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Hospital-wide billing overview and invoice management.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <MetricCard title="Total Revenue Today" value={`Rs. ${todayRevenue.toLocaleString()}`} icon={DollarSign} trend={{ value: 12, positive: true }} iconColor="bg-emerald-500/10 text-emerald-500" />
        <MetricCard title="Paid Invoices" value={paidCount.toString()} icon={CheckCircle} subtitle="This period" iconColor="bg-teal-500/10 text-teal-500" />
        <MetricCard title="Pending Payments" value={pendingCount.toString()} icon={Clock} subtitle="Partial + unpaid" iconColor="bg-amber-500/10 text-amber-500" />
        <MetricCard title="Average Invoice" value={`Rs. ${avgInvoice.toLocaleString()}`} icon={Receipt} iconColor="bg-blue-500/10 text-blue-500" />
      </div>

      {/* Filters */}
      <Card hover={false} className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Search"
              placeholder="Invoice #, patient, MR#..."
              icon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Payment Method</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
              <option value="insurance">Insurance</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Item Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="all">All Types</option>
              <option value="consultation">Consultation</option>
              <option value="lab">Lab</option>
              <option value="medicine">Medicine</option>
              <option value="procedure">Procedure</option>
            </select>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setStatusFilter('all'); setMethodFilter('all'); setTypeFilter('all'); setSearchQuery(''); }}>
            <Filter className="w-4 h-4" /> Clear
          </Button>
        </div>
      </Card>

      {/* Invoices Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>MR#</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total (Rs.)</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((inv) => {
            const MethodIcon = methodIcon[inv.method];
            return (
              <TableRow key={inv.id}>
                <TableCell className="font-semibold">{inv.id}</TableCell>
                <TableCell>{inv.date}</TableCell>
                <TableCell className="font-medium">{inv.patient}</TableCell>
                <TableCell className="text-[var(--text-secondary)]">{inv.mrNo}</TableCell>
                <TableCell>{inv.items.length}</TableCell>
                <TableCell className="font-semibold">{inv.total.toLocaleString()}</TableCell>
                <TableCell>{inv.paid.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={statusBadgeMap[inv.status]} dot>{statusLabel[inv.status]}</Badge>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)] text-xs capitalize">
                    <MethodIcon className="w-3.5 h-3.5" /> {inv.method}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(inv)}>
                    <Eye className="w-4 h-4" /> View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Summary Bar */}
      <Card hover={false} className="p-4">
        <div className="flex flex-wrap items-center justify-around gap-6">
          <div className="text-center">
            <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Total Revenue</p>
            <p className="text-xl font-bold text-[var(--text-primary)] mt-1">Rs. {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="w-px h-10 bg-[var(--surface-border)]" />
          <div className="text-center">
            <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Collections</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">Rs. {totalCollected.toLocaleString()}</p>
          </div>
          <div className="w-px h-10 bg-[var(--surface-border)]" />
          <div className="text-center">
            <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Outstanding</p>
            <p className="text-xl font-bold text-red-600 mt-1">Rs. {totalOutstanding.toLocaleString()}</p>
          </div>
        </div>
      </Card>

      {/* Invoice Detail Modal */}
      <Modal
        open={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={selectedInvoice ? `Invoice ${selectedInvoice.id}` : ''}
        description={selectedInvoice ? `${selectedInvoice.date}` : ''}
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setSelectedInvoice(null)}>Close</Button>
        }
      >
        {selectedInvoice && (
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Patient</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">{selectedInvoice.patient}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">MR Number</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">{selectedInvoice.mrNo}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Date</p>
                  <p className="text-sm text-[var(--text-primary)] mt-1">{selectedInvoice.date}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Status</p>
                  <div className="mt-1">
                    <Badge variant={statusBadgeMap[selectedInvoice.status]} dot>{statusLabel[selectedInvoice.status]}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Invoice Items</h4>
              <div className="overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--surface-border)]">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--surface)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Unit Price</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} className="border-t border-[var(--surface-border)]">
                        <td className="px-4 py-3">
                          <Badge variant={typeBadgeMap[item.type]} className="capitalize">{item.type}</Badge>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-primary)]">{item.description}</td>
                        <td className="px-4 py-3 text-[var(--text-primary)]">{item.qty}</td>
                        <td className="px-4 py-3 text-[var(--text-primary)]">{item.unitPrice.toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Payment Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Subtotal</span>
                  <span className="text-[var(--text-primary)]">Rs. {selectedInvoice.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Tax</span>
                  <span className="text-[var(--text-primary)]">Rs. {selectedInvoice.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Discount</span>
                  <span className="text-[var(--text-primary)]">Rs. {selectedInvoice.discount.toLocaleString()}</span>
                </div>
                <div className="border-t border-[var(--surface-border)] pt-2 flex justify-between text-sm font-bold">
                  <span className="text-[var(--text-primary)]">Grand Total</span>
                  <span className="text-[var(--text-primary)]">Rs. {(selectedInvoice.total + selectedInvoice.tax - selectedInvoice.discount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600 font-medium">Paid</span>
                  <span className="text-emerald-600 font-semibold">Rs. {selectedInvoice.paid.toLocaleString()}</span>
                </div>
                {selectedInvoice.total - selectedInvoice.paid > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600 font-medium">Balance Due</span>
                    <span className="text-red-600 font-semibold">Rs. {(selectedInvoice.total - selectedInvoice.paid).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment History */}
            {selectedInvoice.payments.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Payment History</h4>
                <div className="space-y-2">
                  {selectedInvoice.payments.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-[var(--radius-sm)] bg-emerald-500/10 text-emerald-500">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">Rs. {p.amount.toLocaleString()}</p>
                          <p className="text-xs text-[var(--text-secondary)] capitalize">{p.method} payment</p>
                        </div>
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)]">{p.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
