import { useState } from 'react';
import {
  Search, Eye, Edit2, Users, UserPlus, Activity, HeartPulse,
  Phone, MapPin, AlertTriangle, Calendar, X,
} from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, SortableTableHead, TableFooter } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { useSorting } from '@/hooks/useSorting';
import { toast } from '@/components/ui/Toast';

interface Patient {
  id: string;
  mrNumber: string;
  name: string;
  gender: 'Male' | 'Female';
  age: number;
  dob: string;
  phone: string;
  cnic: string;
  bloodGroup: string;
  address: string;
  conditions: string[];
  allergies: string[];
  emergencyContact: { name: string; relation: string; phone: string };
  registeredDate: string;
  totalVisits: number;
  lastVisit: string;
}

const demoPatients: Patient[] = [
  { id: '1', mrNumber: 'MR-2026-00001', name: 'Ahmad Khan', gender: 'Male', age: 45, dob: '1981-03-15', phone: '0300-1234567', cnic: '35201-1234567-1', bloodGroup: 'A+', address: 'House 12, Street 5, Gulberg III, Lahore', conditions: ['Hypertension', 'Type 2 Diabetes'], allergies: ['Penicillin'], emergencyContact: { name: 'Fatima Khan', relation: 'Wife', phone: '0301-7654321' }, registeredDate: '2026-01-10', totalVisits: 12, lastVisit: '2026-03-28' },
  { id: '2', mrNumber: 'MR-2026-00002', name: 'Fatima Bibi', gender: 'Female', age: 32, dob: '1994-07-22', phone: '0321-2345678', cnic: '35202-2345678-2', bloodGroup: 'B+', address: 'Flat 4B, Al-Rahim Tower, DHA Phase 5, Lahore', conditions: [], allergies: [], emergencyContact: { name: 'Usman Ali', relation: 'Husband', phone: '0322-8765432' }, registeredDate: '2026-01-15', totalVisits: 3, lastVisit: '2026-03-20' },
  { id: '3', mrNumber: 'MR-2026-00003', name: 'Muhammad Usman', gender: 'Male', age: 58, dob: '1968-11-03', phone: '0333-3456789', cnic: '35203-3456789-3', bloodGroup: 'O+', address: '45-A, Model Town Extension, Lahore', conditions: ['Coronary Artery Disease', 'Hyperlipidemia'], allergies: ['Sulfa drugs', 'Aspirin'], emergencyContact: { name: 'Ayesha Usman', relation: 'Daughter', phone: '0334-9876543' }, registeredDate: '2026-02-01', totalVisits: 8, lastVisit: '2026-03-27' },
  { id: '4', mrNumber: 'MR-2026-00004', name: 'Saima Noor', gender: 'Female', age: 27, dob: '1999-01-18', phone: '0345-4567890', cnic: '35204-4567890-4', bloodGroup: 'AB+', address: '78-C, Johar Town, Lahore', conditions: ['Asthma'], allergies: ['Dust'], emergencyContact: { name: 'Noor Ahmed', relation: 'Father', phone: '0346-0987654' }, registeredDate: '2026-02-10', totalVisits: 5, lastVisit: '2026-03-25' },
  { id: '5', mrNumber: 'MR-2026-00005', name: 'Hassan Mahmood', gender: 'Male', age: 62, dob: '1964-05-30', phone: '0312-5678901', cnic: '35205-5678901-5', bloodGroup: 'A-', address: '12, Cavalry Ground, Lahore', conditions: ['COPD', 'Hypertension', 'Osteoarthritis'], allergies: ['Ibuprofen'], emergencyContact: { name: 'Bilal Mahmood', relation: 'Son', phone: '0313-1098765' }, registeredDate: '2026-02-14', totalVisits: 15, lastVisit: '2026-03-29' },
  { id: '6', mrNumber: 'MR-2026-00006', name: 'Ayesha Siddiqui', gender: 'Female', age: 41, dob: '1985-09-12', phone: '0300-6789012', cnic: '35206-6789012-6', bloodGroup: 'B-', address: '23, Wapda Town, Lahore', conditions: ['Hypothyroidism'], allergies: [], emergencyContact: { name: 'Kamran Siddiqui', relation: 'Husband', phone: '0301-2109876' }, registeredDate: '2026-02-20', totalVisits: 6, lastVisit: '2026-03-22' },
  { id: '7', mrNumber: 'MR-2026-00007', name: 'Bilal Shah', gender: 'Male', age: 35, dob: '1991-12-05', phone: '0321-7890123', cnic: '35207-7890123-7', bloodGroup: 'O-', address: '56, Garden Town, Lahore', conditions: [], allergies: ['Codeine'], emergencyContact: { name: 'Zara Shah', relation: 'Wife', phone: '0322-3210987' }, registeredDate: '2026-03-01', totalVisits: 2, lastVisit: '2026-03-18' },
  { id: '8', mrNumber: 'MR-2026-00008', name: 'Zainab Akhtar', gender: 'Female', age: 29, dob: '1997-04-25', phone: '0333-8901234', cnic: '35208-8901234-8', bloodGroup: 'A+', address: '89, Iqbal Town, Lahore', conditions: ['Iron Deficiency Anemia'], allergies: [], emergencyContact: { name: 'Tariq Akhtar', relation: 'Brother', phone: '0334-4321098' }, registeredDate: '2026-03-05', totalVisits: 4, lastVisit: '2026-03-26' },
  { id: '9', mrNumber: 'MR-2026-00009', name: 'Tariq Mehmood', gender: 'Male', age: 52, dob: '1974-08-17', phone: '0345-9012345', cnic: '35209-9012345-9', bloodGroup: 'AB-', address: '34, Township, Lahore', conditions: ['Type 2 Diabetes', 'Diabetic Neuropathy'], allergies: ['Metformin'], emergencyContact: { name: 'Nazia Mehmood', relation: 'Wife', phone: '0346-5432109' }, registeredDate: '2026-03-08', totalVisits: 7, lastVisit: '2026-03-28' },
  { id: '10', mrNumber: 'MR-2026-00010', name: 'Rabia Aslam', gender: 'Female', age: 38, dob: '1988-02-14', phone: '0312-0123456', cnic: '35210-0123456-0', bloodGroup: 'B+', address: '67, Faisal Town, Lahore', conditions: ['Migraine'], allergies: ['Triptans'], emergencyContact: { name: 'Aslam Pervez', relation: 'Father', phone: '0313-6543210' }, registeredDate: '2026-03-10', totalVisits: 3, lastVisit: '2026-03-24' },
  { id: '11', mrNumber: 'MR-2026-00011', name: 'Imran Hussain', gender: 'Male', age: 48, dob: '1978-06-20', phone: '0300-1122334', cnic: '35211-1122334-1', bloodGroup: 'O+', address: '15, Shadman Colony, Lahore', conditions: ['Gout', 'Hypertension'], allergies: [], emergencyContact: { name: 'Sana Hussain', relation: 'Wife', phone: '0301-4433221' }, registeredDate: '2026-03-12', totalVisits: 5, lastVisit: '2026-03-27' },
  { id: '12', mrNumber: 'MR-2026-00012', name: 'Nadia Pervez', gender: 'Female', age: 55, dob: '1971-10-08', phone: '0321-2233445', cnic: '35212-2233445-2', bloodGroup: 'A+', address: '90, Askari 10, Lahore', conditions: ['Rheumatoid Arthritis', 'Osteoporosis'], allergies: ['NSAIDs'], emergencyContact: { name: 'Pervez Ahmed', relation: 'Husband', phone: '0322-5544332' }, registeredDate: '2026-03-14', totalVisits: 9, lastVisit: '2026-03-29' },
  { id: '13', mrNumber: 'MR-2026-00013', name: 'Farhan Raza', gender: 'Male', age: 22, dob: '2004-01-30', phone: '0333-3344556', cnic: '35213-3344556-3', bloodGroup: 'B+', address: '22, Bahria Town, Lahore', conditions: [], allergies: [], emergencyContact: { name: 'Raza Ali', relation: 'Father', phone: '0334-6655443' }, registeredDate: '2026-03-20', totalVisits: 1, lastVisit: '2026-03-20' },
  { id: '14', mrNumber: 'MR-2026-00014', name: 'Saba Malik', gender: 'Female', age: 34, dob: '1992-11-11', phone: '0345-4455667', cnic: '35214-4455667-4', bloodGroup: 'O+', address: '45, Valencia Town, Lahore', conditions: ['PCOS', 'Insulin Resistance'], allergies: ['Latex'], emergencyContact: { name: 'Malik Arshad', relation: 'Husband', phone: '0346-7766554' }, registeredDate: '2026-03-25', totalVisits: 2, lastVisit: '2026-03-28' },
  { id: '15', mrNumber: 'MR-2026-00015', name: 'Waqas Ahmed', gender: 'Male', age: 70, dob: '1956-04-02', phone: '0312-5566778', cnic: '35215-5566778-5', bloodGroup: 'AB+', address: '8, Cantt Area, Lahore', conditions: ['Chronic Kidney Disease', 'Hypertension', 'Type 2 Diabetes'], allergies: ['Contrast dye', 'ACE inhibitors'], emergencyContact: { name: 'Asad Ahmed', relation: 'Son', phone: '0313-8877665' }, registeredDate: '2026-03-28', totalVisits: 1, lastVisit: '2026-03-28' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'All Genders' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
];

const BLOOD_GROUP_OPTIONS = [
  { value: '', label: 'All Blood Groups' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

const CONDITIONS_OPTIONS = [
  { value: '', label: 'All Patients' },
  { value: 'yes', label: 'With Conditions' },
  { value: 'no', label: 'No Conditions' },
];

export function PatientRegistry() {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [conditionsFilter, setConditionsFilter] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const filtered = demoPatients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.mrNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.cnic.includes(search);
    const matchesGender = !genderFilter || p.gender === genderFilter;
    const matchesBlood = !bloodGroupFilter || p.bloodGroup === bloodGroupFilter;
    const matchesConditions =
      !conditionsFilter ||
      (conditionsFilter === 'yes' && p.conditions.length > 0) ||
      (conditionsFilter === 'no' && p.conditions.length === 0);
    return matchesSearch && matchesGender && matchesBlood && matchesConditions;
  });

  const { sortedItems, sortKey, sortDir, handleSort } = useSorting(filtered);
  const { paginatedItems, currentPage, totalPages, itemsPerPage, goToPage, changePageSize } =
    usePagination(sortedItems, 10);

  const totalPatients = demoPatients.length;
  const newToday = demoPatients.filter((p) => p.registeredDate === '2026-03-29').length || 3;
  const activeThisMonth = demoPatients.filter((p) => p.lastVisit.startsWith('2026-03')).length;
  const withChronic = demoPatients.filter((p) => p.conditions.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Patient Registry</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">View and manage all registered patients</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <MetricCard title="Total Patients" value={totalPatients} icon={Users} subtitle="All registered patients" />
        <MetricCard title="New Today" value={newToday} icon={UserPlus} trend={{ value: 8, positive: true }} iconColor="bg-blue-500/10 text-blue-500" />
        <MetricCard title="Active This Month" value={activeThisMonth} icon={Activity} subtitle="Visited in March" iconColor="bg-emerald-500/10 text-emerald-500" />
        <MetricCard title="Chronic Conditions" value={withChronic} icon={HeartPulse} subtitle={`${Math.round((withChronic / totalPatients) * 100)}% of patients`} iconColor="bg-rose-500/10 text-rose-500" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[250px] max-w-sm">
          <Input
            placeholder="Search by name, MR#, phone, CNIC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-40">
          <Select options={GENDER_OPTIONS} value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} />
        </div>
        <div className="w-44">
          <Select options={BLOOD_GROUP_OPTIONS} value={bloodGroupFilter} onChange={(e) => setBloodGroupFilter(e.target.value)} />
        </div>
        <div className="w-44">
          <Select options={CONDITIONS_OPTIONS} value={conditionsFilter} onChange={(e) => setConditionsFilter(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card-static p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
        <TableHeader>
          <TableRow>
            <SortableTableHead
              sortKey="mrNumber"
              currentSortKey={sortKey as string | null}
              sortDir={sortDir}
              onSort={(k) => handleSort(k as keyof Patient)}
            >
              MR#
            </SortableTableHead>
            <SortableTableHead
              sortKey="name"
              currentSortKey={sortKey as string | null}
              sortDir={sortDir}
              onSort={(k) => handleSort(k as keyof Patient)}
            >
              Patient Name
            </SortableTableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Blood Group</TableHead>
            <TableHead>Conditions</TableHead>
            <SortableTableHead
              sortKey="lastVisit"
              currentSortKey={sortKey as string | null}
              sortDir={sortDir}
              onSort={(k) => handleSort(k as keyof Patient)}
            >
              Last Visit
            </SortableTableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedItems.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell>
                <span className="font-mono text-xs text-[var(--primary)] font-semibold">{patient.mrNumber}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xs font-semibold">
                    {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className="font-semibold text-sm">{patient.name}</span>
                </div>
              </TableCell>
              <TableCell>{patient.gender}</TableCell>
              <TableCell>{patient.age}y</TableCell>
              <TableCell><span className="text-xs">{patient.phone}</span></TableCell>
              <TableCell>
                <Badge variant="info">{patient.bloodGroup}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {patient.conditions.length === 0 ? (
                    <span className="text-xs text-[var(--text-tertiary)]">None</span>
                  ) : (
                    patient.conditions.slice(0, 2).map((c) => (
                      <Badge key={c} variant="warning">{c}</Badge>
                    ))
                  )}
                  {patient.conditions.length > 2 && (
                    <Badge variant="default">+{patient.conditions.length - 2}</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell><span className="text-xs text-[var(--text-secondary)]">{patient.lastVisit}</span></TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setSelectedPatient(patient); setIsEditing(false); }}
                    className="p-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4 text-[var(--primary)]" />
                  </button>
                  <button
                    onClick={() => { setSelectedPatient(patient); setIsEditing(true); }}
                    className="p-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-[var(--text-tertiary)]" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12 text-[var(--text-tertiary)]">
                No patients match your filters.
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

      {/* View Patient Modal */}
      {selectedPatient && !isEditing && (
        <Modal open={true} onClose={() => setSelectedPatient(null)} title="Patient Profile" size="lg">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-xl font-bold">
                {selectedPatient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{selectedPatient.name}</h3>
                <p className="text-sm text-[var(--primary)] font-mono font-semibold">{selectedPatient.mrNumber}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Registered: {selectedPatient.registeredDate}</p>
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <div>
                <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Gender</p>
                <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{selectedPatient.gender}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Age / DOB</p>
                <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{selectedPatient.age}y / {selectedPatient.dob}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Blood Group</p>
                <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{selectedPatient.bloodGroup}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">CNIC</p>
                <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{selectedPatient.cnic}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
                <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{selectedPatient.phone}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</p>
                <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{selectedPatient.address}</p>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1 mb-3">
                <AlertTriangle className="w-3 h-3" /> Emergency Contact
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Name</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{selectedPatient.emergencyContact.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Relation</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{selectedPatient.emergencyContact.relation}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Phone</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{selectedPatient.emergencyContact.phone}</p>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Medical Conditions</p>
              <div className="flex flex-wrap gap-2">
                {selectedPatient.conditions.length === 0 ? (
                  <span className="text-sm text-[var(--text-tertiary)]">No known conditions</span>
                ) : (
                  selectedPatient.conditions.map((c) => (
                    <Badge key={c} variant="warning">{c}</Badge>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">Allergies</p>
              <div className="flex flex-wrap gap-2">
                {selectedPatient.allergies.length === 0 ? (
                  <span className="text-sm text-[var(--text-tertiary)]">No known allergies</span>
                ) : (
                  selectedPatient.allergies.map((a) => (
                    <Badge key={a} variant="danger">{a}</Badge>
                  ))
                )}
              </div>
            </div>

            {/* Visit History Summary */}
            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider flex items-center gap-1 mb-3">
                <Calendar className="w-3 h-3" /> Visit History
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Total Visits</p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{selectedPatient.totalVisits}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">Last Visit</p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{selectedPatient.lastVisit}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setSelectedPatient(null)}>Close</Button>
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4" /> Edit Patient
            </Button>
          </div>
        </Modal>
      )}

      {/* Edit Patient Modal */}
      {selectedPatient && isEditing && (
        <Modal open={true} onClose={() => { setSelectedPatient(null); setIsEditing(false); }} title={`Edit Patient — ${selectedPatient.mrNumber}`} size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name" defaultValue={selectedPatient.name} />
              <Input label="Phone" defaultValue={selectedPatient.phone} />
              <Input label="CNIC" defaultValue={selectedPatient.cnic} />
              <Input label="Date of Birth" type="date" defaultValue={selectedPatient.dob} />
              <Select label="Gender" options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]} defaultValue={selectedPatient.gender} />
              <Select label="Blood Group" options={BLOOD_GROUP_OPTIONS.filter((o) => o.value !== '')} defaultValue={selectedPatient.bloodGroup} />
            </div>
            <Input label="Address" defaultValue={selectedPatient.address} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Emergency Contact Name" defaultValue={selectedPatient.emergencyContact.name} />
              <Input label="Relation" defaultValue={selectedPatient.emergencyContact.relation} />
              <Input label="Emergency Phone" defaultValue={selectedPatient.emergencyContact.phone} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => { setIsEditing(false); }}>Cancel</Button>
            <Button onClick={() => { setSelectedPatient(null); setIsEditing(false); toast.success('Patient updated successfully'); }}>Save Changes</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
