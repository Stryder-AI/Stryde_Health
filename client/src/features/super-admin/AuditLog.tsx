import { useState, useMemo } from 'react';
import {
  Shield, Search, Download, Filter, Clock, User, LogIn, UserPlus,
  FileText, FlaskConical, Pill, CreditCard, Settings, Eye, Trash2,
  Edit3, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { toast } from '@/components/ui/Toast';

type ActionType = 'login' | 'patient_registration' | 'prescription' | 'lab_order' | 'dispensing' | 'payment' | 'settings_change' | 'user_created' | 'record_viewed' | 'record_edited' | 'record_deleted' | 'logout' | 'failed_login';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: ActionType;
  details: string;
  ip: string;
}

const actionConfig: Record<ActionType, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' | 'default' | 'accent'; icon: React.ReactNode }> = {
  login: { label: 'Login', variant: 'success', icon: <LogIn className="w-3.5 h-3.5" /> },
  logout: { label: 'Logout', variant: 'default', icon: <LogIn className="w-3.5 h-3.5" /> },
  failed_login: { label: 'Failed Login', variant: 'danger', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  patient_registration: { label: 'Patient Registration', variant: 'info', icon: <UserPlus className="w-3.5 h-3.5" /> },
  prescription: { label: 'Prescription Created', variant: 'accent', icon: <FileText className="w-3.5 h-3.5" /> },
  lab_order: { label: 'Lab Order', variant: 'info', icon: <FlaskConical className="w-3.5 h-3.5" /> },
  dispensing: { label: 'Dispensing', variant: 'success', icon: <Pill className="w-3.5 h-3.5" /> },
  payment: { label: 'Payment', variant: 'success', icon: <CreditCard className="w-3.5 h-3.5" /> },
  settings_change: { label: 'Settings Change', variant: 'warning', icon: <Settings className="w-3.5 h-3.5" /> },
  user_created: { label: 'User Created', variant: 'info', icon: <UserPlus className="w-3.5 h-3.5" /> },
  record_viewed: { label: 'Record Viewed', variant: 'default', icon: <Eye className="w-3.5 h-3.5" /> },
  record_edited: { label: 'Record Edited', variant: 'warning', icon: <Edit3 className="w-3.5 h-3.5" /> },
  record_deleted: { label: 'Record Deleted', variant: 'danger', icon: <Trash2 className="w-3.5 h-3.5" /> },
};

const demoAuditLogs: AuditEntry[] = [
  { id: '1', timestamp: '2026-03-29 10:42:15', user: 'Admin User', role: 'super_admin', action: 'settings_change', details: 'Updated consultation fee for Cardiology from Rs. 1500 to Rs. 2000', ip: '192.168.1.10' },
  { id: '2', timestamp: '2026-03-29 10:38:22', user: 'Ayesha Khan', role: 'receptionist', action: 'patient_registration', details: 'Registered patient Fatima Bibi (MR-2026-00002)', ip: '192.168.1.22' },
  { id: '3', timestamp: '2026-03-29 10:35:10', user: 'Dr. Tariq Ahmed', role: 'doctor', action: 'prescription', details: 'Created prescription for Token #12 — Amlodipine 5mg, Aspirin 75mg', ip: '192.168.1.31' },
  { id: '4', timestamp: '2026-03-29 10:30:05', user: 'Hamza Ali', role: 'lab_technician', action: 'lab_order', details: 'Completed CBC report for Ahmad Khan (MR-2026-00001)', ip: '192.168.1.40' },
  { id: '5', timestamp: '2026-03-29 10:25:33', user: 'Bilal Shah', role: 'pharmacist', action: 'dispensing', details: 'Dispensed 3 items for prescription #RX-1042', ip: '192.168.1.50' },
  { id: '6', timestamp: '2026-03-29 10:20:18', user: 'Ayesha Khan', role: 'receptionist', action: 'payment', details: 'Collected Rs. 3,500 from Hassan Ali — Invoice #INV-2026-0089', ip: '192.168.1.22' },
  { id: '7', timestamp: '2026-03-29 10:15:44', user: 'Dr. Saira Khan', role: 'doctor', action: 'record_viewed', details: 'Viewed patient record of Ayesha Noor (MR-2026-00037)', ip: '192.168.1.32' },
  { id: '8', timestamp: '2026-03-29 10:10:02', user: 'Admin User', role: 'super_admin', action: 'user_created', details: 'Created user account for Dr. Waseem Akram (Neurology)', ip: '192.168.1.10' },
  { id: '9', timestamp: '2026-03-29 10:05:55', user: 'Dr. Tariq Ahmed', role: 'doctor', action: 'lab_order', details: 'Ordered Lipid Profile, RFTs for Usman Ali (MR-2026-00005)', ip: '192.168.1.31' },
  { id: '10', timestamp: '2026-03-29 09:58:30', user: 'Ayesha Khan', role: 'receptionist', action: 'patient_registration', details: 'Registered patient Hassan Mahmood (MR-2026-00009)', ip: '192.168.1.22' },
  { id: '11', timestamp: '2026-03-29 09:50:12', user: 'Unknown', role: 'unknown', action: 'failed_login', details: 'Failed login attempt — email: test@test.com', ip: '192.168.1.45' },
  { id: '12', timestamp: '2026-03-29 09:45:08', user: 'Bilal Shah', role: 'pharmacist', action: 'record_edited', details: 'Updated stock quantity for Paracetamol 500mg — Batch #BT-3321', ip: '192.168.1.50' },
  { id: '13', timestamp: '2026-03-29 09:40:33', user: 'Dr. Imran Malik', role: 'doctor', action: 'prescription', details: 'Created prescription for Token #8 — Diclofenac 50mg, Omeprazole 20mg, Calcium D3', ip: '192.168.1.33' },
  { id: '14', timestamp: '2026-03-29 09:35:18', user: 'Hamza Ali', role: 'lab_technician', action: 'record_edited', details: 'Updated test template for Thyroid Profile — added TSH reference range', ip: '192.168.1.40' },
  { id: '15', timestamp: '2026-03-29 09:30:05', user: 'Admin User', role: 'super_admin', action: 'settings_change', details: 'Changed working hours: Saturday 09:00-14:00', ip: '192.168.1.10' },
  { id: '16', timestamp: '2026-03-29 09:25:42', user: 'Ayesha Khan', role: 'receptionist', action: 'login', details: 'Logged in successfully', ip: '192.168.1.22' },
  { id: '17', timestamp: '2026-03-29 09:24:10', user: 'Dr. Tariq Ahmed', role: 'doctor', action: 'login', details: 'Logged in successfully', ip: '192.168.1.31' },
  { id: '18', timestamp: '2026-03-29 09:23:05', user: 'Dr. Saira Khan', role: 'doctor', action: 'login', details: 'Logged in successfully', ip: '192.168.1.32' },
  { id: '19', timestamp: '2026-03-29 09:22:00', user: 'Hamza Ali', role: 'lab_technician', action: 'login', details: 'Logged in successfully', ip: '192.168.1.40' },
  { id: '20', timestamp: '2026-03-29 09:21:30', user: 'Bilal Shah', role: 'pharmacist', action: 'login', details: 'Logged in successfully', ip: '192.168.1.50' },
  { id: '21', timestamp: '2026-03-29 09:20:15', user: 'Admin User', role: 'super_admin', action: 'login', details: 'Logged in successfully', ip: '192.168.1.10' },
  { id: '22', timestamp: '2026-03-28 18:00:10', user: 'Admin User', role: 'super_admin', action: 'record_deleted', details: 'Deleted expired test template: "Old ECG Template v1"', ip: '192.168.1.10' },
  { id: '23', timestamp: '2026-03-28 17:45:30', user: 'Dr. Tariq Ahmed', role: 'doctor', action: 'prescription', details: 'Created prescription for Token #45 — Metformin 500mg, Glimepiride 1mg', ip: '192.168.1.31' },
  { id: '24', timestamp: '2026-03-28 17:30:22', user: 'Ayesha Khan', role: 'receptionist', action: 'payment', details: 'Collected Rs. 5,200 from Zara Batool — Invoice #INV-2026-0088', ip: '192.168.1.22' },
  { id: '25', timestamp: '2026-03-28 17:15:05', user: 'Unknown', role: 'unknown', action: 'failed_login', details: 'Failed login attempt — email: admin@admin.com (3rd attempt)', ip: '192.168.1.45' },
  { id: '26', timestamp: '2026-03-28 16:45:18', user: 'Hamza Ali', role: 'lab_technician', action: 'lab_order', details: 'Completed Thyroid Profile for Sana Batool (MR-2026-00015)', ip: '192.168.1.40' },
  { id: '27', timestamp: '2026-03-28 16:30:42', user: 'Bilal Shah', role: 'pharmacist', action: 'dispensing', details: 'Dispensed 5 items for prescription #RX-1038 — Total Rs. 2,450', ip: '192.168.1.50' },
];

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'lab_technician', label: 'Lab Technician' },
  { value: 'pharmacist', label: 'Pharmacist' },
];

const actionOptions = [
  { value: '', label: 'All Actions' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'failed_login', label: 'Failed Login' },
  { value: 'patient_registration', label: 'Patient Registration' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'lab_order', label: 'Lab Order' },
  { value: 'dispensing', label: 'Dispensing' },
  { value: 'payment', label: 'Payment' },
  { value: 'settings_change', label: 'Settings Change' },
  { value: 'user_created', label: 'User Created' },
  { value: 'record_viewed', label: 'Record Viewed' },
  { value: 'record_edited', label: 'Record Edited' },
  { value: 'record_deleted', label: 'Record Deleted' },
];

export function AuditLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const filtered = useMemo(() => {
    return demoAuditLogs.filter((entry) => {
      const matchesSearch = !searchTerm ||
        entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.details.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !roleFilter || entry.role === roleFilter;
      const matchesAction = !actionFilter || entry.action === actionFilter;
      return matchesSearch && matchesRole && matchesAction;
    });
  }, [searchTerm, roleFilter, actionFilter]);

  const handleExport = () => {
    toast.success('Audit log exported successfully as CSV.', 'Export Complete');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-[var(--primary)]" />
            Audit Trail
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Complete system activity log — who did what and when.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Export Log
        </Button>
      </div>

      {/* Filters */}
      <Card hover={false} className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Search"
              placeholder="Search by user or details..."
              icon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Select
              label="Role"
              options={roleOptions}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Select
              label="Action"
              options={actionOptions}
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearchTerm(''); setRoleFilter(''); setActionFilter(''); }}
          >
            <Filter className="w-4 h-4" />
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Results count */}
      <div className="flex items-center gap-2">
        <Badge variant="default">{filtered.length} entries</Badge>
        {(searchTerm || roleFilter || actionFilter) && (
          <span className="text-xs text-[var(--text-tertiary)]">filtered from {demoAuditLogs.length} total</span>
        )}
      </div>

      {/* Table */}
      <Card hover={false} className="p-0 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => {
                const config = actionConfig[entry.action];
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {entry.timestamp}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
                        <User className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                        {entry.user}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{entry.role.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={config.variant}>
                        {config.icon}
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-[var(--text-secondary)] max-w-xs truncate" title={entry.details}>
                        {entry.details}
                      </p>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs font-mono text-[var(--text-tertiary)] bg-[var(--surface)] px-2 py-0.5 rounded">
                        {entry.ip}
                      </code>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No audit log entries match your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
