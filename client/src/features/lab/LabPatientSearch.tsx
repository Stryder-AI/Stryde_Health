import { useState, useEffect } from 'react';
import {
  Search,
  User,
  Phone,
  FlaskConical,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Droplets,
  FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────

interface LabResult {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  abnormal: boolean;
}

interface LabTest {
  id: string;
  date: string;
  testName: string;
  orderedBy: string;
  status: 'completed' | 'in_progress' | 'pending';
  abnormalCount: number;
  results: LabResult[];
}

interface LabPatient {
  mrn: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  phone: string;
  bloodGroup: string;
  totalTests: number;
  lastTestDate: string;
  tests: LabTest[];
}

// ─── Demo Data ─────────────────────────────────────────────────────────────

const demoPatients: LabPatient[] = [
  {
    mrn: 'MR-10234',
    name: 'Ahmed Khan',
    age: 45,
    gender: 'Male',
    phone: '0321-5551234',
    bloodGroup: 'B+',
    totalTests: 5,
    lastTestDate: '2026-03-28',
    tests: [
      {
        id: 'LT-5001', date: '2026-03-28', testName: 'Complete Blood Count', orderedBy: 'Dr. Sarah Ali', status: 'completed', abnormalCount: 2,
        results: [
          { parameter: 'Hemoglobin', value: '11.2', unit: 'g/dL', referenceRange: '13.0 - 17.0', abnormal: true },
          { parameter: 'WBC Count', value: '7500', unit: '/uL', referenceRange: '4000 - 11000', abnormal: false },
          { parameter: 'Platelet Count', value: '120000', unit: '/uL', referenceRange: '150000 - 400000', abnormal: true },
          { parameter: 'RBC Count', value: '4.8', unit: 'million/uL', referenceRange: '4.5 - 5.5', abnormal: false },
          { parameter: 'HCT', value: '42', unit: '%', referenceRange: '40 - 54', abnormal: false },
        ],
      },
      {
        id: 'LT-4892', date: '2026-03-15', testName: 'Lipid Profile', orderedBy: 'Dr. Imran Shah', status: 'completed', abnormalCount: 1,
        results: [
          { parameter: 'Total Cholesterol', value: '245', unit: 'mg/dL', referenceRange: '< 200', abnormal: true },
          { parameter: 'HDL', value: '45', unit: 'mg/dL', referenceRange: '40 - 60', abnormal: false },
          { parameter: 'LDL', value: '95', unit: 'mg/dL', referenceRange: '< 100', abnormal: false },
          { parameter: 'Triglycerides', value: '140', unit: 'mg/dL', referenceRange: '< 150', abnormal: false },
        ],
      },
      {
        id: 'LT-4710', date: '2026-02-20', testName: 'HbA1c', orderedBy: 'Dr. Sarah Ali', status: 'completed', abnormalCount: 1,
        results: [
          { parameter: 'HbA1c', value: '7.2', unit: '%', referenceRange: '< 5.7', abnormal: true },
          { parameter: 'Est. Avg Glucose', value: '160', unit: 'mg/dL', referenceRange: '< 117', abnormal: true },
        ],
      },
      {
        id: 'LT-4501', date: '2026-01-10', testName: 'Liver Function Test', orderedBy: 'Dr. Ayesha Malik', status: 'completed', abnormalCount: 0,
        results: [
          { parameter: 'SGPT (ALT)', value: '32', unit: 'U/L', referenceRange: '7 - 56', abnormal: false },
          { parameter: 'SGOT (AST)', value: '28', unit: 'U/L', referenceRange: '10 - 40', abnormal: false },
          { parameter: 'Total Bilirubin', value: '0.8', unit: 'mg/dL', referenceRange: '0.1 - 1.2', abnormal: false },
        ],
      },
      {
        id: 'LT-4320', date: '2025-12-05', testName: 'Renal Function Test', orderedBy: 'Dr. Imran Shah', status: 'completed', abnormalCount: 0,
        results: [
          { parameter: 'Creatinine', value: '1.0', unit: 'mg/dL', referenceRange: '0.7 - 1.3', abnormal: false },
          { parameter: 'Blood Urea', value: '30', unit: 'mg/dL', referenceRange: '15 - 40', abnormal: false },
          { parameter: 'Uric Acid', value: '5.5', unit: 'mg/dL', referenceRange: '3.5 - 7.2', abnormal: false },
        ],
      },
    ],
  },
  {
    mrn: 'MR-10189',
    name: 'Fatima Noor',
    age: 32,
    gender: 'Female',
    phone: '0300-6782345',
    bloodGroup: 'A+',
    totalTests: 4,
    lastTestDate: '2026-03-27',
    tests: [
      {
        id: 'LT-5010', date: '2026-03-27', testName: 'Thyroid Profile', orderedBy: 'Dr. Kamran Javed', status: 'completed', abnormalCount: 1,
        results: [
          { parameter: 'TSH', value: '6.8', unit: 'uIU/mL', referenceRange: '0.4 - 4.0', abnormal: true },
          { parameter: 'T3', value: '110', unit: 'ng/dL', referenceRange: '80 - 200', abnormal: false },
          { parameter: 'T4', value: '7.5', unit: 'ug/dL', referenceRange: '4.5 - 12.0', abnormal: false },
        ],
      },
      {
        id: 'LT-4880', date: '2026-03-10', testName: 'Complete Blood Count', orderedBy: 'Dr. Sarah Ali', status: 'completed', abnormalCount: 1,
        results: [
          { parameter: 'Hemoglobin', value: '10.8', unit: 'g/dL', referenceRange: '12.0 - 15.5', abnormal: true },
          { parameter: 'WBC Count', value: '6200', unit: '/uL', referenceRange: '4000 - 11000', abnormal: false },
          { parameter: 'Platelet Count', value: '250000', unit: '/uL', referenceRange: '150000 - 400000', abnormal: false },
        ],
      },
      {
        id: 'LT-4600', date: '2026-02-01', testName: 'Urine Routine Examination', orderedBy: 'Dr. Ayesha Malik', status: 'completed', abnormalCount: 0,
        results: [
          { parameter: 'Color', value: 'Pale Yellow', unit: '', referenceRange: 'Pale Yellow - Amber', abnormal: false },
          { parameter: 'pH', value: '6.0', unit: '', referenceRange: '4.5 - 8.0', abnormal: false },
          { parameter: 'Protein', value: 'Nil', unit: '', referenceRange: 'Nil', abnormal: false },
        ],
      },
      {
        id: 'LT-4410', date: '2025-12-20', testName: 'Lipid Profile', orderedBy: 'Dr. Kamran Javed', status: 'completed', abnormalCount: 0,
        results: [
          { parameter: 'Total Cholesterol', value: '180', unit: 'mg/dL', referenceRange: '< 200', abnormal: false },
          { parameter: 'HDL', value: '55', unit: 'mg/dL', referenceRange: '50 - 60', abnormal: false },
          { parameter: 'LDL', value: '85', unit: 'mg/dL', referenceRange: '< 100', abnormal: false },
        ],
      },
    ],
  },
  {
    mrn: 'MR-10301',
    name: 'Ali Raza',
    age: 58,
    gender: 'Male',
    phone: '0333-9014567',
    bloodGroup: 'O+',
    totalTests: 3,
    lastTestDate: '2026-03-26',
    tests: [
      {
        id: 'LT-4995', date: '2026-03-26', testName: 'Renal Function Test', orderedBy: 'Dr. Sarah Ali', status: 'completed', abnormalCount: 2,
        results: [
          { parameter: 'Creatinine', value: '2.1', unit: 'mg/dL', referenceRange: '0.7 - 1.3', abnormal: true },
          { parameter: 'Blood Urea', value: '55', unit: 'mg/dL', referenceRange: '15 - 40', abnormal: true },
          { parameter: 'Uric Acid', value: '6.0', unit: 'mg/dL', referenceRange: '3.5 - 7.2', abnormal: false },
          { parameter: 'Potassium', value: '4.8', unit: 'mEq/L', referenceRange: '3.5 - 5.1', abnormal: false },
        ],
      },
      {
        id: 'LT-4750', date: '2026-02-15', testName: 'Complete Blood Count', orderedBy: 'Dr. Bilal Ahmed', status: 'completed', abnormalCount: 0,
        results: [
          { parameter: 'Hemoglobin', value: '14.5', unit: 'g/dL', referenceRange: '13.0 - 17.0', abnormal: false },
          { parameter: 'WBC Count', value: '8000', unit: '/uL', referenceRange: '4000 - 11000', abnormal: false },
        ],
      },
      {
        id: 'LT-4500', date: '2026-01-05', testName: 'Electrolytes Panel', orderedBy: 'Dr. Sarah Ali', status: 'completed', abnormalCount: 1,
        results: [
          { parameter: 'Sodium', value: '132', unit: 'mEq/L', referenceRange: '136 - 146', abnormal: true },
          { parameter: 'Potassium', value: '4.2', unit: 'mEq/L', referenceRange: '3.5 - 5.1', abnormal: false },
          { parameter: 'Chloride', value: '101', unit: 'mEq/L', referenceRange: '98 - 106', abnormal: false },
        ],
      },
    ],
  },
  {
    mrn: 'MR-10156',
    name: 'Zainab Bibi',
    age: 28,
    gender: 'Female',
    phone: '0312-2345678',
    bloodGroup: 'AB+',
    totalTests: 3,
    lastTestDate: '2026-03-25',
    tests: [
      {
        id: 'LT-4980', date: '2026-03-25', testName: 'Thyroid Profile', orderedBy: 'Dr. Kamran Javed', status: 'completed', abnormalCount: 0,
        results: [
          { parameter: 'TSH', value: '2.5', unit: 'uIU/mL', referenceRange: '0.4 - 4.0', abnormal: false },
          { parameter: 'T3', value: '130', unit: 'ng/dL', referenceRange: '80 - 200', abnormal: false },
          { parameter: 'T4', value: '8.0', unit: 'ug/dL', referenceRange: '4.5 - 12.0', abnormal: false },
        ],
      },
      {
        id: 'LT-4700', date: '2026-02-10', testName: 'Complete Blood Count', orderedBy: 'Dr. Sarah Ali', status: 'completed', abnormalCount: 1,
        results: [
          { parameter: 'Hemoglobin', value: '11.0', unit: 'g/dL', referenceRange: '12.0 - 15.5', abnormal: true },
          { parameter: 'WBC Count', value: '7000', unit: '/uL', referenceRange: '4000 - 11000', abnormal: false },
        ],
      },
      {
        id: 'LT-4450', date: '2025-12-28', testName: 'Serology Panel', orderedBy: 'Dr. Ayesha Malik', status: 'completed', abnormalCount: 0,
        results: [
          { parameter: 'HBsAg', value: 'Non-Reactive', unit: '', referenceRange: 'Non-Reactive', abnormal: false },
          { parameter: 'Anti-HCV', value: 'Non-Reactive', unit: '', referenceRange: 'Non-Reactive', abnormal: false },
        ],
      },
    ],
  },
  {
    mrn: 'MR-10278',
    name: 'Hassan Mehmood',
    age: 62,
    gender: 'Male',
    phone: '0345-8901234',
    bloodGroup: 'A-',
    totalTests: 4,
    lastTestDate: '2026-03-24',
    tests: [
      {
        id: 'LT-4960', date: '2026-03-24', testName: 'Coagulation Profile', orderedBy: 'Dr. Sarah Ali', status: 'completed', abnormalCount: 1,
        results: [
          { parameter: 'PT', value: '15.2', unit: 'seconds', referenceRange: '11 - 13.5', abnormal: true },
          { parameter: 'INR', value: '1.1', unit: '', referenceRange: '0.8 - 1.2', abnormal: false },
          { parameter: 'APTT', value: '30', unit: 'seconds', referenceRange: '25 - 35', abnormal: false },
        ],
      },
      {
        id: 'LT-4800', date: '2026-03-01', testName: 'Liver Function Test', orderedBy: 'Dr. Ayesha Malik', status: 'completed', abnormalCount: 2,
        results: [
          { parameter: 'SGPT (ALT)', value: '72', unit: 'U/L', referenceRange: '7 - 56', abnormal: true },
          { parameter: 'SGOT (AST)', value: '58', unit: 'U/L', referenceRange: '10 - 40', abnormal: true },
          { parameter: 'Total Bilirubin', value: '1.0', unit: 'mg/dL', referenceRange: '0.1 - 1.2', abnormal: false },
          { parameter: 'Albumin', value: '4.0', unit: 'g/dL', referenceRange: '3.5 - 5.5', abnormal: false },
        ],
      },
      {
        id: 'LT-4650', date: '2026-02-05', testName: 'Complete Blood Count', orderedBy: 'Dr. Bilal Ahmed', status: 'completed', abnormalCount: 0,
        results: [
          { parameter: 'Hemoglobin', value: '14.0', unit: 'g/dL', referenceRange: '13.0 - 17.0', abnormal: false },
          { parameter: 'WBC Count', value: '6800', unit: '/uL', referenceRange: '4000 - 11000', abnormal: false },
        ],
      },
      {
        id: 'LT-4400', date: '2025-12-15', testName: 'Lipid Profile', orderedBy: 'Dr. Imran Shah', status: 'completed', abnormalCount: 1,
        results: [
          { parameter: 'Total Cholesterol', value: '220', unit: 'mg/dL', referenceRange: '< 200', abnormal: true },
          { parameter: 'Triglycerides', value: '180', unit: 'mg/dL', referenceRange: '< 150', abnormal: true },
          { parameter: 'HDL', value: '38', unit: 'mg/dL', referenceRange: '40 - 60', abnormal: true },
        ],
      },
    ],
  },
  {
    mrn: 'MR-10345',
    name: 'Saima Akram',
    age: 38,
    gender: 'Female',
    phone: '0321-7654321',
    bloodGroup: 'B-',
    totalTests: 2,
    lastTestDate: '2026-03-22',
    tests: [
      {
        id: 'LT-4940', date: '2026-03-22', testName: 'Thyroid Profile', orderedBy: 'Dr. Kamran Javed', status: 'completed', abnormalCount: 2,
        results: [
          { parameter: 'TSH', value: '0.2', unit: 'uIU/mL', referenceRange: '0.4 - 4.0', abnormal: true },
          { parameter: 'T3', value: '250', unit: 'ng/dL', referenceRange: '80 - 200', abnormal: true },
          { parameter: 'T4', value: '9.0', unit: 'ug/dL', referenceRange: '4.5 - 12.0', abnormal: false },
        ],
      },
      {
        id: 'LT-4680', date: '2026-02-08', testName: 'Complete Blood Count', orderedBy: 'Dr. Sarah Ali', status: 'completed', abnormalCount: 0,
        results: [
          { parameter: 'Hemoglobin', value: '13.5', unit: 'g/dL', referenceRange: '12.0 - 15.5', abnormal: false },
          { parameter: 'WBC Count', value: '5500', unit: '/uL', referenceRange: '4000 - 11000', abnormal: false },
          { parameter: 'Platelet Count', value: '280000', unit: '/uL', referenceRange: '150000 - 400000', abnormal: false },
        ],
      },
    ],
  },
  {
    mrn: 'MR-10412',
    name: 'Mohammad Irfan',
    age: 50,
    gender: 'Male',
    phone: '0300-1112233',
    bloodGroup: 'O-',
    totalTests: 3,
    lastTestDate: '2026-03-29',
    tests: [
      {
        id: 'LT-5020', date: '2026-03-29', testName: 'Blood Sugar', orderedBy: 'Dr. Sarah Ali', status: 'in_progress', abnormalCount: 0,
        results: [
          { parameter: 'Fasting Blood Sugar', value: '145', unit: 'mg/dL', referenceRange: '70 - 100', abnormal: true },
          { parameter: 'Random Blood Sugar', value: '210', unit: 'mg/dL', referenceRange: '70 - 140', abnormal: true },
        ],
      },
      {
        id: 'LT-4820', date: '2026-03-05', testName: 'HbA1c', orderedBy: 'Dr. Sarah Ali', status: 'completed', abnormalCount: 1,
        results: [
          { parameter: 'HbA1c', value: '8.1', unit: '%', referenceRange: '< 5.7', abnormal: true },
          { parameter: 'Est. Avg Glucose', value: '186', unit: 'mg/dL', referenceRange: '< 117', abnormal: true },
        ],
      },
      {
        id: 'LT-4550', date: '2026-01-20', testName: 'Renal Function Test', orderedBy: 'Dr. Imran Shah', status: 'completed', abnormalCount: 0,
        results: [
          { parameter: 'Creatinine', value: '1.1', unit: 'mg/dL', referenceRange: '0.7 - 1.3', abnormal: false },
          { parameter: 'Blood Urea', value: '25', unit: 'mg/dL', referenceRange: '15 - 40', abnormal: false },
        ],
      },
    ],
  },
  {
    mrn: 'MR-10389',
    name: 'Amina Khatoon',
    age: 55,
    gender: 'Female',
    phone: '0333-4445566',
    bloodGroup: 'A+',
    totalTests: 4,
    lastTestDate: '2026-03-28',
    tests: [
      {
        id: 'LT-5015', date: '2026-03-28', testName: 'Liver Function Test', orderedBy: 'Dr. Kamran Javed', status: 'completed', abnormalCount: 1,
        results: [
          { parameter: 'SGPT (ALT)', value: '65', unit: 'U/L', referenceRange: '7 - 45', abnormal: true },
          { parameter: 'SGOT (AST)', value: '30', unit: 'U/L', referenceRange: '10 - 35', abnormal: false },
          { parameter: 'Alkaline Phosphatase', value: '120', unit: 'U/L', referenceRange: '44 - 147', abnormal: false },
          { parameter: 'Total Bilirubin', value: '0.9', unit: 'mg/dL', referenceRange: '0.1 - 1.2', abnormal: false },
        ],
      },
      {
        id: 'LT-4850', date: '2026-03-08', testName: 'Renal Function Test', orderedBy: 'Dr. Sarah Ali', status: 'completed', abnormalCount: 0,
        results: [
          { parameter: 'Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.6 - 1.1', abnormal: false },
          { parameter: 'Blood Urea', value: '28', unit: 'mg/dL', referenceRange: '15 - 40', abnormal: false },
        ],
      },
      {
        id: 'LT-4620', date: '2026-02-02', testName: 'Complete Blood Count', orderedBy: 'Dr. Bilal Ahmed', status: 'completed', abnormalCount: 1,
        results: [
          { parameter: 'Hemoglobin', value: '11.5', unit: 'g/dL', referenceRange: '12.0 - 15.5', abnormal: true },
          { parameter: 'WBC Count', value: '8500', unit: '/uL', referenceRange: '4000 - 11000', abnormal: false },
        ],
      },
      {
        id: 'LT-4380', date: '2025-12-10', testName: 'CRP', orderedBy: 'Dr. Ayesha Malik', status: 'completed', abnormalCount: 1,
        results: [
          { parameter: 'CRP (Quantitative)', value: '12.5', unit: 'mg/L', referenceRange: '< 6.0', abnormal: true },
          { parameter: 'CRP (Qualitative)', value: 'Positive', unit: '', referenceRange: 'Negative', abnormal: true },
        ],
      },
    ],
  },
];

// ─── Status Badge ──────────────────────────────────────────────────────────

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  completed: { bg: 'bg-[var(--success-bg)]', text: 'text-emerald-600 dark:text-emerald-400', label: 'Completed' },
  in_progress: { bg: 'bg-[var(--info-bg)]', text: 'text-blue-600 dark:text-blue-400', label: 'In Progress' },
  pending: { bg: 'bg-[var(--warning-bg)]', text: 'text-amber-600 dark:text-amber-400', label: 'Pending' },
};

// ─── Component ─────────────────────────────────────────────────────────────

export function LabPatientSearch() {
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<LabPatient | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const filteredPatients = searchQuery.trim()
    ? demoPatients.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone.includes(searchQuery)
      )
    : demoPatients;

  const handleViewHistory = (patient: LabPatient) => {
    setSelectedPatient(patient);
    setExpandedTests(new Set());
    setShowHistoryModal(true);
  };

  const toggleTest = (testId: string) => {
    setExpandedTests((prev) => {
      const next = new Set(prev);
      if (next.has(testId)) next.delete(testId);
      else next.add(testId);
      return next;
    });
  };

  // Compute summary stats for selected patient
  const totalAbnormal = selectedPatient
    ? selectedPatient.tests.reduce((sum, t) => sum + t.abnormalCount, 0)
    : 0;
  const testFrequency = selectedPatient
    ? selectedPatient.tests.reduce<Record<string, number>>((acc, t) => {
        acc[t.testName] = (acc[t.testName] || 0) + 1;
        return acc;
      }, {})
    : {};
  const mostFrequentTest = selectedPatient
    ? Object.entries(testFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    : 'N/A';

  return (
    <div className={`space-y-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Patient Lab Search
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Search patient records and view complete lab history
          </p>
        </div>
        <div className="w-96">
          <Input
            placeholder="Search by patient name, MR#, or phone..."
            icon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Results Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>MR#</TableHead>
            <TableHead>Patient Name</TableHead>
            <TableHead>Age/Gender</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Total Lab Tests</TableHead>
            <TableHead>Last Test Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPatients.map((patient) => (
            <TableRow key={patient.mrn}>
              <TableCell className="font-mono font-semibold text-[var(--primary)]">
                {patient.mrn}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-[var(--primary)]" />
                  </div>
                  <span className="font-medium">{patient.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{patient.age}y / {patient.gender}</span>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                  <Phone className="w-3.5 h-3.5" />
                  {patient.phone}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="info">{patient.totalTests} tests</Badge>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                  <Calendar className="w-3.5 h-3.5" />
                  {patient.lastTestDate}
                </span>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleViewHistory(patient)}>
                  <FileText className="w-3.5 h-3.5" />
                  View History
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Empty state */}
      {filteredPatients.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 mx-auto text-[var(--text-tertiary)] mb-4" />
          <p className="text-sm text-[var(--text-secondary)]">No patients found matching your search.</p>
        </div>
      )}

      {/* Lab History Modal */}
      <Modal
        open={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Patient Lab History"
        size="xl"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Patient Info Header */}
            <div className="glass-card-static p-4 flex items-center gap-4 flex-wrap">
              <div className="w-12 h-12 rounded-full bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">{selectedPatient.name}</h3>
                <div className="flex items-center gap-3 flex-wrap mt-1 text-xs text-[var(--text-secondary)]">
                  <span className="font-mono text-[var(--primary)]">{selectedPatient.mrn}</span>
                  <span>{selectedPatient.age}y / {selectedPatient.gender}</span>
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3 h-3" />
                    {selectedPatient.bloodGroup}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedPatient.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card-static p-3 text-center">
                <p className="text-2xl font-bold text-[var(--text-primary)]">{selectedPatient.totalTests}</p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 uppercase tracking-wider">Total Tests</p>
              </div>
              <div className="glass-card-static p-3 text-center">
                <p className={cn('text-2xl font-bold', totalAbnormal > 0 ? 'text-red-500' : 'text-emerald-500')}>
                  {totalAbnormal}
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 uppercase tracking-wider">Abnormal Findings</p>
              </div>
              <div className="glass-card-static p-3 text-center">
                <p className="text-sm font-bold text-[var(--text-primary)] leading-tight mt-1">{mostFrequentTest}</p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 uppercase tracking-wider">Most Frequent</p>
              </div>
            </div>

            {/* Test Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Test Timeline</h4>
              {selectedPatient.tests.map((test) => {
                const isExpanded = expandedTests.has(test.id);
                const st = statusStyles[test.status] || statusStyles.completed;
                return (
                  <div key={test.id} className="glass-card-static p-0 overflow-hidden">
                    {/* Test Header Row */}
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--surface-hover)] transition-colors duration-200"
                      onClick={() => toggleTest(test.id)}
                    >
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-[var(--text-primary)]">{test.testName}</span>
                          <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold', st.bg, st.text)}>
                            {st.label}
                          </span>
                          {test.abnormalCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--danger-bg)] text-red-600 dark:text-red-400">
                              <AlertTriangle className="w-3 h-3" />
                              {test.abnormalCount} abnormal
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-tertiary)]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {test.date}
                          </span>
                          <span>Ordered by {test.orderedBy}</span>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Results */}
                    {isExpanded && (
                      <div className="border-t border-[var(--surface-border)] animate-fade-in">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-[var(--surface)]">
                              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Parameter</th>
                              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Result</th>
                              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Unit</th>
                              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Reference Range</th>
                              <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider w-16">Flag</th>
                            </tr>
                          </thead>
                          <tbody>
                            {test.results.map((result, ri) => (
                              <tr
                                key={ri}
                                className={cn(
                                  'border-b border-[var(--surface-border)]',
                                  result.abnormal && 'bg-red-50/50 dark:bg-red-950/20'
                                )}
                              >
                                <td className="px-4 py-2.5 font-medium text-[var(--text-primary)]">
                                  {result.parameter}
                                </td>
                                <td className={cn(
                                  'px-4 py-2.5 font-mono text-sm',
                                  result.abnormal ? 'text-red-600 dark:text-red-400 font-bold' : 'text-[var(--text-primary)]'
                                )}>
                                  {result.value}
                                </td>
                                <td className="px-4 py-2.5 text-xs text-[var(--text-secondary)]">
                                  {result.unit || '\u2014'}
                                </td>
                                <td className="px-4 py-2.5 text-xs text-[var(--text-secondary)] font-mono">
                                  {result.referenceRange}
                                </td>
                                <td className="px-4 py-2.5">
                                  {result.abnormal && (
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
