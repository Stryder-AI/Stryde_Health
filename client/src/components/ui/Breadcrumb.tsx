import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Route label map ──────────────────────────────────────────────────────────
// Maps every known route segment pattern to a human-readable label.
// Order: deepest path first for specificity.

const ROUTE_LABELS: Record<string, string> = {
  // Admin portal
  '/admin': 'Admin Portal',
  '/admin/users': 'User Management',
  '/admin/patients': 'Patient Registry',
  '/admin/appointments': 'Appointments',
  '/admin/doctors': 'Doctor Management',
  '/admin/lab': 'Lab Management',
  '/admin/pharmacy': 'Pharmacy Overview',
  '/admin/billing': 'Billing & Invoices',
  '/admin/reports': 'Reports & Analytics',
  '/admin/audit': 'Audit Trail',
  '/admin/messages': 'Messages',
  '/admin/settings': 'Settings',

  // Reception portal
  '/reception': 'Reception',
  '/reception/register': 'Register Patient',
  '/reception/patients': 'Patient Search',
  '/reception/appointments': "Today's Appointments",
  '/reception/schedule': 'Schedule',
  '/reception/billing': 'Billing / Cashier',
  '/reception/payments': 'Payment History',

  // Doctor portal
  '/doctor': 'Doctor Portal',
  '/doctor/opd': 'OPD Queue',
  '/doctor/consultation': 'Consultation',
  '/doctor/appointments': 'My Appointments',
  '/doctor/patients': 'Patient Records',
  '/doctor/prescriptions': 'Prescriptions',
  '/doctor/lab-results': 'Lab Results',
  '/doctor/timeline': 'Patient Timeline',
  '/doctor/messages': 'Messages',
  '/doctor/schedule': 'Schedule',

  // Lab portal
  '/lab': 'Lab Portal',
  '/lab/pending': 'Pending Orders',
  '/lab/in-progress': 'In Progress',
  '/lab/batch-entry': 'Batch Entry',
  '/lab/completed': 'Completed Reports',
  '/lab/templates': 'Test Templates',
  '/lab/messages': 'Messages',
  '/lab/patients': 'Patient Search',

  // Pharmacy portal
  '/pharmacy': 'Pharmacy',
  '/pharmacy/pos': 'Point of Sale',
  '/pharmacy/products': 'Products',
  '/pharmacy/stock': 'Stock',
  '/pharmacy/sales': 'Sales History',
  '/pharmacy/stock-alerts': 'Stock Alerts',
  '/pharmacy/verify': 'Prescription Verify',
  '/pharmacy/returns': 'Returns',
  '/pharmacy/reports': 'Reports',
  '/pharmacy/settings': 'Settings',
};

// Root portal labels (first segment)
const PORTAL_LABELS: Record<string, string> = {
  admin: 'Admin Portal',
  reception: 'Reception',
  doctor: 'Doctor Portal',
  lab: 'Lab Portal',
  pharmacy: 'Pharmacy',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Crumb {
  label: string;
  path: string;
  isCurrent: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Breadcrumb() {
  const { pathname } = useLocation();

  // Strip trailing slash
  const path = pathname.replace(/\/$/, '');

  // Don't render on dashboard pages (single-segment paths like /admin, /doctor, etc.)
  const segments = path.split('/').filter(Boolean);
  if (segments.length <= 1) return null;

  // Build crumbs: each intermediate path + the full path
  const crumbs: Crumb[] = [];

  // Home crumb always present
  crumbs.push({ label: 'Home', path: '/', isCurrent: false });

  // Build intermediate crumbs
  let built = '';
  for (let i = 0; i < segments.length; i++) {
    built += '/' + segments[i];
    const label =
      ROUTE_LABELS[built] ??
      (i === 0 ? PORTAL_LABELS[segments[i]] : null) ??
      // Fallback: capitalise the segment
      segments[i]
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    crumbs.push({
      label,
      path: built,
      isCurrent: i === segments.length - 1,
    });
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 px-6 py-2 border-b border-[var(--surface-border)] bg-[var(--sidebar-bg)]/40 backdrop-blur-sm"
    >
      <ol className="flex items-center gap-1 flex-wrap" role="list">
        {crumbs.map((crumb, index) => (
          <li key={crumb.path} className="flex items-center gap-1" role="listitem">
            {index > 0 && (
              <ChevronRight
                className="w-3 h-3 text-[var(--text-tertiary)] shrink-0"
                aria-hidden="true"
              />
            )}

            {crumb.isCurrent ? (
              <span
                aria-current="page"
                className="text-[12px] font-medium text-[var(--text-primary)]"
              >
                {crumb.label}
              </span>
            ) : index === 0 ? (
              // Home icon link
              <Link
                to={crumb.path}
                aria-label="Home"
                className={cn(
                  'flex items-center text-[12px] text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors duration-150'
                )}
              >
                <Home className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to={crumb.path}
                className="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors duration-150"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
