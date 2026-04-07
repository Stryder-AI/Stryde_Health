import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, User, LayoutDashboard, Activity, Calendar,
  ClipboardList, FileText, Clock, MessageSquare, CalendarDays,
  UserPlus, Receipt, History, FlaskConical, ListChecks,
  CheckCircle, TestTubes, LayoutList, Package, BarChart3,
  Settings, Shield, Users, Stethoscope, ArrowRight,
  Zap, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

type ResultCategory = 'Patients' | 'Pages' | 'Actions';

interface SearchResult {
  id: string;
  category: ResultCategory;
  primary: string;
  secondary: string;
  route: string;
  icon: React.ReactNode;
  roles?: string[]; // if undefined, accessible to all roles
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const PATIENTS: Omit<SearchResult, 'category' | 'icon'>[] = [
  { id: 'p1',  primary: 'Rashid Mehmood',  secondary: 'MR-20240812', route: '__patient__' },
  { id: 'p2',  primary: 'Nazia Begum',     secondary: 'MR-20241201', route: '__patient__' },
  { id: 'p3',  primary: 'Imran Saeed',     secondary: 'MR-20240654', route: '__patient__' },
  { id: 'p4',  primary: 'Sadia Parveen',   secondary: 'MR-20241345', route: '__patient__' },
  { id: 'p5',  primary: 'Ahmad Khan',      secondary: 'MR-20240445', route: '__patient__' },
  { id: 'p6',  primary: 'Zainab Fatima',   secondary: 'MR-20240998', route: '__patient__' },
  { id: 'p7',  primary: 'Tariq Hussain',   secondary: 'MR-20241078', route: '__patient__' },
  { id: 'p8',  primary: 'Ahmed Raza',      secondary: 'MR-10234',    route: '__patient__' },
  { id: 'p9',  primary: 'Usman Tariq',     secondary: 'MR-10236',    route: '__patient__' },
  { id: 'p10', primary: 'Ayesha Noor',     secondary: 'MR-10237',    route: '__patient__' },
];

const PAGES: Omit<SearchResult, 'category'>[] = [
  // Admin
  { id: 'pg-admin',              primary: 'Admin Dashboard',        secondary: 'Super Admin Portal',    route: '/admin',              icon: <LayoutDashboard className="w-4 h-4" />, roles: ['super_admin'] },
  { id: 'pg-admin-users',        primary: 'User Management',        secondary: 'Admin · Users',          route: '/admin/users',        icon: <Users className="w-4 h-4" />,          roles: ['super_admin'] },
  { id: 'pg-admin-patients',     primary: 'Patient Registry',       secondary: 'Admin · Patients',       route: '/admin/patients',     icon: <UserPlus className="w-4 h-4" />,        roles: ['super_admin'] },
  { id: 'pg-admin-appts',        primary: 'Appointments',           secondary: 'Admin · Appointments',   route: '/admin/appointments', icon: <Calendar className="w-4 h-4" />,        roles: ['super_admin'] },
  { id: 'pg-admin-doctors',      primary: 'Doctor Management',      secondary: 'Admin · Doctors',        route: '/admin/doctors',      icon: <Stethoscope className="w-4 h-4" />,     roles: ['super_admin'] },
  { id: 'pg-admin-lab',          primary: 'Lab Management',         secondary: 'Admin · Lab',            route: '/admin/lab',          icon: <FlaskConical className="w-4 h-4" />,    roles: ['super_admin'] },
  { id: 'pg-admin-pharmacy',     primary: 'Pharmacy Overview',      secondary: 'Admin · Pharmacy',       route: '/admin/pharmacy',     icon: <Package className="w-4 h-4" />,         roles: ['super_admin'] },
  { id: 'pg-admin-billing',      primary: 'Billing & Invoices',     secondary: 'Admin · Billing',        route: '/admin/billing',      icon: <Receipt className="w-4 h-4" />,         roles: ['super_admin'] },
  { id: 'pg-admin-reports',      primary: 'Reports & Analytics',    secondary: 'Admin · Reports',        route: '/admin/reports',      icon: <BarChart3 className="w-4 h-4" />,       roles: ['super_admin'] },
  { id: 'pg-admin-audit',        primary: 'Audit Trail',            secondary: 'Admin · Audit',          route: '/admin/audit',        icon: <Shield className="w-4 h-4" />,          roles: ['super_admin'] },
  { id: 'pg-admin-msgs',         primary: 'Messages',               secondary: 'Admin · Messages',       route: '/admin/messages',     icon: <MessageSquare className="w-4 h-4" />,   roles: ['super_admin'] },
  { id: 'pg-admin-settings',     primary: 'Settings',               secondary: 'Admin · Settings',       route: '/admin/settings',     icon: <Settings className="w-4 h-4" />,        roles: ['super_admin'] },
  // Reception
  { id: 'pg-reception',          primary: 'Reception Dashboard',    secondary: 'Reception Portal',       route: '/reception',          icon: <LayoutDashboard className="w-4 h-4" />, roles: ['super_admin', 'receptionist'] },
  { id: 'pg-reception-register', primary: 'Register Patient',       secondary: 'Reception · Register',   route: '/reception/register', icon: <UserPlus className="w-4 h-4" />,        roles: ['super_admin', 'receptionist'] },
  { id: 'pg-reception-patients', primary: 'Patient Search',         secondary: 'Reception · Patients',   route: '/reception/patients', icon: <Search className="w-4 h-4" />,          roles: ['super_admin', 'receptionist'] },
  { id: 'pg-reception-appts',    primary: "Today's Appointments",   secondary: 'Reception · Appointments',route: '/reception/appointments', icon: <CalendarDays className="w-4 h-4" />, roles: ['super_admin', 'receptionist'] },
  { id: 'pg-reception-schedule', primary: 'Schedule',               secondary: 'Reception · Schedule',   route: '/reception/schedule', icon: <Calendar className="w-4 h-4" />,        roles: ['super_admin', 'receptionist'] },
  { id: 'pg-reception-billing',  primary: 'Billing / Cashier',      secondary: 'Reception · Billing',    route: '/reception/billing',  icon: <Receipt className="w-4 h-4" />,         roles: ['super_admin', 'receptionist'] },
  { id: 'pg-reception-payments', primary: 'Payment History',        secondary: 'Reception · Payments',   route: '/reception/payments', icon: <History className="w-4 h-4" />,         roles: ['super_admin', 'receptionist'] },
  // Doctor
  { id: 'pg-doctor',             primary: 'Doctor Dashboard',       secondary: 'Doctor Portal',          route: '/doctor',             icon: <LayoutDashboard className="w-4 h-4" />, roles: ['super_admin', 'doctor'] },
  { id: 'pg-doctor-opd',         primary: 'OPD Queue',              secondary: 'Doctor · OPD',           route: '/doctor/opd',         icon: <Activity className="w-4 h-4" />,        roles: ['super_admin', 'doctor'] },
  { id: 'pg-doctor-appts',       primary: 'My Appointments',        secondary: 'Doctor · Appointments',  route: '/doctor/appointments', icon: <Calendar className="w-4 h-4" />,       roles: ['super_admin', 'doctor'] },
  { id: 'pg-doctor-patients',    primary: 'Patient Records',        secondary: 'Doctor · Patients',      route: '/doctor/patients',    icon: <Users className="w-4 h-4" />,           roles: ['super_admin', 'doctor'] },
  { id: 'pg-doctor-rx',          primary: 'Prescriptions',          secondary: 'Doctor · Prescriptions', route: '/doctor/prescriptions', icon: <ClipboardList className="w-4 h-4" />, roles: ['super_admin', 'doctor'] },
  { id: 'pg-doctor-lab',         primary: 'Lab Results',            secondary: 'Doctor · Lab Results',   route: '/doctor/lab-results', icon: <FileText className="w-4 h-4" />,        roles: ['super_admin', 'doctor'] },
  { id: 'pg-doctor-timeline',    primary: 'Patient Timeline',       secondary: 'Doctor · Timeline',      route: '/doctor/timeline',    icon: <Clock className="w-4 h-4" />,           roles: ['super_admin', 'doctor'] },
  { id: 'pg-doctor-msgs',        primary: 'Messages',               secondary: 'Doctor · Messages',      route: '/doctor/messages',    icon: <MessageSquare className="w-4 h-4" />,   roles: ['super_admin', 'doctor'] },
  { id: 'pg-doctor-schedule',    primary: 'Schedule',               secondary: 'Doctor · Schedule',      route: '/doctor/schedule',    icon: <CalendarDays className="w-4 h-4" />,    roles: ['super_admin', 'doctor'] },
  // Lab
  { id: 'pg-lab',                primary: 'Lab Dashboard',          secondary: 'Lab Portal',             route: '/lab',                icon: <LayoutDashboard className="w-4 h-4" />, roles: ['super_admin', 'lab_technician'] },
  { id: 'pg-lab-pending',        primary: 'Pending Orders',         secondary: 'Lab · Pending',          route: '/lab/pending',        icon: <ListChecks className="w-4 h-4" />,      roles: ['super_admin', 'lab_technician'] },
  { id: 'pg-lab-progress',       primary: 'In Progress',            secondary: 'Lab · In Progress',      route: '/lab/in-progress',    icon: <FlaskConical className="w-4 h-4" />,    roles: ['super_admin', 'lab_technician'] },
  { id: 'pg-lab-batch',          primary: 'Batch Entry',            secondary: 'Lab · Batch',            route: '/lab/batch-entry',    icon: <LayoutList className="w-4 h-4" />,      roles: ['super_admin', 'lab_technician'] },
  { id: 'pg-lab-completed',      primary: 'Completed Reports',      secondary: 'Lab · Completed',        route: '/lab/completed',      icon: <CheckCircle className="w-4 h-4" />,     roles: ['super_admin', 'lab_technician'] },
  { id: 'pg-lab-templates',      primary: 'Test Templates',         secondary: 'Lab · Templates',        route: '/lab/templates',      icon: <TestTubes className="w-4 h-4" />,       roles: ['super_admin', 'lab_technician'] },
  { id: 'pg-lab-msgs',           primary: 'Messages',               secondary: 'Lab · Messages',         route: '/lab/messages',       icon: <MessageSquare className="w-4 h-4" />,   roles: ['super_admin', 'lab_technician'] },
  { id: 'pg-lab-patients',       primary: 'Patient Search',         secondary: 'Lab · Patients',         route: '/lab/patients',       icon: <Search className="w-4 h-4" />,          roles: ['super_admin', 'lab_technician'] },
];

const ACTIONS: Omit<SearchResult, 'category'>[] = [
  { id: 'act-new-patient',  primary: 'New Patient',     secondary: 'Register a new patient',    route: '/reception/register',  icon: <Zap className="w-4 h-4" />, roles: ['super_admin', 'receptionist'] },
  { id: 'act-start-opd',    primary: 'Start OPD',       secondary: 'Open OPD Queue',            route: '/doctor/opd',          icon: <Zap className="w-4 h-4" />, roles: ['super_admin', 'doctor'] },
  { id: 'act-batch-entry',  primary: 'Batch Entry',     secondary: 'Open Lab Batch Entry',      route: '/lab/batch-entry',     icon: <Zap className="w-4 h-4" />, roles: ['super_admin', 'lab_technician'] },
  { id: 'act-billing',      primary: 'Open Billing',    secondary: 'Go to Billing / Cashier',   route: '/reception/billing',   icon: <Zap className="w-4 h-4" />, roles: ['super_admin', 'receptionist'] },
  { id: 'act-prescriptions',primary: 'New Prescription',secondary: 'Open Prescriptions',        route: '/doctor/prescriptions', icon: <Zap className="w-4 h-4" />, roles: ['super_admin', 'doctor'] },
  { id: 'act-pending-labs', primary: 'Pending Labs',    secondary: 'View pending lab orders',   route: '/lab/pending',         icon: <Zap className="w-4 h-4" />, roles: ['super_admin', 'lab_technician'] },
];

// ─── Session storage for recent searches ──────────────────────────────────────

const RECENT_KEY = 'stryde-search-recent';

function getRecentSearches(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function addRecentSearch(term: string): void {
  if (!term.trim()) return;
  const recent = getRecentSearches().filter((r) => r !== term);
  recent.unshift(term);
  sessionStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 5)));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role ?? '';

  // Open / close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Patient route based on role
  const patientRoute = useCallback(() => {
    if (role === 'doctor' || role === 'super_admin') return '/doctor/patients';
    return '/reception/patients';
  }, [role]);

  // Build all results filtered by role and query
  const allResults: SearchResult[] = [
    ...PATIENTS.map((p) => ({
      ...p,
      category: 'Patients' as ResultCategory,
      icon: <User className="w-4 h-4" />,
      route: patientRoute(),
    })),
    ...PAGES
      .filter((pg) => !pg.roles || pg.roles.includes(role))
      .map((pg) => ({ ...pg, category: 'Pages' as ResultCategory })),
    ...ACTIONS
      .filter((a) => !a.roles || a.roles.includes(role))
      .map((a) => ({ ...a, category: 'Actions' as ResultCategory })),
  ];

  const filtered: SearchResult[] = query.trim()
    ? allResults.filter((item) => {
        const q = query.toLowerCase();
        return (
          item.primary.toLowerCase().includes(q) ||
          item.secondary.toLowerCase().includes(q)
        );
      })
    : [];

  // Group
  const grouped: Partial<Record<ResultCategory, SearchResult[]>> = {};
  for (const item of filtered) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category]!.push(item);
  }

  const flatFiltered = filtered; // for keyboard index tracking

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleSelect = useCallback(
    (item: SearchResult) => {
      addRecentSearch(item.primary);
      setOpen(false);
      navigate(item.route);
    },
    [navigate]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flatFiltered[activeIndex];
      if (item) handleSelect(item);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  if (!open) return null;

  let globalIdx = 0; // running counter for flat index
  const categories: ResultCategory[] = ['Patients', 'Pages', 'Actions'];

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh] px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md"
        style={{ animation: 'fadeIn 0.15s ease-out' }}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-[580px] glass-elevated overflow-hidden"
        style={{ animation: 'scaleIn 0.15s ease-out' }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--surface-border)]">
          <Search className="w-5 h-5 text-[var(--primary)] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search patients, pages, actions..."
            className="flex-1 bg-transparent text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)] outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors"
            >
              <X className="w-4 h-4 text-[var(--text-tertiary)]" />
            </button>
          )}
          <kbd
            onClick={() => setOpen(false)}
            className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold text-[var(--text-tertiary)] bg-[var(--surface)] border border-[var(--surface-border)] px-1.5 py-0.5 rounded cursor-pointer hover:bg-[var(--surface-hover)] transition-colors"
          >
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[420px] overflow-y-auto py-2">
          {!query.trim() ? (
            <RecentSearches onSelect={(term) => setQuery(term)} />
          ) : filtered.length === 0 ? (
            <EmptyResult query={query} />
          ) : (
            categories.map((cat) => {
              const items = grouped[cat];
              if (!items?.length) return null;
              return (
                <div key={cat} className="mb-2">
                  <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                    {cat}
                  </p>
                  {items.map((item) => {
                    const idx = globalIdx++;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={item.id}
                        data-idx={idx}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150',
                          isActive
                            ? 'bg-[var(--primary)]/10 text-[var(--text-primary)]'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--surface)]'
                        )}
                      >
                        <span
                          className={cn(
                            'shrink-0 p-1.5 rounded-[var(--radius-xs)] transition-colors',
                            isActive
                              ? 'bg-[var(--primary)]/20 text-[var(--primary)]'
                              : 'bg-[var(--surface)] text-[var(--text-tertiary)]'
                          )}
                        >
                          {item.icon}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-[var(--text-primary)] truncate">
                            {item.primary}
                          </span>
                          <span className="block text-[11px] text-[var(--text-tertiary)] truncate">
                            {item.secondary}
                          </span>
                        </span>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 text-[var(--primary)] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--surface-border)] bg-[var(--surface)]/40">
          <div className="flex items-center gap-3 text-[10px] text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center px-1 py-0.5 rounded border border-[var(--surface-border)] bg-[var(--surface)] font-mono text-[10px]">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center px-1 py-0.5 rounded border border-[var(--surface-border)] bg-[var(--surface)] font-mono text-[10px]">↵</kbd>
              select
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-tertiary)]">
            {filtered.length > 0 ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}` : ''}
          </span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RecentSearches({ onSelect }: { onSelect: (term: string) => void }) {
  const recents = getRecentSearches();
  if (!recents.length) {
    return (
      <div className="py-10 text-center">
        <Search className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3 opacity-50" />
        <p className="text-sm text-[var(--text-tertiary)]">
          Search patients, pages, and actions
        </p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 opacity-70">
          Type to begin
        </p>
      </div>
    );
  }
  return (
    <div className="px-4 py-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
        Recent Searches
      </p>
      <div className="flex flex-wrap gap-2">
        {recents.map((r) => (
          <button
            key={r}
            onClick={() => onSelect(r)}
            className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] px-2.5 py-1 rounded-full transition-colors"
          >
            <ArrowRight className="w-3 h-3 text-[var(--text-tertiary)]" />
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyResult({ query }: { query: string }) {
  return (
    <div className="py-10 text-center">
      <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] flex items-center justify-center mx-auto mb-3">
        <Search className="w-5 h-5 text-[var(--text-tertiary)] opacity-50" />
      </div>
      <p className="text-sm font-medium text-[var(--text-primary)]">
        No results for{' '}
        <span className="text-[var(--primary)]">&ldquo;{query}&rdquo;</span>
      </p>
      <p className="text-xs text-[var(--text-tertiary)] mt-1">
        Try a different search term
      </p>
    </div>
  );
}
