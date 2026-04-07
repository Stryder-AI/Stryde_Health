import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { ROLE_HOME_ROUTES } from '@/lib/constants';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AppLayout } from '@/components/layout/AppLayout';
import { POSLayout } from '@/components/layout/POSLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { SkeletonCard } from '@/components/ui/Skeleton';
import {
  LayoutDashboard, Users, UserPlus, Search, Calendar, CalendarDays,
  Receipt, History, Stethoscope, ClipboardList, FileText, FlaskConical,
  TestTubes, CheckCircle, ListChecks, ShoppingCart, Package, Boxes,
  BarChart3, Settings, type LucideIcon, Activity, Clock, LayoutList,
  Shield, MessageSquare, MessageCircle, Monitor,
} from 'lucide-react';
import type { SidebarItem } from '@/components/ui/Sidebar';
import type { ReactNode } from 'react';

// ─── LAZY IMPORTS ───────────────────────────────────────────

// Super Admin
const AdminDashboard = lazy(() => import('@/features/super-admin/Dashboard').then(m => ({ default: m.AdminDashboard })));
const UserManagement = lazy(() => import('@/features/super-admin/UserManagement').then(m => ({ default: m.UserManagement })));
const PatientRegistry = lazy(() => import('@/features/super-admin/PatientRegistry').then(m => ({ default: m.PatientRegistry })));
const AdminAppointments = lazy(() => import('@/features/super-admin/AdminAppointments').then(m => ({ default: m.AdminAppointments })));
const DoctorManagement = lazy(() => import('@/features/super-admin/DoctorManagement').then(m => ({ default: m.DoctorManagement })));
const LabManagement = lazy(() => import('@/features/super-admin/LabManagement').then(m => ({ default: m.LabManagement })));

const PharmacyOverview = lazy(() => import('@/features/super-admin/PharmacyOverview').then(m => ({ default: m.PharmacyOverview })));
const BillingInvoices = lazy(() => import('@/features/super-admin/BillingInvoices').then(m => ({ default: m.BillingInvoices })));
const Reports = lazy(() => import('@/features/super-admin/Reports').then(m => ({ default: m.Reports })));
const AdminSettings = lazy(() => import('@/features/super-admin/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AuditLog = lazy(() => import('@/features/super-admin/AuditLog').then(m => ({ default: m.AuditLog })));

// Shared
const Messaging = lazy(() => import('@/features/shared/Messaging'));
const PatientPortal = lazy(() => import('@/features/shared/PatientPortal'));
const SMSNotifications = lazy(() => import('@/features/reception/SMSNotifications'));

// Reception
const ReceptionDashboard = lazy(() => import('@/features/reception/Dashboard'));
const RegisterPatient = lazy(() => import('@/features/reception/RegisterPatient'));
const PatientSearch = lazy(() => import('@/features/reception/PatientSearch'));
const Appointments = lazy(() => import('@/features/reception/Appointments'));
const ReceptionSchedule = lazy(() => import('@/features/reception/Schedule'));
const Billing = lazy(() => import('@/features/reception/Billing'));
const PaymentHistory = lazy(() => import('@/features/reception/PaymentHistory'));

// Doctor
const DoctorDashboard = lazy(() => import('@/features/doctor/Dashboard'));
const OPDQueue = lazy(() => import('@/features/doctor/OPDQueue'));
const Consultation = lazy(() => import('@/features/doctor/Consultation'));
const MyAppointments = lazy(() => import('@/features/doctor/MyAppointments'));
const PatientRecords = lazy(() => import('@/features/doctor/PatientRecords'));
const Prescriptions = lazy(() => import('@/features/doctor/Prescriptions'));
const LabResults = lazy(() => import('@/features/doctor/LabResults'));
const DoctorSchedule = lazy(() => import('@/features/doctor/DoctorSchedule'));
const PatientTimeline = lazy(() => import('@/features/doctor/PatientTimeline'));

// Lab
const LabDashboard = lazy(() => import('@/features/lab/Dashboard').then(m => ({ default: m.Dashboard })));
const PendingOrders = lazy(() => import('@/features/lab/PendingOrders').then(m => ({ default: m.PendingOrders })));
const ResultEntry = lazy(() => import('@/features/lab/ResultEntry').then(m => ({ default: m.ResultEntry })));
const CompletedReports = lazy(() => import('@/features/lab/CompletedReports').then(m => ({ default: m.CompletedReports })));
const TestTemplates = lazy(() => import('@/features/lab/TestTemplates').then(m => ({ default: m.TestTemplates })));
const LabPatientSearch = lazy(() => import('@/features/lab/LabPatientSearch').then(m => ({ default: m.LabPatientSearch })));
const BatchResultEntry = lazy(() => import('@/features/lab/BatchResultEntry').then(m => ({ default: m.BatchResultEntry })));

// Pharmacy
const POS = lazy(() => import('@/features/pharmacy/POS').then(m => ({ default: m.POS })));
const Products = lazy(() => import('@/features/pharmacy/Products').then(m => ({ default: m.Products })));
const Stock = lazy(() => import('@/features/pharmacy/Stock').then(m => ({ default: m.Stock })));
const SalesHistory = lazy(() => import('@/features/pharmacy/SalesHistory').then(m => ({ default: m.SalesHistory })));
const PharmacyDashboard = lazy(() => import('@/features/pharmacy/Dashboard').then(m => ({ default: m.PharmacyDashboard })));
const PharmacySettings = lazy(() => import('@/features/pharmacy/Settings').then(m => ({ default: m.PharmacySettings })));
const StockAlerts = lazy(() => import('@/features/pharmacy/StockAlerts').then(m => ({ default: m.StockAlerts })));
const PrescriptionVerify = lazy(() => import('@/features/pharmacy/PrescriptionVerify').then(m => ({ default: m.PrescriptionVerify })));
const PharmacyReturns = lazy(() => import('@/features/pharmacy/Returns').then(m => ({ default: m.Returns })));
const ExpiryAlerts = lazy(() => import('@/features/pharmacy/ExpiryAlerts').then(m => ({ default: m.ExpiryAlerts })));

// ─── LOADING FALLBACK ───────────────────────────────────────

function PageLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
    </div>
  );
}

// ─── ROUTE PROTECTION ───────────────────────────────────────

function ProtectedRoute({ children, roles }: { children: ReactNode; roles: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME_ROUTES[user.role] || '/login'} replace />;
  }
  return <>{children}</>;
}

function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) {
    return <Navigate to={ROLE_HOME_ROUTES[user.role] || '/'} replace />;
  }
  return <>{children}</>;
}

// ─── PLACEHOLDER ────────────────────────────────────────────

function Placeholder({ title, icon: Icon }: { title: string; icon: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
      <div className="p-4 rounded-2xl bg-[var(--primary-light)] mb-4">
        <Icon className="w-10 h-10 text-[var(--primary)]" />
      </div>
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
      <p className="text-sm text-[var(--text-secondary)] mt-2">Coming soon</p>
    </div>
  );
}

function POSPlaceholder({ title, icon: Icon }: { title: string; icon: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
      <div className="p-4 rounded-2xl bg-[var(--pos-accent)]/20 mb-4">
        <Icon className="w-10 h-10 text-[var(--pos-accent)]" />
      </div>
      <h2 className="text-xl font-semibold text-[var(--pos-text)]">{title}</h2>
      <p className="text-sm text-gray-400 mt-2">Coming soon</p>
    </div>
  );
}

// ─── SIDEBAR CONFIGS ────────────────────────────────────────

const adminSidebar: SidebarItem[] = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'User Management', path: '/admin/users', icon: Users },
  { label: 'Patient Registry', path: '/admin/patients', icon: UserPlus },
  { label: 'Appointments', path: '/admin/appointments', icon: Calendar },
  { label: 'Doctors', path: '/admin/doctors', icon: Stethoscope },
  { label: 'Lab Management', path: '/admin/lab', icon: FlaskConical },
  { label: 'Pharmacy', path: '/admin/pharmacy', icon: Package },
  { label: 'Billing & Invoices', path: '/admin/billing', icon: Receipt },
  { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
  { label: 'Audit Trail', path: '/admin/audit', icon: Shield },
  { label: 'Messages', path: '/admin/messages', icon: MessageSquare },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

const receptionSidebar: SidebarItem[] = [
  { label: 'Dashboard', path: '/reception', icon: LayoutDashboard },
  { label: 'Register Patient', path: '/reception/register', icon: UserPlus },
  { label: 'Patient Search', path: '/reception/patients', icon: Search },
  { label: "Today's Appointments", path: '/reception/appointments', icon: CalendarDays },
  { label: 'Schedule', path: '/reception/schedule', icon: Calendar },
  { label: 'Billing / Cashier', path: '/reception/billing', icon: Receipt },
  { label: 'Payment History', path: '/reception/payments', icon: History },
  { label: 'SMS Notifications', path: '/reception/sms', icon: MessageCircle },
  { label: 'Patient Portal', path: '/reception/patient-portal', icon: Monitor },
];

const doctorSidebar: SidebarItem[] = [
  { label: 'Dashboard', path: '/doctor', icon: LayoutDashboard },
  { label: 'OPD Queue', path: '/doctor/opd', icon: Activity },
  { label: 'My Appointments', path: '/doctor/appointments', icon: Calendar },
  { label: 'Patient Records', path: '/doctor/patients', icon: Search },
  { label: 'Prescriptions', path: '/doctor/prescriptions', icon: ClipboardList },
  { label: 'Lab Results', path: '/doctor/lab-results', icon: FileText },
  { label: 'Patient Timeline', path: '/doctor/timeline', icon: Clock },
  { label: 'Messages', path: '/doctor/messages', icon: MessageSquare },
  { label: 'Schedule', path: '/doctor/schedule', icon: CalendarDays },
];

const labSidebar: SidebarItem[] = [
  { label: 'Dashboard', path: '/lab', icon: LayoutDashboard },
  { label: 'Pending Orders', path: '/lab/pending', icon: ListChecks },
  { label: 'In Progress', path: '/lab/in-progress', icon: FlaskConical },
  { label: 'Batch Entry', path: '/lab/batch-entry', icon: LayoutList },
  { label: 'Completed Reports', path: '/lab/completed', icon: CheckCircle },
  { label: 'Test Templates', path: '/lab/templates', icon: TestTubes },
  { label: 'Messages', path: '/lab/messages', icon: MessageSquare },
  { label: 'Patient Search', path: '/lab/patients', icon: Search },
];

// ─── ROUTER ─────────────────────────────────────────────────

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="bg-mesh min-h-screen flex items-center justify-center"><PageLoader /></div>}>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<GuestRoute><AuthLayout><LoginPage /></AuthLayout></GuestRoute>} />

          {/* Super Admin */}
          <Route element={<ProtectedRoute roles={['super_admin']}><AppLayout sidebarItems={adminSidebar} portalTitle="Stryde Admin" /></ProtectedRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/patients" element={<PatientRegistry />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route path="/admin/doctors" element={<DoctorManagement />} />
            <Route path="/admin/lab" element={<LabManagement />} />
            <Route path="/admin/pharmacy" element={<PharmacyOverview />} />
            <Route path="/admin/billing" element={<BillingInvoices />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/audit" element={<AuditLog />} />
            <Route path="/admin/messages" element={<Messaging />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          {/* Receptionist */}
          <Route element={<ProtectedRoute roles={['super_admin', 'receptionist']}><AppLayout sidebarItems={receptionSidebar} portalTitle="Stryde Reception" /></ProtectedRoute>}>
            <Route path="/reception" element={<ReceptionDashboard />} />
            <Route path="/reception/register" element={<RegisterPatient />} />
            <Route path="/reception/patients" element={<PatientSearch />} />
            <Route path="/reception/appointments" element={<Appointments />} />
            <Route path="/reception/schedule" element={<ReceptionSchedule />} />
            <Route path="/reception/billing" element={<Billing />} />
            <Route path="/reception/payments" element={<PaymentHistory />} />
            <Route path="/reception/sms" element={<SMSNotifications />} />
            <Route path="/reception/patient-portal" element={<PatientPortal />} />
          </Route>

          {/* Doctor */}
          <Route element={<ProtectedRoute roles={['super_admin', 'doctor']}><AppLayout sidebarItems={doctorSidebar} portalTitle="Stryde OPD" /></ProtectedRoute>}>
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/opd" element={<OPDQueue />} />
            <Route path="/doctor/consultation" element={<Consultation />} />
            <Route path="/doctor/appointments" element={<MyAppointments />} />
            <Route path="/doctor/patients" element={<PatientRecords />} />
            <Route path="/doctor/prescriptions" element={<Prescriptions />} />
            <Route path="/doctor/lab-results" element={<LabResults />} />
            <Route path="/doctor/timeline" element={<PatientTimeline />} />
            <Route path="/doctor/messages" element={<Messaging />} />
            <Route path="/doctor/schedule" element={<DoctorSchedule />} />
          </Route>

          {/* Lab Technician */}
          <Route element={<ProtectedRoute roles={['super_admin', 'lab_technician']}><AppLayout sidebarItems={labSidebar} portalTitle="Stryde Lab" /></ProtectedRoute>}>
            <Route path="/lab" element={<LabDashboard />} />
            <Route path="/lab/pending" element={<PendingOrders />} />
            <Route path="/lab/in-progress" element={<ResultEntry />} />
            <Route path="/lab/completed" element={<CompletedReports />} />
            <Route path="/lab/templates" element={<TestTemplates />} />
            <Route path="/lab/batch-entry" element={<BatchResultEntry />} />
            <Route path="/lab/messages" element={<Messaging />} />
            <Route path="/lab/patients" element={<LabPatientSearch />} />
          </Route>

          {/* Pharmacist (POS Dark Theme) */}
          <Route element={<ProtectedRoute roles={['super_admin', 'pharmacist']}><POSLayout /></ProtectedRoute>}>
            <Route path="/pharmacy" element={<Navigate to="/pharmacy/pos" replace />} />
            <Route path="/pharmacy/pos" element={<POS />} />
            <Route path="/pharmacy/products" element={<Products />} />
            <Route path="/pharmacy/stock" element={<Stock />} />
            <Route path="/pharmacy/sales" element={<SalesHistory />} />
            <Route path="/pharmacy/stock-alerts" element={<StockAlerts />} />
            <Route path="/pharmacy/verify" element={<PrescriptionVerify />} />
            <Route path="/pharmacy/returns" element={<PharmacyReturns />} />
            <Route path="/pharmacy/expiry" element={<ExpiryAlerts />} />
            <Route path="/pharmacy/reports" element={<PharmacyDashboard />} />
            <Route path="/pharmacy/settings" element={<PharmacySettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
