import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Eye,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Phone,
  MapPin,
  Clock,
  BarChart3,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  SortableTableHead,
  TableFooter,
} from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { useSorting } from '@/hooks/useSorting';
import { generateLabReportPDF } from './LabReportPDF';
import { MetricCard } from '@/components/shared/MetricCard';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { AbnormalBadge, ReportAbnormalBadge } from './AbnormalFlag';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ReportResult {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag?: 'H' | 'L' | null;
}

interface CompletedReport {
  id: string;
  patient: string;
  mrn: string;
  age: string;
  gender: string;
  testName: string;
  doctor: string;
  department: string;
  date: string;
  time: string;
  status: 'completed' | 'verified' | 'printed';
  sampleType: string;
  technician: string;
  verifiedBy: string;
  results: ReportResult[];
}

// ─── Demo Data ─────────────────────────────────────────────────────────────

const demoReports: CompletedReport[] = [
  {
    id: 'RPT-2026-0451', patient: 'Ahmed Khan', mrn: 'MR-10234', age: '38', gender: 'Male',
    testName: 'Complete Blood Count', doctor: 'Dr. Sarah Ali', department: 'General Medicine',
    date: '2026-03-29', time: '10:45 AM', status: 'verified', sampleType: 'Blood (EDTA)',
    technician: 'Asif Raza', verifiedBy: 'Dr. Nadia Hussain',
    results: [
      { parameter: 'Hemoglobin', value: '14.5', unit: 'g/dL', referenceRange: '13.0 - 17.0', flag: null },
      { parameter: 'RBC Count', value: '5.1', unit: 'million/uL', referenceRange: '4.5 - 5.5', flag: null },
      { parameter: 'WBC Count', value: '12800', unit: '/uL', referenceRange: '4000 - 11000', flag: 'H' },
      { parameter: 'Platelet Count', value: '280000', unit: '/uL', referenceRange: '150000 - 400000', flag: null },
      { parameter: 'HCT', value: '43', unit: '%', referenceRange: '40 - 54', flag: null },
      { parameter: 'MCV', value: '86', unit: 'fL', referenceRange: '80 - 100', flag: null },
      { parameter: 'MCH', value: '28', unit: 'pg', referenceRange: '27 - 33', flag: null },
      { parameter: 'MCHC', value: '33.5', unit: 'g/dL', referenceRange: '32 - 36', flag: null },
      { parameter: 'ESR', value: '25', unit: 'mm/hr', referenceRange: '0 - 20', flag: 'H' },
      { parameter: 'Neutrophils', value: '68', unit: '%', referenceRange: '40 - 70', flag: null },
      { parameter: 'Lymphocytes', value: '22', unit: '%', referenceRange: '20 - 40', flag: null },
      { parameter: 'Monocytes', value: '6', unit: '%', referenceRange: '2 - 8', flag: null },
      { parameter: 'Eosinophils', value: '3', unit: '%', referenceRange: '1 - 4', flag: null },
      { parameter: 'Basophils', value: '1', unit: '%', referenceRange: '0 - 1', flag: null },
    ],
  },
  {
    id: 'RPT-2026-0450', patient: 'Fatima Noor', mrn: 'MR-10189', age: '52', gender: 'Female',
    testName: 'Lipid Profile', doctor: 'Dr. Imran Shah', department: 'Cardiology',
    date: '2026-03-29', time: '10:22 AM', status: 'completed', sampleType: 'Blood (Serum)',
    technician: 'Asif Raza', verifiedBy: 'Dr. Nadia Hussain',
    results: [
      { parameter: 'Total Cholesterol', value: '242', unit: 'mg/dL', referenceRange: '< 200', flag: 'H' },
      { parameter: 'Triglycerides', value: '185', unit: 'mg/dL', referenceRange: '< 150', flag: 'H' },
      { parameter: 'HDL Cholesterol', value: '38', unit: 'mg/dL', referenceRange: '40 - 60', flag: 'L' },
      { parameter: 'LDL Cholesterol', value: '167', unit: 'mg/dL', referenceRange: '< 100', flag: 'H' },
      { parameter: 'VLDL Cholesterol', value: '37', unit: 'mg/dL', referenceRange: '5 - 40', flag: null },
      { parameter: 'Total/HDL Ratio', value: '6.4', unit: '', referenceRange: '< 5.0', flag: 'H' },
    ],
  },
  {
    id: 'RPT-2026-0449', patient: 'Ali Raza', mrn: 'MR-10301', age: '61', gender: 'Male',
    testName: 'Liver Function Test', doctor: 'Dr. Ayesha Malik', department: 'Gastroenterology',
    date: '2026-03-29', time: '09:58 AM', status: 'verified', sampleType: 'Blood (Serum)',
    technician: 'Sana Malik', verifiedBy: 'Dr. Nadia Hussain',
    results: [
      { parameter: 'Total Bilirubin', value: '1.8', unit: 'mg/dL', referenceRange: '0.1 - 1.2', flag: 'H' },
      { parameter: 'Direct Bilirubin', value: '0.6', unit: 'mg/dL', referenceRange: '0.0 - 0.3', flag: 'H' },
      { parameter: 'Indirect Bilirubin', value: '1.2', unit: 'mg/dL', referenceRange: '0.1 - 0.9', flag: 'H' },
      { parameter: 'SGPT (ALT)', value: '89', unit: 'U/L', referenceRange: '7 - 56', flag: 'H' },
      { parameter: 'SGOT (AST)', value: '72', unit: 'U/L', referenceRange: '10 - 40', flag: 'H' },
      { parameter: 'Alkaline Phosphatase', value: '132', unit: 'U/L', referenceRange: '44 - 147', flag: null },
      { parameter: 'GGT', value: '58', unit: 'U/L', referenceRange: '9 - 48', flag: 'H' },
      { parameter: 'Total Protein', value: '6.8', unit: 'g/dL', referenceRange: '6.0 - 8.3', flag: null },
      { parameter: 'Albumin', value: '3.2', unit: 'g/dL', referenceRange: '3.5 - 5.5', flag: 'L' },
      { parameter: 'Globulin', value: '3.6', unit: 'g/dL', referenceRange: '2.0 - 3.5', flag: 'H' },
      { parameter: 'A/G Ratio', value: '0.89', unit: '', referenceRange: '1.0 - 2.2', flag: 'L' },
    ],
  },
  {
    id: 'RPT-2026-0448', patient: 'Zainab Bibi', mrn: 'MR-10156', age: '34', gender: 'Female',
    testName: 'Thyroid Panel', doctor: 'Dr. Kamran Javed', department: 'Endocrinology',
    date: '2026-03-29', time: '09:31 AM', status: 'printed', sampleType: 'Blood (Serum)',
    technician: 'Asif Raza', verifiedBy: 'Dr. Nadia Hussain',
    results: [
      { parameter: 'T3', value: '95', unit: 'ng/dL', referenceRange: '80 - 200', flag: null },
      { parameter: 'T4', value: '5.8', unit: 'ug/dL', referenceRange: '4.5 - 12.0', flag: null },
      { parameter: 'TSH', value: '8.2', unit: 'uIU/mL', referenceRange: '0.4 - 4.0', flag: 'H' },
    ],
  },
  {
    id: 'RPT-2026-0447', patient: 'Hassan Mehmood', mrn: 'MR-10278', age: '55', gender: 'Male',
    testName: 'Renal Function Test', doctor: 'Dr. Sarah Ali', department: 'Nephrology',
    date: '2026-03-29', time: '09:12 AM', status: 'verified', sampleType: 'Blood (Serum)',
    technician: 'Sana Malik', verifiedBy: 'Dr. Nadia Hussain',
    results: [
      { parameter: 'Blood Urea', value: '48', unit: 'mg/dL', referenceRange: '15 - 40', flag: 'H' },
      { parameter: 'BUN', value: '22', unit: 'mg/dL', referenceRange: '7 - 20', flag: 'H' },
      { parameter: 'Serum Creatinine', value: '1.8', unit: 'mg/dL', referenceRange: '0.7 - 1.3', flag: 'H' },
      { parameter: 'Uric Acid', value: '7.5', unit: 'mg/dL', referenceRange: '3.5 - 7.2', flag: 'H' },
      { parameter: 'Sodium', value: '140', unit: 'mEq/L', referenceRange: '136 - 146', flag: null },
      { parameter: 'Potassium', value: '5.4', unit: 'mEq/L', referenceRange: '3.5 - 5.1', flag: 'H' },
      { parameter: 'Chloride', value: '102', unit: 'mEq/L', referenceRange: '98 - 106', flag: null },
      { parameter: 'Calcium', value: '9.2', unit: 'mg/dL', referenceRange: '8.5 - 10.5', flag: null },
    ],
  },
  {
    id: 'RPT-2026-0446', patient: 'Saima Akram', mrn: 'MR-10345', age: '28', gender: 'Female',
    testName: 'Urinalysis', doctor: 'Dr. Bilal Ahmed', department: 'General Medicine',
    date: '2026-03-29', time: '08:47 AM', status: 'completed', sampleType: 'Urine (Midstream)',
    technician: 'Asif Raza', verifiedBy: 'Dr. Nadia Hussain',
    results: [
      { parameter: 'Color', value: 'Yellow', unit: '', referenceRange: 'Pale Yellow - Amber', flag: null },
      { parameter: 'Appearance', value: 'Slightly Turbid', unit: '', referenceRange: 'Clear', flag: 'H' },
      { parameter: 'Specific Gravity', value: '1.022', unit: '', referenceRange: '1.005 - 1.030', flag: null },
      { parameter: 'pH', value: '6.0', unit: '', referenceRange: '4.5 - 8.0', flag: null },
      { parameter: 'Protein', value: 'Trace', unit: '', referenceRange: 'Nil', flag: 'H' },
      { parameter: 'Glucose', value: 'Nil', unit: '', referenceRange: 'Nil', flag: null },
      { parameter: 'WBC', value: '8', unit: '/hpf', referenceRange: '0 - 5', flag: 'H' },
      { parameter: 'RBC', value: '1', unit: '/hpf', referenceRange: '0 - 2', flag: null },
    ],
  },
  {
    id: 'RPT-2026-0445', patient: 'Imran Siddiqui', mrn: 'MR-10310', age: '47', gender: 'Male',
    testName: 'Complete Blood Count', doctor: 'Dr. Ayesha Malik', department: 'Oncology',
    date: '2026-03-28', time: '04:15 PM', status: 'printed', sampleType: 'Blood (EDTA)',
    technician: 'Sana Malik', verifiedBy: 'Dr. Nadia Hussain',
    results: [
      { parameter: 'Hemoglobin', value: '9.2', unit: 'g/dL', referenceRange: '13.0 - 17.0', flag: 'L' },
      { parameter: 'RBC Count', value: '3.8', unit: 'million/uL', referenceRange: '4.5 - 5.5', flag: 'L' },
      { parameter: 'WBC Count', value: '3200', unit: '/uL', referenceRange: '4000 - 11000', flag: 'L' },
      { parameter: 'Platelet Count', value: '120000', unit: '/uL', referenceRange: '150000 - 400000', flag: 'L' },
      { parameter: 'HCT', value: '28', unit: '%', referenceRange: '40 - 54', flag: 'L' },
      { parameter: 'MCV', value: '74', unit: 'fL', referenceRange: '80 - 100', flag: 'L' },
      { parameter: 'MCH', value: '24', unit: 'pg', referenceRange: '27 - 33', flag: 'L' },
      { parameter: 'MCHC', value: '32.8', unit: 'g/dL', referenceRange: '32 - 36', flag: null },
      { parameter: 'ESR', value: '45', unit: 'mm/hr', referenceRange: '0 - 20', flag: 'H' },
    ],
  },
  {
    id: 'RPT-2026-0444', patient: 'Rubina Shah', mrn: 'MR-10290', age: '63', gender: 'Female',
    testName: 'Lipid Profile', doctor: 'Dr. Imran Shah', department: 'Cardiology',
    date: '2026-03-28', time: '03:30 PM', status: 'verified', sampleType: 'Blood (Serum)',
    technician: 'Asif Raza', verifiedBy: 'Dr. Nadia Hussain',
    results: [
      { parameter: 'Total Cholesterol', value: '190', unit: 'mg/dL', referenceRange: '< 200', flag: null },
      { parameter: 'Triglycerides', value: '128', unit: 'mg/dL', referenceRange: '< 150', flag: null },
      { parameter: 'HDL Cholesterol', value: '52', unit: 'mg/dL', referenceRange: '40 - 60', flag: null },
      { parameter: 'LDL Cholesterol', value: '112', unit: 'mg/dL', referenceRange: '< 100', flag: 'H' },
      { parameter: 'VLDL Cholesterol', value: '26', unit: 'mg/dL', referenceRange: '5 - 40', flag: null },
      { parameter: 'Total/HDL Ratio', value: '3.65', unit: '', referenceRange: '< 5.0', flag: null },
    ],
  },
];

// ─── Status config for report-specific statuses ────────────────────────────

const reportStatusConfig: Record<string, { variant: 'completed' | 'success' | 'info'; label: string }> = {
  completed: { variant: 'completed', label: 'Completed' },
  verified: { variant: 'success', label: 'Verified' },
  printed: { variant: 'info', label: 'Printed' },
};

// ─── Report View Modal ─────────────────────────────────────────────────────

function ReportViewModal({ report, open, onClose }: { report: CompletedReport | null; open: boolean; onClose: () => void }) {
  if (!report) return null;

  const flaggedCount = report.results.filter((r) => r.flag).length;

  return (
    <Modal open={open} onClose={onClose} size="xl" title="Laboratory Report">
      <div className="space-y-6 -mx-2">
        {/* Hospital Header */}
        <div className="text-center pb-5 border-b-2 border-[var(--primary)]">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-teal-400 flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Stryde Health Hospital
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            123 Medical Boulevard, Healthcare City, HC 54321
          </p>
          <div className="flex items-center justify-center gap-4 mt-1 text-xs text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> +92-300-1234567</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> www.strydehealth.com</span>
          </div>
          <div className="mt-3 inline-block px-4 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold uppercase tracking-wider">
            Laboratory Report
          </div>
        </div>

        {/* Patient Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-[var(--radius-sm)] bg-[var(--surface)]">
          {[
            { label: 'Patient Name', value: report.patient },
            { label: 'MR Number', value: report.mrn },
            { label: 'Age / Gender', value: `${report.age} yrs / ${report.gender}` },
            { label: 'Report ID', value: report.id },
            { label: 'Referring Doctor', value: report.doctor },
            { label: 'Department', value: report.department },
            { label: 'Sample Type', value: report.sampleType },
            { label: 'Report Date', value: `${report.date} ${report.time}` },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{item.label}</p>
              <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Test Name + Prominent ABNORMAL badge */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--text-primary)]">{report.testName}</h3>
          <div className="flex items-center gap-2">
            <ReportAbnormalBadge flaggedCount={flaggedCount} />
            {flaggedCount > 0 && (
              <Badge variant="warning">
                <AlertTriangle className="w-3 h-3 mr-1" /> {flaggedCount} abnormal
              </Badge>
            )}
          </div>
        </div>

        {/* Results Table */}
        <div className="border border-[var(--surface-border)] rounded-[var(--radius-sm)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--surface)]">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Parameter</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Result</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-16">Flag</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Unit</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Reference Range</th>
              </tr>
            </thead>
            <tbody>
              {report.results.map((r, i) => (
                <tr
                  key={i}
                  className={cn(
                    'border-b border-[var(--surface-border)]',
                    r.flag && 'bg-red-50/40 dark:bg-red-950/15'
                  )}
                >
                  <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">{r.parameter}</td>
                  <td className={cn(
                    'px-4 py-2.5 font-semibold',
                    r.flag ? 'text-red-600 dark:text-red-400' : 'text-[var(--text-primary)]'
                  )}>
                    {r.value}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <AbnormalBadge flag={r.flag} value={r.value} />
                  </td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)] text-xs">{r.unit}</td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)] text-xs font-mono">{r.referenceRange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs text-[var(--text-tertiary)]">
          <span className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold dark:bg-red-900/40 dark:text-red-400">H</span>
            High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold dark:bg-blue-900/40 dark:text-blue-400">L</span>
            Low
          </span>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[var(--surface-border)]">
          <div className="text-center">
            <div className="w-32 border-b border-[var(--text-tertiary)] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">{report.technician}</p>
            <p className="text-xs text-[var(--text-tertiary)]">Lab Technician</p>
          </div>
          <div className="text-center">
            <div className="w-32 border-b border-[var(--text-tertiary)] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">{report.verifiedBy}</p>
            <p className="text-xs text-[var(--text-tertiary)]">Pathologist (Verified By)</p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-[10px] text-[var(--text-tertiary)] text-center italic">
          This is a computer-generated report. Please correlate clinically. For queries, contact the laboratory at ext. 234.
        </p>
      </div>
    </Modal>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function CompletedReports() {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [testFilter, setTestFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState<CompletedReport | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const testOptions = useMemo(() => {
    const tests = [...new Set(demoReports.map((r) => r.testName))];
    return tests.map((t) => ({ value: t, label: t }));
  }, []);

  const dateOptions = [
    { value: '2026-03-29', label: '29 Mar 2026' },
    { value: '2026-03-28', label: '28 Mar 2026' },
  ];

  const filtered = useMemo(() => {
    return demoReports.filter((r) => {
      const matchSearch =
        !search ||
        r.patient.toLowerCase().includes(search.toLowerCase()) ||
        r.mrn.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.testName.toLowerCase().includes(search.toLowerCase());
      const matchDate = !dateFilter || r.date === dateFilter;
      const matchTest = !testFilter || r.testName === testFilter;
      return matchSearch && matchDate && matchTest;
    });
  }, [search, dateFilter, testFilter]);

  const { sortedItems, sortKey, sortDir, handleSort } = useSorting(filtered);
  const { paginatedItems, currentPage, totalPages, itemsPerPage, goToPage, changePageSize } =
    usePagination(sortedItems, 10);

  return (
    <div className={`space-y-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Completed Reports
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Archive of all completed laboratory reports
        </p>
      </div>

      {/* Filters */}
      <Card hover={false} className="p-4">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[240px]">
            <Input
              placeholder="Search by patient, MR#, report ID, or test..."
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Select
              label="Date"
              placeholder="All dates"
              options={dateOptions}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div className="w-56">
            <Select
              label="Test Type"
              placeholder="All tests"
              options={testOptions}
              value={testFilter}
              onChange={(e) => setTestFilter(e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(''); setDateFilter(''); setTestFilter(''); }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Reports Today',
            value: demoReports.filter((r) => r.date === '2026-03-29').length,
            subtitle: 'Completed & verified',
            icon: FileText,
            iconColor: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
            trend: { value: 12, positive: true },
          },
          {
            title: 'Pending Verification',
            value: 0,
            subtitle: 'All reports verified',
            icon: CheckCircle2,
            iconColor: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
          },
          {
            title: 'Avg Turnaround',
            value: '42m',
            subtitle: 'Target: 60 min',
            icon: Clock,
            iconColor: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
            trend: { value: 18, positive: true },
          },
          {
            title: 'Reports This Week',
            value: demoReports.length,
            subtitle: '3 flagged abnormal',
            icon: BarChart3,
            iconColor: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            trend: { value: 5, positive: true },
          },
        ].map((metric, i) => (
          <div
            key={metric.title}
            className="transition-all duration-500"
            style={{
              transitionDelay: `${i * 80}ms`,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
            }}
          >
            <MetricCard {...metric} />
          </div>
        ))}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-secondary)]">
          Showing <span className="font-semibold text-[var(--text-primary)]">{filtered.length}</span> of {demoReports.length} reports
        </p>
      </div>

      {/* Table */}
      <div className="glass-card-static p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <TableHeader>
              <TableRow>
                <TableHead>Report #</TableHead>
                <SortableTableHead
                  sortKey="patient"
                  currentSortKey={sortKey as string | null}
                  sortDir={sortDir}
                  onSort={(k) => handleSort(k as keyof CompletedReport)}
                >
                  Patient
                </SortableTableHead>
                <TableHead>Test Name</TableHead>
                <TableHead>Referring Doctor</TableHead>
                <SortableTableHead
                  sortKey="date"
                  currentSortKey={sortKey as string | null}
                  sortDir={sortDir}
                  onSort={(k) => handleSort(k as keyof CompletedReport)}
                >
                  Date / Time
                </SortableTableHead>
                <SortableTableHead
                  sortKey="status"
                  currentSortKey={sortKey as string | null}
                  sortDir={sortDir}
                  onSort={(k) => handleSort(k as keyof CompletedReport)}
                >
                  Status
                </SortableTableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((report, i) => {
                const flagged = report.results.filter((r) => r.flag).length;
                const config = reportStatusConfig[report.status];
                return (
                  <TableRow
                    key={report.id}
                    className="cursor-pointer"
                    style={{
                      animation: `fadeInRow 0.3s ease forwards`,
                      animationDelay: `${i * 40}ms`,
                      opacity: 0,
                    }}
                    onClick={() => setSelectedReport(report)}
                  >
                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-[var(--primary)]">{report.id}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{report.patient}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{report.mrn} &middot; {report.age} yrs / {report.gender}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{report.testName}</span>
                        {flagged > 0 && (
                          <ReportAbnormalBadge flaggedCount={flagged} className="text-[10px] px-1.5 py-0.5" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-[var(--text-secondary)]">{report.doctor}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{report.date}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{report.time}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-2 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors"
                          title="View Report"
                          onClick={(e) => { e.stopPropagation(); setSelectedReport(report); }}
                        >
                          <Eye className="w-4 h-4 text-[var(--text-tertiary)] hover:text-[var(--primary)]" />
                        </button>
                        <button
                          className="p-2 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors"
                          title="Download"
                          onClick={(e) => {
                            e.stopPropagation();
                            generateLabReportPDF(report, 'Stryde Health Hospital', {
                              name: report.patient,
                              mrn: report.mrn,
                              age: report.age,
                              gender: report.gender,
                            });
                          }}
                        >
                          <Download className="w-4 h-4 text-[var(--text-tertiary)] hover:text-[var(--primary)]" />
                        </button>
                        <button
                          className="px-3 py-1.5 rounded-[var(--radius-xs)] bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary)]/90 transition-colors whitespace-nowrap"
                          title="Generate PDF Report"
                          onClick={(e) => {
                            e.stopPropagation();
                            generateLabReportPDF(report, 'Stryde Health Hospital', {
                              name: report.patient,
                              mrn: report.mrn,
                              age: report.age,
                              gender: report.gender,
                            });
                          }}
                        >
                          Generate PDF
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <FileText className="w-12 h-12 mx-auto text-[var(--text-tertiary)] mb-4" />
                    <p className="text-sm text-[var(--text-secondary)]">No reports match your filters.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>
        <TableFooter>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={itemsPerPage}
            onPageChange={goToPage}
            onPageSizeChange={changePageSize}
          />
        </TableFooter>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes fadeInRow {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Report View Modal */}
      <ReportViewModal
        report={selectedReport}
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
