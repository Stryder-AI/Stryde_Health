import { useState } from 'react';
import {
  FlaskConical, Search, Filter, Eye, AlertTriangle, TrendingUp,
  Clock, CheckCircle2, FileText, ArrowUp, ArrowDown, Minus, Calendar
} from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';

// ── Types ─────────────────────────────────────────────────────

interface LabParameter {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: 'normal' | 'high' | 'low' | 'critical_high' | 'critical_low';
}

interface LabReport {
  id: string;
  date: string;
  patientName: string;
  mr: string;
  age: number;
  gender: 'M' | 'F';
  testName: string;
  category: string;
  status: 'completed' | 'pending' | 'in_progress';
  normalCount: number;
  abnormalCount: number;
  criticalValues: boolean;
  parameters: LabParameter[];
  trends?: { parameter: string; values: string }[];
  doctorNotes?: string;
}

// ── Demo Data ─────────────────────────────────────────────────

const labResults: LabReport[] = [
  {
    id: '1', date: '29 Mar 2026', patientName: 'Ahmad Khan', mr: 'MR-20240445', age: 52, gender: 'M',
    testName: 'HbA1c', category: 'Endocrine', status: 'completed', normalCount: 0, abnormalCount: 1, criticalValues: false,
    parameters: [
      { parameter: 'HbA1c', value: '7.0', unit: '%', referenceRange: '4.0 - 5.6', flag: 'high' },
      { parameter: 'Estimated Average Glucose', value: '154', unit: 'mg/dL', referenceRange: '< 126', flag: 'high' },
    ],
    trends: [{ parameter: 'HbA1c', values: '7.8 -> 7.4 -> 7.0' }],
    doctorNotes: 'HbA1c improving. Continue current regimen with Metformin 1000mg BD. Target < 6.5%.',
  },
  {
    id: '2', date: '29 Mar 2026', patientName: 'Ahmad Khan', mr: 'MR-20240445', age: 52, gender: 'M',
    testName: 'Renal Function Tests', category: 'Biochemistry', status: 'completed', normalCount: 3, abnormalCount: 2, criticalValues: false,
    parameters: [
      { parameter: 'Creatinine', value: '1.4', unit: 'mg/dL', referenceRange: '0.7 - 1.3', flag: 'high' },
      { parameter: 'BUN', value: '22', unit: 'mg/dL', referenceRange: '7 - 20', flag: 'high' },
      { parameter: 'Sodium', value: '140', unit: 'mEq/L', referenceRange: '136 - 145', flag: 'normal' },
      { parameter: 'Potassium', value: '4.2', unit: 'mEq/L', referenceRange: '3.5 - 5.0', flag: 'normal' },
      { parameter: 'eGFR', value: '62', unit: 'mL/min', referenceRange: '> 90', flag: 'low' },
    ],
    trends: [{ parameter: 'Creatinine', values: '1.5 -> 1.4 -> 1.4' }, { parameter: 'eGFR', values: '58 -> 60 -> 62' }],
    doctorNotes: 'CKD Stage 2 stable. eGFR showing mild improvement. Continue nephroprotective approach. Avoid nephrotoxic agents.',
  },
  {
    id: '3', date: '29 Mar 2026', patientName: 'Rashid Mehmood', mr: 'MR-20240812', age: 58, gender: 'M',
    testName: 'Cardiac Enzymes', category: 'Cardiology', status: 'completed', normalCount: 2, abnormalCount: 1, criticalValues: true,
    parameters: [
      { parameter: 'Troponin I', value: '0.08', unit: 'ng/mL', referenceRange: '< 0.04', flag: 'critical_high' },
      { parameter: 'CK-MB', value: '28', unit: 'U/L', referenceRange: '< 25', flag: 'high' },
      { parameter: 'CK Total', value: '180', unit: 'U/L', referenceRange: '38 - 174', flag: 'high' },
      { parameter: 'LDH', value: '210', unit: 'U/L', referenceRange: '140 - 280', flag: 'normal' },
      { parameter: 'Myoglobin', value: '85', unit: 'ng/mL', referenceRange: '< 90', flag: 'normal' },
    ],
    doctorNotes: 'Troponin elevated. Serial monitoring needed. Rule out acute coronary event. ECG and Echo ordered.',
  },
  {
    id: '4', date: '28 Mar 2026', patientName: 'Nazia Begum', mr: 'MR-20241201', age: 45, gender: 'F',
    testName: 'Lipid Profile', category: 'Biochemistry', status: 'completed', normalCount: 2, abnormalCount: 2, criticalValues: false,
    parameters: [
      { parameter: 'Total Cholesterol', value: '228', unit: 'mg/dL', referenceRange: '< 200', flag: 'high' },
      { parameter: 'LDL Cholesterol', value: '148', unit: 'mg/dL', referenceRange: '< 130', flag: 'high' },
      { parameter: 'HDL Cholesterol', value: '52', unit: 'mg/dL', referenceRange: '> 40', flag: 'normal' },
      { parameter: 'Triglycerides', value: '140', unit: 'mg/dL', referenceRange: '< 150', flag: 'normal' },
    ],
    doctorNotes: 'Dyslipidemia. Start Atorvastatin 20mg HS. Dietary counseling provided.',
  },
  {
    id: '5', date: '28 Mar 2026', patientName: 'Bushra Nawaz', mr: 'MR-20240876', age: 40, gender: 'F',
    testName: 'HbA1c', category: 'Endocrine', status: 'completed', normalCount: 0, abnormalCount: 1, criticalValues: false,
    parameters: [
      { parameter: 'HbA1c', value: '7.4', unit: '%', referenceRange: '4.0 - 5.6', flag: 'high' },
      { parameter: 'Estimated Average Glucose', value: '166', unit: 'mg/dL', referenceRange: '< 126', flag: 'high' },
    ],
    trends: [{ parameter: 'HbA1c', values: '8.1 -> 7.8 -> 7.4' }],
    doctorNotes: 'Improving trend. Continue Metformin + Glimepiride. Reinforce dietary compliance.',
  },
  {
    id: '6', date: '27 Mar 2026', patientName: 'Fahad Ali', mr: 'MR-20241456', age: 63, gender: 'M',
    testName: 'NT-proBNP', category: 'Cardiology', status: 'completed', normalCount: 0, abnormalCount: 1, criticalValues: false,
    parameters: [
      { parameter: 'NT-proBNP', value: '480', unit: 'pg/mL', referenceRange: '< 125', flag: 'high' },
    ],
    trends: [{ parameter: 'NT-proBNP', values: '620 -> 540 -> 480' }],
    doctorNotes: 'Still elevated but improving. CHF management adequate. Continue current regimen.',
  },
  {
    id: '7', date: '27 Mar 2026', patientName: 'Samina Akhtar', mr: 'MR-20241567', age: 50, gender: 'F',
    testName: 'Complete Blood Count', category: 'Hematology', status: 'completed', normalCount: 5, abnormalCount: 1, criticalValues: false,
    parameters: [
      { parameter: 'Hemoglobin', value: '11.2', unit: 'g/dL', referenceRange: '12.0 - 16.0', flag: 'low' },
      { parameter: 'WBC', value: '7.2', unit: 'x10^3/uL', referenceRange: '4.0 - 11.0', flag: 'normal' },
      { parameter: 'Platelets', value: '245', unit: 'x10^3/uL', referenceRange: '150 - 400', flag: 'normal' },
      { parameter: 'MCV', value: '82', unit: 'fL', referenceRange: '80 - 100', flag: 'normal' },
      { parameter: 'RBC', value: '4.1', unit: 'x10^6/uL', referenceRange: '3.8 - 5.1', flag: 'normal' },
      { parameter: 'Hematocrit', value: '34', unit: '%', referenceRange: '36 - 46', flag: 'low' },
    ],
    trends: [{ parameter: 'Hemoglobin', values: '10.5 -> 11.2' }],
    doctorNotes: 'Mild anemia improving. Continue iron supplementation. Recheck in 1 month.',
  },
  {
    id: '8', date: '26 Mar 2026', patientName: 'Imran Saeed', mr: 'MR-20240654', age: 62, gender: 'M',
    testName: 'Arterial Blood Gas', category: 'Pulmonology', status: 'completed', normalCount: 3, abnormalCount: 2, criticalValues: false,
    parameters: [
      { parameter: 'pH', value: '7.38', unit: '', referenceRange: '7.35 - 7.45', flag: 'normal' },
      { parameter: 'pCO2', value: '48', unit: 'mmHg', referenceRange: '35 - 45', flag: 'high' },
      { parameter: 'pO2', value: '72', unit: 'mmHg', referenceRange: '80 - 100', flag: 'low' },
      { parameter: 'HCO3', value: '26', unit: 'mEq/L', referenceRange: '22 - 26', flag: 'normal' },
      { parameter: 'SaO2', value: '93', unit: '%', referenceRange: '95 - 100', flag: 'low' },
    ],
    doctorNotes: 'Compensated respiratory acidosis consistent with COPD. Optimize bronchodilator therapy.',
  },
  {
    id: '9', date: '26 Mar 2026', patientName: 'Sadia Parveen', mr: 'MR-20241345', age: 35, gender: 'F',
    testName: 'Thyroid Function Tests', category: 'Endocrine', status: 'completed', normalCount: 3, abnormalCount: 0, criticalValues: false,
    parameters: [
      { parameter: 'TSH', value: '2.4', unit: 'mIU/L', referenceRange: '0.4 - 4.0', flag: 'normal' },
      { parameter: 'Free T3', value: '3.2', unit: 'pg/mL', referenceRange: '2.3 - 4.2', flag: 'normal' },
      { parameter: 'Free T4', value: '1.1', unit: 'ng/dL', referenceRange: '0.8 - 1.8', flag: 'normal' },
    ],
    doctorNotes: 'Thyroid function normal. Palpitations not thyroid-related. Likely anxiety-driven.',
  },
  {
    id: '10', date: '25 Mar 2026', patientName: 'Tariq Hussain', mr: 'MR-20241078', age: 55, gender: 'M',
    testName: 'Lipid Profile', category: 'Biochemistry', status: 'completed', normalCount: 4, abnormalCount: 0, criticalValues: false,
    parameters: [
      { parameter: 'Total Cholesterol', value: '168', unit: 'mg/dL', referenceRange: '< 200', flag: 'normal' },
      { parameter: 'LDL Cholesterol', value: '88', unit: 'mg/dL', referenceRange: '< 100', flag: 'normal' },
      { parameter: 'HDL Cholesterol', value: '52', unit: 'mg/dL', referenceRange: '> 40', flag: 'normal' },
      { parameter: 'Triglycerides', value: '140', unit: 'mg/dL', referenceRange: '< 150', flag: 'normal' },
    ],
    doctorNotes: 'Excellent lipid control on Atorvastatin 40mg. LDL at target for post-MI patient.',
  },
  {
    id: '11', date: '25 Mar 2026', patientName: 'Zainab Fatima', mr: 'MR-20240998', age: 48, gender: 'F',
    testName: 'Coagulation Profile', category: 'Hematology', status: 'pending', normalCount: 0, abnormalCount: 0, criticalValues: false,
    parameters: [],
  },
  {
    id: '12', date: '29 Mar 2026', patientName: 'Khalid Mahmood', mr: 'MR-20241678', age: 47, gender: 'M',
    testName: 'Basic Metabolic Panel', category: 'Biochemistry', status: 'in_progress', normalCount: 0, abnormalCount: 0, criticalValues: false,
    parameters: [],
  },
];

// ── Helpers ───────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; variant: 'completed' | 'waiting' | 'in_progress' }> = {
  completed: { label: 'Completed', variant: 'completed' },
  pending: { label: 'Pending', variant: 'waiting' },
  in_progress: { label: 'Processing', variant: 'in_progress' },
};

function flagIcon(flag: string) {
  switch (flag) {
    case 'high':
    case 'critical_high':
      return <ArrowUp className="w-3.5 h-3.5 text-red-500" />;
    case 'low':
    case 'critical_low':
      return <ArrowDown className="w-3.5 h-3.5 text-blue-500" />;
    default:
      return <Minus className="w-3.5 h-3.5 text-emerald-500" />;
  }
}

function flagColor(flag: string) {
  switch (flag) {
    case 'high': return 'text-red-500 font-semibold';
    case 'critical_high': return 'text-red-600 font-bold';
    case 'low': return 'text-blue-500 font-semibold';
    case 'critical_low': return 'text-blue-600 font-bold';
    default: return 'text-[var(--text-primary)]';
  }
}

function flagLabel(flag: string) {
  switch (flag) {
    case 'high': return { text: 'High', variant: 'danger' as const };
    case 'critical_high': return { text: 'Critical High', variant: 'danger' as const };
    case 'low': return { text: 'Low', variant: 'info' as const };
    case 'critical_low': return { text: 'Critical Low', variant: 'info' as const };
    default: return { text: 'Normal', variant: 'success' as const };
  }
}

// ── Component ─────────────────────────────────────────────────

export default function LabResults() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [flagFilter, setFlagFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);

  const todayResults = labResults.filter((r) => r.date === '29 Mar 2026' && r.status === 'completed').length;
  const pendingOrders = labResults.filter((r) => r.status === 'pending' || r.status === 'in_progress').length;
  const criticalCount = labResults.filter((r) => r.criticalValues).length;

  const categories = [...new Set(labResults.map((r) => r.category))];

  const filtered = labResults.filter((r) => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (flagFilter === 'abnormal' && r.abnormalCount === 0) return false;
    if (search.length > 0) {
      const q = search.toLowerCase();
      return (
        r.patientName.toLowerCase().includes(q) ||
        r.mr.toLowerCase().includes(q) ||
        r.testName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Lab Results
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Dr. Tariq Ahmed &middot; View lab results for your patients
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <MetricCard
          title="Results Today"
          value={todayResults}
          subtitle="Completed today"
          icon={FlaskConical}
          trend={{ value: 5, positive: true }}
        />
        <MetricCard
          title="Pending Orders"
          value={pendingOrders}
          subtitle="Awaiting results"
          icon={Clock}
          iconColor="bg-[var(--warning-bg)] text-amber-600"
        />
        <MetricCard
          title="Critical Values"
          value={criticalCount}
          subtitle="Require immediate attention"
          icon={AlertTriangle}
          iconColor="bg-[var(--danger-bg)] text-red-600"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by patient, MR#, or test name..."
            icon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={flagFilter}
            onChange={(e) => setFlagFilter(e.target.value)}
            className="rounded-[var(--radius-sm)] border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="all">All Results</option>
            <option value="abnormal">Abnormal Only</option>
          </select>
        </div>
      </div>

      {/* Lab Results Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>MR#</TableHead>
            <TableHead>Test Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Flags</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((report) => {
            const sc = statusConfig[report.status];
            return (
              <TableRow
                key={report.id}
                className={report.criticalValues ? 'border-l-4 border-l-red-500 bg-red-500/10' : ''}
              >
                <TableCell>
                  <span className="text-xs text-[var(--text-secondary)]">{report.date}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{report.patientName}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-[var(--text-secondary)]">{report.mr}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-3.5 h-3.5 text-[var(--primary)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">{report.testName}</span>
                    {report.criticalValues && (
                      <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="default" className="text-[10px]">{report.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={sc.variant} dot className="text-[10px]">{sc.label}</Badge>
                </TableCell>
                <TableCell>
                  {report.status === 'completed' ? (
                    <div className="flex items-center gap-2">
                      {report.normalCount > 0 && (
                        <span className="text-xs text-emerald-600 font-medium">{report.normalCount} normal</span>
                      )}
                      {report.abnormalCount > 0 && (
                        <span className="text-xs text-red-500 font-medium">{report.abnormalCount} abnormal</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--text-tertiary)]">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {report.status === 'completed' && (
                    <Button size="sm" variant="ghost" onClick={() => setSelectedReport(report)}>
                      <Eye className="w-3.5 h-3.5" />
                      View Report
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {filtered.length === 0 && (
        <EmptyState
          type="no-results"
          title="No lab results found"
          description="No results match your current filters. Try adjusting the category, flag filters, or search term."
          size="md"
        />
      )}

      {/* Lab Report Detail Modal */}
      <Modal
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={selectedReport ? `${selectedReport.testName} - Lab Report` : ''}
        description={selectedReport ? `${selectedReport.date}` : ''}
        size="xl"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Patient + Test Info Header */}
            <div className="flex items-center gap-4 glass-card-static p-4 rounded-[var(--radius-sm)]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-teal-400 flex items-center justify-center text-white font-bold">
                {selectedReport.patientName.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-[var(--text-primary)]">{selectedReport.patientName}</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {selectedReport.mr} &middot; {selectedReport.age}{selectedReport.gender} &middot; {selectedReport.category}
                </p>
              </div>
              {selectedReport.criticalValues && (
                <Badge variant="danger" dot>
                  <AlertTriangle className="w-3 h-3" />
                  Critical Values
                </Badge>
              )}
            </div>

            {/* Results Table */}
            <div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Test Parameters</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--surface-border)]">
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Parameter</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Value</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Unit</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Reference Range</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.parameters.map((param, i) => {
                      const fl = flagLabel(param.flag);
                      const isCritical = param.flag.startsWith('critical');
                      return (
                        <tr
                          key={i}
                          className={`border-b border-[var(--surface-border)] ${
                            isCritical ? 'bg-red-500/10' : ''
                          }`}
                        >
                          <td className="px-3 py-2.5 font-medium text-[var(--text-primary)]">
                            {param.parameter}
                            {isCritical && <AlertTriangle className="w-3 h-3 text-red-500 inline ml-1" />}
                          </td>
                          <td className={`px-3 py-2.5 ${flagColor(param.flag)}`}>
                            <div className="flex items-center gap-1">
                              {param.value}
                              {flagIcon(param.flag)}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-[var(--text-secondary)]">{param.unit}</td>
                          <td className="px-3 py-2.5 text-[var(--text-tertiary)]">{param.referenceRange}</td>
                          <td className="px-3 py-2.5">
                            <Badge variant={fl.variant} className="text-[10px]">{fl.text}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trends */}
            {selectedReport.trends && selectedReport.trends.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                  <TrendingUp className="w-4 h-4 inline mr-1.5 text-[var(--primary)]" />
                  Trend Analysis
                </h4>
                <div className="space-y-2">
                  {selectedReport.trends.map((trend, i) => (
                    <div key={i} className="glass-card-static p-3 rounded-[var(--radius-sm)] flex items-center gap-3">
                      <span className="text-sm font-medium text-[var(--text-primary)]">{trend.parameter}:</span>
                      <span className="text-sm text-[var(--text-secondary)] font-mono">{trend.values}</span>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Doctor Notes */}
            {selectedReport.doctorNotes && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                  <FileText className="w-4 h-4 inline mr-1.5 text-[var(--primary)]" />
                  Doctor Notes
                </h4>
                <div className="glass-card-static p-4 rounded-[var(--radius-sm)]">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{selectedReport.doctorNotes}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
