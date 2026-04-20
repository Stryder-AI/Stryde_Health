import { useState } from 'react';
import { Plus, Search, Edit2, ToggleLeft, ToggleRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { AvatarUpload } from '@/components/ui/AvatarUpload';
import { toast } from '@/components/ui/Toast';

const ROLE_OPTIONS = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'lab_technician', label: 'Lab Technician' },
  { value: 'pharmacist', label: 'Pharmacist' },
];

const demoUsers = [
  { id: '1', fullName: 'Admin User', email: 'admin@strydehealth.com', role: 'super_admin', department: 'Administration', isActive: true },
  { id: '2', fullName: 'Ayesha Khan', email: 'ayesha@strydehealth.com', role: 'receptionist', department: 'Front Desk', isActive: true },
  { id: '3', fullName: 'Dr. Tariq Ahmed', email: 'dr.tariq@strydehealth.com', role: 'doctor', department: 'Cardiology', isActive: true },
  { id: '4', fullName: 'Dr. Saira Khan', email: 'dr.saira@strydehealth.com', role: 'doctor', department: 'General Medicine', isActive: true },
  { id: '5', fullName: 'Dr. Imran Malik', email: 'dr.imran@strydehealth.com', role: 'doctor', department: 'Orthopedics', isActive: true },
  { id: '6', fullName: 'Hamza Ali', email: 'hamza@strydehealth.com', role: 'lab_technician', department: 'Pathology', isActive: true },
  { id: '7', fullName: 'Bilal Shah', email: 'bilal@strydehealth.com', role: 'pharmacist', department: 'Pharmacy', isActive: true },
];

const roleBadge: Record<string, string> = {
  super_admin: 'accent',
  receptionist: 'info',
  doctor: 'success',
  lab_technician: 'warning',
  pharmacist: 'in_progress',
};

const roleLabel: Record<string, string> = {
  super_admin: 'Super Admin',
  receptionist: 'Receptionist',
  doctor: 'Doctor',
  lab_technician: 'Lab Technician',
  pharmacist: 'Pharmacist',
};

export function UserManagement() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState<string | null>(null);
  const [users, setUsers] = useState(demoUsers);

  // New user form state
  const [newUser, setNewUser] = useState({
    fullName: '', email: '', password: '', role: '', department: '', specialization: '',
  });

  // Edit user form state
  const [editUser, setEditUser] = useState({
    fullName: '', email: '', role: '', department: '', specialization: '',
  });

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
    toast.success('User status updated');
  };

  const handleCreateUser = () => {
    if (!newUser.fullName.trim() || !newUser.email.trim() || !newUser.role) {
      toast.error('Please fill in Name, Email, and Role.');
      return;
    }
    const id = String(Date.now());
    setUsers(prev => [...prev, {
      id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department || 'Unassigned',
      isActive: true,
    }]);
    setNewUser({ fullName: '', email: '', password: '', role: '', department: '', specialization: '' });
    setShowModal(false);
    toast.success('User created successfully');
  };

  const openEditModal = (id: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    setEditUser({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      specialization: '',
    });
    setEditModal(id);
  };

  const handleSaveEdit = () => {
    if (!editModal) return;
    if (!editUser.fullName.trim() || !editUser.email.trim()) {
      toast.error('Name and Email are required.');
      return;
    }
    setUsers(prev => prev.map(u => u.id === editModal ? {
      ...u,
      fullName: editUser.fullName,
      email: editUser.email,
      role: editUser.role || u.role,
      department: editUser.department || u.department,
    } : u));
    setEditModal(null);
    toast.success('User updated successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">User Management</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage staff accounts and permissions</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Users Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-sm font-semibold">
                    {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{user.fullName}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={roleBadge[user.role] as any}>
                  <Shield className="w-3 h-3 mr-1" />
                  {roleLabel[user.role]}
                </Badge>
              </TableCell>
              <TableCell>{user.department}</TableCell>
              <TableCell>
                <Badge variant={user.isActive ? 'success' : 'cancelled'} dot>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(user.id)}
                    className="p-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4 text-[var(--text-tertiary)]" />
                  </button>
                  <button
                    onClick={() => toggleActive(user.id)}
                    className="p-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors"
                    title={user.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {user.isActive
                      ? <ToggleRight className="w-5 h-5 text-[var(--success)]" />
                      : <ToggleLeft className="w-5 h-5 text-[var(--text-tertiary)]" />
                    }
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add User Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add New User" size="md">
        <div className="space-y-4">
          <div className="flex justify-center pb-2">
            <AvatarUpload
              initials={newUser.fullName || 'New User'}
              size="md"
              onChange={() => {/* stored in component state as base64 preview */}}
            />
          </div>
          <Input label="Full Name *" placeholder="Enter full name" value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} />
          <Input label="Email *" type="email" placeholder="user@strydehealth.com" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          <Input label="Password *" type="password" placeholder="Minimum 8 characters" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          <Select label="Role *" options={ROLE_OPTIONS} placeholder="Select role" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} />
          <Input label="Department" placeholder="e.g. Cardiology, Front Desk" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })} />
          <Input label="Specialization" placeholder="e.g. Cardiologist (for doctors)" value={newUser.specialization} onChange={(e) => setNewUser({ ...newUser, specialization: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleCreateUser}>Create User</Button>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit User" size="md">
        <div className="space-y-4">
          <Input label="Full Name *" placeholder="Enter full name" value={editUser.fullName} onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })} />
          <Input label="Email *" type="email" placeholder="user@strydehealth.com" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
          <Select label="Role" options={ROLE_OPTIONS} placeholder="Select role" value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })} />
          <Input label="Department" placeholder="e.g. Cardiology, Front Desk" value={editUser.department} onChange={(e) => setEditUser({ ...editUser, department: e.target.value })} />
          <Input label="Specialization" placeholder="e.g. Cardiologist (for doctors)" value={editUser.specialization} onChange={(e) => setEditUser({ ...editUser, specialization: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setEditModal(null)}>Cancel</Button>
          <Button onClick={handleSaveEdit}>Save Changes</Button>
        </div>
      </Modal>
    </div>
  );
}
