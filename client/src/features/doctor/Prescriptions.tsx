import { useState } from 'react';
import {
  Pill, Search, Filter, Eye, Printer, Clock, CheckCircle2,
  AlertTriangle, Package, X, Calendar
} from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';

// ── Types ─────────────────────────────────────────────────────

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
}

interface DispensingInfo {
  dispensedAt: string;
  dispensedBy: string;
  items: { medicineName: string; dispensed: boolean; substitution?: string }[];
}

interface PrescriptionRecord {
  id: string;
  rxNumber: string;
  date: string;
  patientName: string;
  mr: string;
  age: number;
  gender: 'M' | 'F';
  diagnosis: string;
  medicines: Medicine[];
  status: 'active' | 'dispensed' | 'partially_dispensed' | 'cancelled';
  dispensing?: DispensingInfo;
}

// ── Demo Data ─────────────────────────────────────────────────

const prescriptions: PrescriptionRecord[] = [
  {
    id: '1', rxNumber: 'RX-20260329-001', date: '29 Mar 2026', patientName: 'Ahmad Khan', mr: 'MR-20240445', age: 52, gender: 'M', diagnosis: 'Essential Hypertension, Type 2 DM',
    medicines: [
      { name: 'Amlodipine', dosage: '10mg', frequency: 'OD (Morning)', duration: '30 days', route: 'Oral', instructions: 'Take on empty stomach in the morning' },
      { name: 'Losartan', dosage: '50mg', frequency: 'OD (Morning)', duration: '30 days', route: 'Oral', instructions: 'Take with or without food' },
      { name: 'Metformin', dosage: '1000mg', frequency: 'BD (After meals)', duration: '30 days', route: 'Oral', instructions: 'Take after breakfast and dinner' },
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'HS (At bedtime)', duration: '30 days', route: 'Oral', instructions: 'Take at bedtime' },
    ],
    status: 'dispensed',
    dispensing: {
      dispensedAt: '29 Mar 2026, 11:45 AM', dispensedBy: 'Pharm. Asif Ali',
      items: [
        { medicineName: 'Amlodipine 10mg', dispensed: true },
        { medicineName: 'Losartan 50mg', dispensed: true },
        { medicineName: 'Metformin 1000mg', dispensed: true },
        { medicineName: 'Atorvastatin 20mg', dispensed: true },
      ],
    },
  },
  {
    id: '2', rxNumber: 'RX-20260329-002', date: '29 Mar 2026', patientName: 'Nazia Begum', mr: 'MR-20241201', age: 45, gender: 'F', diagnosis: 'Essential Hypertension',
    medicines: [
      { name: 'Amlodipine', dosage: '5mg', frequency: 'OD', duration: '30 days', route: 'Oral', instructions: 'Take in the morning' },
    ],
    status: 'dispensed',
    dispensing: {
      dispensedAt: '29 Mar 2026, 10:30 AM', dispensedBy: 'Pharm. Asif Ali',
      items: [{ medicineName: 'Amlodipine 5mg', dispensed: true }],
    },
  },
  {
    id: '3', rxNumber: 'RX-20260329-003', date: '29 Mar 2026', patientName: 'Imran Saeed', mr: 'MR-20240654', age: 62, gender: 'M', diagnosis: 'Stable Angina, COPD',
    medicines: [
      { name: 'Isosorbide Mononitrate', dosage: '30mg', frequency: 'OD', duration: '30 days', route: 'Oral', instructions: 'Take in the morning' },
      { name: 'Salbutamol Inhaler', dosage: '100mcg', frequency: 'PRN', duration: '1 inhaler', route: 'Inhalation', instructions: '2 puffs as needed for breathlessness' },
      { name: 'Tiotropium', dosage: '18mcg', frequency: 'OD', duration: '30 days', route: 'Inhalation', instructions: '1 puff daily via HandiHaler' },
    ],
    status: 'partially_dispensed',
    dispensing: {
      dispensedAt: '29 Mar 2026, 11:00 AM', dispensedBy: 'Pharm. Asif Ali',
      items: [
        { medicineName: 'Isosorbide Mononitrate 30mg', dispensed: true },
        { medicineName: 'Salbutamol Inhaler 100mcg', dispensed: true },
        { medicineName: 'Tiotropium 18mcg', dispensed: false, substitution: 'Out of stock - ordered from supplier' },
      ],
    },
  },
  {
    id: '4', rxNumber: 'RX-20260329-004', date: '29 Mar 2026', patientName: 'Sadia Parveen', mr: 'MR-20241345', age: 35, gender: 'F', diagnosis: 'Benign Palpitations',
    medicines: [
      { name: 'Propranolol', dosage: '10mg', frequency: 'SOS', duration: '10 tablets', route: 'Oral', instructions: 'Take as needed for palpitations. Max 3 times daily.' },
    ],
    status: 'active',
  },
  {
    id: '5', rxNumber: 'RX-20260329-005', date: '29 Mar 2026', patientName: 'Zainab Fatima', mr: 'MR-20240998', age: 48, gender: 'F', diagnosis: 'Mitral Valve Prolapse',
    medicines: [
      { name: 'Propranolol', dosage: '20mg', frequency: 'BD', duration: '30 days', route: 'Oral', instructions: 'Take morning and evening' },
    ],
    status: 'active',
  },
  {
    id: '6', rxNumber: 'RX-20260328-001', date: '28 Mar 2026', patientName: 'Tariq Hussain', mr: 'MR-20241078', age: 55, gender: 'M', diagnosis: 'Post-MI',
    medicines: [
      { name: 'Aspirin', dosage: '75mg', frequency: 'OD', duration: '30 days', route: 'Oral', instructions: 'Take after lunch' },
      { name: 'Clopidogrel', dosage: '75mg', frequency: 'OD', duration: '30 days', route: 'Oral', instructions: 'Take with Aspirin' },
      { name: 'Atorvastatin', dosage: '40mg', frequency: 'HS', duration: '30 days', route: 'Oral', instructions: 'Take at bedtime' },
      { name: 'Metoprolol', dosage: '50mg', frequency: 'BD', duration: '30 days', route: 'Oral', instructions: 'Take morning and evening' },
    ],
    status: 'dispensed',
    dispensing: {
      dispensedAt: '28 Mar 2026, 02:15 PM', dispensedBy: 'Pharm. Saima Noor',
      items: [
        { medicineName: 'Aspirin 75mg', dispensed: true },
        { medicineName: 'Clopidogrel 75mg', dispensed: true },
        { medicineName: 'Atorvastatin 40mg', dispensed: true, substitution: 'Generic substituted (Lipitor -> Atorva)' },
        { medicineName: 'Metoprolol 50mg', dispensed: true },
      ],
    },
  },
  {
    id: '7', rxNumber: 'RX-20260328-002', date: '28 Mar 2026', patientName: 'Bushra Nawaz', mr: 'MR-20240876', age: 40, gender: 'F', diagnosis: 'HTN + DM',
    medicines: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'OD', duration: '30 days', route: 'Oral', instructions: 'Take in the morning' },
      { name: 'Metformin', dosage: '500mg', frequency: 'BD', duration: '30 days', route: 'Oral', instructions: 'Take after meals' },
      { name: 'Glimepiride', dosage: '2mg', frequency: 'OD (Before breakfast)', duration: '30 days', route: 'Oral', instructions: 'Take 15 min before breakfast' },
    ],
    status: 'dispensed',
    dispensing: {
      dispensedAt: '28 Mar 2026, 03:00 PM', dispensedBy: 'Pharm. Asif Ali',
      items: [
        { medicineName: 'Lisinopril 10mg', dispensed: true },
        { medicineName: 'Metformin 500mg', dispensed: true },
        { medicineName: 'Glimepiride 2mg', dispensed: true },
      ],
    },
  },
  {
    id: '8', rxNumber: 'RX-20260327-001', date: '27 Mar 2026', patientName: 'Fahad Ali', mr: 'MR-20241456', age: 63, gender: 'M', diagnosis: 'Chronic Heart Failure',
    medicines: [
      { name: 'Carvedilol', dosage: '12.5mg', frequency: 'BD', duration: '30 days', route: 'Oral', instructions: 'Take with food' },
      { name: 'Furosemide', dosage: '40mg', frequency: 'OD (Morning)', duration: '30 days', route: 'Oral', instructions: 'Take in the morning' },
      { name: 'Spironolactone', dosage: '25mg', frequency: 'OD', duration: '30 days', route: 'Oral', instructions: 'Monitor potassium levels' },
      { name: 'Sacubitril/Valsartan', dosage: '50mg', frequency: 'BD', duration: '30 days', route: 'Oral', instructions: 'Do not take with ACE inhibitors' },
    ],
    status: 'dispensed',
    dispensing: {
      dispensedAt: '27 Mar 2026, 11:30 AM', dispensedBy: 'Pharm. Saima Noor',
      items: [
        { medicineName: 'Carvedilol 12.5mg', dispensed: true },
        { medicineName: 'Furosemide 40mg', dispensed: true },
        { medicineName: 'Spironolactone 25mg', dispensed: true },
        { medicineName: 'Sacubitril/Valsartan 50mg', dispensed: true },
      ],
    },
  },
  {
    id: '9', rxNumber: 'RX-20260327-002', date: '27 Mar 2026', patientName: 'Samina Akhtar', mr: 'MR-20241567', age: 50, gender: 'F', diagnosis: 'Atrial Fibrillation',
    medicines: [
      { name: 'Diltiazem', dosage: '120mg', frequency: 'BD', duration: '30 days', route: 'Oral', instructions: 'Take morning and evening' },
      { name: 'Apixaban', dosage: '5mg', frequency: 'BD', duration: '30 days', route: 'Oral', instructions: 'Take at fixed times. Do not skip doses.' },
    ],
    status: 'dispensed',
    dispensing: {
      dispensedAt: '27 Mar 2026, 12:00 PM', dispensedBy: 'Pharm. Asif Ali',
      items: [
        { medicineName: 'Diltiazem 120mg', dispensed: true },
        { medicineName: 'Apixaban 5mg', dispensed: true },
      ],
    },
  },
  {
    id: '10', rxNumber: 'RX-20260326-001', date: '26 Mar 2026', patientName: 'Khalid Mahmood', mr: 'MR-20241678', age: 47, gender: 'M', diagnosis: 'Essential Hypertension',
    medicines: [
      { name: 'Enalapril', dosage: '5mg', frequency: 'OD', duration: '30 days', route: 'Oral', instructions: 'Take in the morning' },
    ],
    status: 'dispensed',
    dispensing: {
      dispensedAt: '26 Mar 2026, 10:00 AM', dispensedBy: 'Pharm. Asif Ali',
      items: [{ medicineName: 'Enalapril 5mg', dispensed: true }],
    },
  },
  {
    id: '11', rxNumber: 'RX-20260326-002', date: '26 Mar 2026', patientName: 'Rubina Shah', mr: 'MR-20241789', age: 38, gender: 'F', diagnosis: 'Anxiety with Palpitations',
    medicines: [
      { name: 'Propranolol', dosage: '10mg', frequency: 'BD', duration: '14 days', route: 'Oral', instructions: 'Short-term use only' },
      { name: 'Escitalopram', dosage: '5mg', frequency: 'OD', duration: '30 days', route: 'Oral', instructions: 'Take in the morning. May cause initial drowsiness.' },
    ],
    status: 'cancelled',
  },
  {
    id: '12', rxNumber: 'RX-20260325-001', date: '25 Mar 2026', patientName: 'Rashid Mehmood', mr: 'MR-20240812', age: 58, gender: 'M', diagnosis: 'Unstable Angina',
    medicines: [
      { name: 'Aspirin', dosage: '300mg', frequency: 'STAT then 75mg OD', duration: '30 days', route: 'Oral', instructions: 'Loading dose 300mg, then 75mg daily' },
      { name: 'Clopidogrel', dosage: '300mg', frequency: 'STAT then 75mg OD', duration: '30 days', route: 'Oral', instructions: 'Loading dose first' },
      { name: 'Heparin', dosage: '5000 IU', frequency: 'SC BD', duration: '5 days', route: 'Subcutaneous', instructions: 'Administer by nursing staff' },
      { name: 'Nitroglycerin', dosage: '0.5mg', frequency: 'SL PRN', duration: '25 tablets', route: 'Sublingual', instructions: 'Place under tongue for chest pain. Call if no relief after 3 doses.' },
    ],
    status: 'dispensed',
    dispensing: {
      dispensedAt: '25 Mar 2026, 09:45 AM', dispensedBy: 'Pharm. Saima Noor',
      items: [
        { medicineName: 'Aspirin 300mg/75mg', dispensed: true },
        { medicineName: 'Clopidogrel 300mg/75mg', dispensed: true },
        { medicineName: 'Heparin 5000 IU', dispensed: true },
        { medicineName: 'Nitroglycerin 0.5mg SL', dispensed: true },
      ],
    },
  },
  {
    id: '13', rxNumber: 'RX-20260325-002', date: '25 Mar 2026', patientName: 'Aslam Pervez', mr: 'MR-20240123', age: 70, gender: 'M', diagnosis: 'Chronic Heart Failure - NYHA II',
    medicines: [
      { name: 'Ramipril', dosage: '5mg', frequency: 'OD', duration: '30 days', route: 'Oral', instructions: 'Monitor renal function' },
      { name: 'Bisoprolol', dosage: '5mg', frequency: 'OD', duration: '30 days', route: 'Oral', instructions: 'Take in the morning' },
      { name: 'Furosemide', dosage: '20mg', frequency: 'OD', duration: '30 days', route: 'Oral', instructions: 'Take in the morning' },
    ],
    status: 'partially_dispensed',
    dispensing: {
      dispensedAt: '25 Mar 2026, 10:30 AM', dispensedBy: 'Pharm. Asif Ali',
      items: [
        { medicineName: 'Ramipril 5mg', dispensed: true },
        { medicineName: 'Bisoprolol 5mg', dispensed: false, substitution: 'Brand not available - patient to collect tomorrow' },
        { medicineName: 'Furosemide 20mg', dispensed: true },
      ],
    },
  },
  {
    id: '14', rxNumber: 'RX-20260324-001', date: '24 Mar 2026', patientName: 'Tahira Parveen', mr: 'MR-20240234', age: 53, gender: 'F', diagnosis: 'Resistant Hypertension',
    medicines: [
      { name: 'Amlodipine', dosage: '10mg', frequency: 'OD', duration: '30 days', route: 'Oral', instructions: 'Morning' },
      { name: 'Valsartan', dosage: '160mg', frequency: 'OD', duration: '30 days', route: 'Oral', instructions: 'Morning' },
      { name: 'Hydrochlorothiazide', dosage: '12.5mg', frequency: 'OD', duration: '30 days', route: 'Oral', instructions: 'Morning with food' },
      { name: 'Spironolactone', dosage: '25mg', frequency: 'OD', duration: '30 days', route: 'Oral', instructions: 'Added as fourth agent' },
    ],
    status: 'dispensed',
    dispensing: {
      dispensedAt: '24 Mar 2026, 02:00 PM', dispensedBy: 'Pharm. Saima Noor',
      items: [
        { medicineName: 'Amlodipine 10mg', dispensed: true },
        { medicineName: 'Valsartan 160mg', dispensed: true },
        { medicineName: 'Hydrochlorothiazide 12.5mg', dispensed: true },
        { medicineName: 'Spironolactone 25mg', dispensed: true },
      ],
    },
  },
  {
    id: '15', rxNumber: 'RX-20260324-002', date: '24 Mar 2026', patientName: 'Hassan Raza', mr: 'MR-20241890', age: 60, gender: 'M', diagnosis: 'Ischemic Heart Disease',
    medicines: [
      { name: 'Aspirin', dosage: '75mg', frequency: 'OD', duration: '30 days', route: 'Oral', instructions: 'After lunch' },
      { name: 'Atorvastatin', dosage: '40mg', frequency: 'HS', duration: '30 days', route: 'Oral', instructions: 'At bedtime' },
      { name: 'Metoprolol', dosage: '25mg', frequency: 'BD', duration: '30 days', route: 'Oral', instructions: 'Morning and evening' },
    ],
    status: 'dispensed',
    dispensing: {
      dispensedAt: '24 Mar 2026, 03:30 PM', dispensedBy: 'Pharm. Asif Ali',
      items: [
        { medicineName: 'Aspirin 75mg', dispensed: true },
        { medicineName: 'Atorvastatin 40mg', dispensed: true },
        { medicineName: 'Metoprolol 25mg', dispensed: true },
      ],
    },
  },
];

// ── Helpers ───────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; variant: 'completed' | 'waiting' | 'warning' | 'cancelled' }> = {
  active: { label: 'Active', variant: 'waiting' },
  dispensed: { label: 'Dispensed', variant: 'completed' },
  partially_dispensed: { label: 'Partial', variant: 'warning' },
  cancelled: { label: 'Cancelled', variant: 'cancelled' },
};

// ── Component ─────────────────────────────────────────────────

export default function Prescriptions() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRx, setSelectedRx] = useState<PrescriptionRecord | null>(null);

  const todayCount = prescriptions.filter((p) => p.date === '29 Mar 2026').length;
  const thisMonthCount = prescriptions.length;
  const pendingCount = prescriptions.filter((p) => p.status === 'active' || p.status === 'partially_dispensed').length;

  const filtered = prescriptions.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search.length > 0) {
      const q = search.toLowerCase();
      return (
        p.patientName.toLowerCase().includes(q) ||
        p.mr.toLowerCase().includes(q) ||
        p.rxNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Prescriptions
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Dr. Tariq Ahmed &middot; Prescription history and management
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <MetricCard
          title="Prescriptions Today"
          value={todayCount}
          subtitle={`${todayCount} new prescriptions`}
          icon={Pill}
          trend={{ value: 10, positive: true }}
        />
        <MetricCard
          title="This Month"
          value={thisMonthCount}
          subtitle="Total prescriptions written"
          icon={Calendar}
          iconColor="bg-[var(--info-bg)] text-blue-600"
        />
        <MetricCard
          title="Pending Dispensing"
          value={pendingCount}
          subtitle="Awaiting pharmacy"
          icon={Package}
          iconColor="bg-[var(--warning-bg)] text-amber-600"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by patient, MR#, or Rx#..."
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="dispensed">Dispensed</option>
            <option value="partially_dispensed">Partially Dispensed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Prescriptions Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rx #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>MR#</TableHead>
            <TableHead>Medicines</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dispensed</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((rx) => {
            const sc = statusConfig[rx.status];
            return (
              <TableRow key={rx.id}>
                <TableCell>
                  <span className="font-mono text-xs font-semibold text-[var(--primary)]">{rx.rxNumber}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-[var(--text-secondary)]">{rx.date}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{rx.patientName}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-[var(--text-secondary)]">{rx.mr}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="default" className="text-[10px]">
                    <Pill className="w-3 h-3" />
                    {rx.medicines.length} item{rx.medicines.length > 1 ? 's' : ''}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={sc.variant} dot className="text-[10px]">{sc.label}</Badge>
                </TableCell>
                <TableCell>
                  {rx.dispensing ? (
                    <span className="text-xs text-[var(--text-secondary)]">
                      {rx.dispensing.items.filter((i) => i.dispensed).length}/{rx.dispensing.items.length}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--text-tertiary)]">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setSelectedRx(rx)}>
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toast.success(`Prescription ${rx.id} sent to printer.`, 'Print Job Sent')}>
                      <Printer className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {filtered.length === 0 && (
        <Card hover={false} className="text-center !py-12">
          <Pill className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-tertiary)]">No prescriptions match your filters.</p>
        </Card>
      )}

      {/* Prescription Detail Modal */}
      <Modal
        open={!!selectedRx}
        onClose={() => setSelectedRx(null)}
        title={selectedRx ? `Prescription ${selectedRx.rxNumber}` : ''}
        description={selectedRx ? `${selectedRx.date} - ${selectedRx.diagnosis}` : ''}
        size="xl"
        footer={
          <Button variant="secondary" onClick={() => { toast.success(`Prescription ${selectedRx?.rxNumber} sent to printer.`, 'Print Job Sent'); setSelectedRx(null); }}>
            <Printer className="w-4 h-4" />
            Print Prescription
          </Button>
        }
      >
        {selectedRx && (
          <div className="space-y-6">
            {/* Patient Info Header */}
            <div className="flex items-center gap-4 glass-card-static p-4 rounded-[var(--radius-sm)]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-teal-400 flex items-center justify-center text-white font-bold">
                {selectedRx.patientName.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-[var(--text-primary)]">{selectedRx.patientName}</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {selectedRx.mr} &middot; {selectedRx.age}{selectedRx.gender === 'M' ? 'M' : 'F'}
                </p>
              </div>
              <Badge variant={statusConfig[selectedRx.status].variant} dot>
                {statusConfig[selectedRx.status].label}
              </Badge>
            </div>

            {/* Medicines Table */}
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Prescribed Medicines</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--surface-border)]">
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">#</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Medicine</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Dosage</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Frequency</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Duration</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Route</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRx.medicines.map((med, i) => (
                      <tr key={i} className="border-b border-[var(--surface-border)]">
                        <td className="px-3 py-2.5 text-[var(--text-tertiary)]">{i + 1}</td>
                        <td className="px-3 py-2.5 font-semibold text-[var(--text-primary)]">{med.name}</td>
                        <td className="px-3 py-2.5 text-[var(--text-secondary)]">{med.dosage}</td>
                        <td className="px-3 py-2.5 text-[var(--text-secondary)]">{med.frequency}</td>
                        <td className="px-3 py-2.5 text-[var(--text-secondary)]">{med.duration}</td>
                        <td className="px-3 py-2.5 text-[var(--text-secondary)]">{med.route}</td>
                        <td className="px-3 py-2.5 text-xs text-[var(--text-tertiary)]">{med.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dispensing Info */}
            {selectedRx.dispensing && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Dispensing Information</h4>
                <div className="glass-card-static p-4 rounded-[var(--radius-sm)] space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">
                      Dispensed by <span className="font-semibold text-[var(--text-primary)]">{selectedRx.dispensing.dispensedBy}</span>
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)]">{selectedRx.dispensing.dispensedAt}</span>
                  </div>
                  <div className="space-y-2">
                    {selectedRx.dispensing.items.map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-2 rounded-[var(--radius-xs)] ${
                          item.dispensed ? 'bg-[var(--success-bg)]' : 'bg-[var(--warning-bg)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {item.dispensed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                          )}
                          <span className="text-sm text-[var(--text-primary)]">{item.medicineName}</span>
                        </div>
                        {item.substitution && (
                          <span className="text-xs text-amber-600 font-medium">{item.substitution}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
