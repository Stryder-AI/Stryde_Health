import { useState, useMemo } from 'react';
import {
  Search,
  Eye,
  Phone,
  MapPin,
  Droplets,
  Calendar,
  User,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Card, CardContent } from '@/components/ui/Card';

/* ------------------------------------------------------------------ */
/*  Demo Data                                                         */
/* ------------------------------------------------------------------ */

interface Patient {
  mr: string;
  firstName: string;
  lastName: string;
  phone: string;
  cnic: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  address: string;
  lastVisit: string;
  emergencyContact: string;
  emergencyPhone: string;
  conditions: string[];
  allergies: string;
}

const demoPatients: Patient[] = [
  { mr: 'MR-10234', firstName: 'Ahmed', lastName: 'Raza', phone: '0321-5551234', cnic: '35202-1234567-1', gender: 'Male', dob: '1985-03-12', bloodGroup: 'B+', address: 'House 45, Block F, Johar Town, Lahore', lastVisit: '2026-03-29', emergencyContact: 'Imran Raza', emergencyPhone: '0300-1112233', conditions: ['Cardiac', 'Hypertensive'], allergies: 'Penicillin' },
  { mr: 'MR-10235', firstName: 'Fatima', lastName: 'Bibi', phone: '0300-6782345', cnic: '35201-9876543-2', gender: 'Female', dob: '1992-07-25', bloodGroup: 'A+', address: 'Flat 12, Askari Apartments, Rawalpindi', lastVisit: '2026-03-29', emergencyContact: 'Khalid Mehmood', emergencyPhone: '0333-4445566', conditions: ['Diabetic'], allergies: 'None' },
  { mr: 'MR-10236', firstName: 'Usman', lastName: 'Tariq', phone: '0333-9014567', cnic: '35203-5678901-3', gender: 'Male', dob: '1978-11-03', bloodGroup: 'O+', address: '214-B, Gulberg III, Lahore', lastVisit: '2026-03-28', emergencyContact: 'Tariq Mehmood', emergencyPhone: '0312-7778899', conditions: ['Asthmatic'], allergies: 'Sulfa drugs' },
  { mr: 'MR-10237', firstName: 'Ayesha', lastName: 'Noor', phone: '0345-8901234', cnic: '35204-3456789-4', gender: 'Female', dob: '1995-01-18', bloodGroup: 'AB+', address: 'House 78, DHA Phase 5, Islamabad', lastVisit: '2026-03-29', emergencyContact: 'Noor Ahmad', emergencyPhone: '0321-1234567', conditions: ['Thyroid'], allergies: 'None' },
  { mr: 'MR-10238', firstName: 'Bilal', lastName: 'Hussain', phone: '0321-5551234', cnic: '35205-6789012-5', gender: 'Male', dob: '1988-06-30', bloodGroup: 'B-', address: '56 Commercial Area, Model Town, Lahore', lastVisit: '2026-03-29', emergencyContact: 'Hussain Ali', emergencyPhone: '0300-9876543', conditions: [], allergies: 'Aspirin' },
  { mr: 'MR-10239', firstName: 'Zainab', lastName: 'Akhtar', phone: '0300-6782345', cnic: '35206-2345678-6', gender: 'Female', dob: '2001-09-14', bloodGroup: 'O-', address: 'Street 4, Satellite Town, Sargodha', lastVisit: '2026-03-29', emergencyContact: 'Akhtar Hussain', emergencyPhone: '0345-5556677', conditions: ['Hepatitis'], allergies: 'None' },
  { mr: 'MR-10240', firstName: 'Hassan', lastName: 'Ali', phone: '0333-9014567', cnic: '35207-8901234-7', gender: 'Male', dob: '1970-12-05', bloodGroup: 'A-', address: 'House 9, Officers Colony, Multan', lastVisit: '2026-03-28', emergencyContact: 'Ali Hassan', emergencyPhone: '0312-1112233', conditions: ['Cardiac', 'Diabetic', 'Hypertensive'], allergies: 'Ibuprofen' },
  { mr: 'MR-10241', firstName: 'Rabia', lastName: 'Kanwal', phone: '0312-2345678', cnic: '35208-4567890-8', gender: 'Female', dob: '1998-04-22', bloodGroup: 'AB-', address: 'Flat 3, Al-Noor Plaza, Faisalabad', lastVisit: '2026-03-27', emergencyContact: 'Kanwal Bibi', emergencyPhone: '0333-6667788', conditions: ['Pregnant'], allergies: 'None' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function PatientSearch() {
  const [query, setQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return demoPatients;
    const q = query.toLowerCase();
    return demoPatients.filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.mr.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.cnic.includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Patient Search
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Search by name, MR#, phone number, or CNIC
        </p>
      </div>

      {/* Search bar */}
      <Card hover={false} className="p-4">
        <Input
          placeholder="Type to search patients..."
          icon={<Search className="w-4 h-4" />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Card>

      {/* Results */}
      <div>
        <p className="text-xs text-[var(--text-tertiary)] mb-3 uppercase tracking-wider font-medium">
          {filtered.length} patient{filtered.length !== 1 ? 's' : ''} found
        </p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>MR #</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="stagger-children">
            {filtered.map((p) => (
              <TableRow key={p.mr}>
                <TableCell className="font-mono font-semibold text-[var(--primary)]">
                  {p.mr}
                </TableCell>
                <TableCell className="font-medium">
                  {p.firstName} {p.lastName}
                </TableCell>
                <TableCell className="text-[var(--text-secondary)]">{p.phone}</TableCell>
                <TableCell>
                  <Badge variant={p.gender === 'Male' ? 'info' : 'accent'}>
                    {p.gender}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-red-500">{p.bloodGroup}</span>
                </TableCell>
                <TableCell className="text-xs text-[var(--text-secondary)]">
                  {p.lastVisit}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPatient(p)}
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-[var(--text-tertiary)]">
                  No patients found matching "{query}"
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Patient profile modal */}
      <Modal
        open={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title="Patient Profile"
        description={selectedPatient ? `${selectedPatient.mr}` : ''}
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Basic info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                <User className="w-7 h-7 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {selectedPatient.gender} &middot; DOB: {selectedPatient.dob}
                </p>
              </div>
              <Badge variant="info" className="ml-auto">
                {selectedPatient.bloodGroup}
              </Badge>
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={selectedPatient.phone} />
              <InfoRow icon={<User className="w-4 h-4" />} label="CNIC" value={selectedPatient.cnic} />
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="Address" value={selectedPatient.address} />
              <InfoRow icon={<Droplets className="w-4 h-4" />} label="Blood Group" value={selectedPatient.bloodGroup} />
              <InfoRow icon={<Calendar className="w-4 h-4" />} label="Last Visit" value={selectedPatient.lastVisit} />
            </div>

            {/* Emergency contact */}
            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)]">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                Emergency Contact
              </p>
              <p className="text-sm text-[var(--text-primary)]">
                {selectedPatient.emergencyContact} &mdash; {selectedPatient.emergencyPhone}
              </p>
            </div>

            {/* Medical history */}
            {selectedPatient.conditions.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                  Medical Conditions
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.conditions.map((c) => (
                    <Badge key={c} variant="warning">{c}</Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedPatient.allergies && selectedPatient.allergies !== 'None' && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                  Allergies
                </p>
                <Badge variant="danger">{selectedPatient.allergies}</Badge>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-[var(--radius-sm)] bg-[var(--surface)]">
      <div className="text-[var(--text-tertiary)] mt-0.5">{icon}</div>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)]">{label}</p>
        <p className="text-sm text-[var(--text-primary)] mt-0.5">{value}</p>
      </div>
    </div>
  );
}
