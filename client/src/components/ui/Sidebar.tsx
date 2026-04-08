import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronLeft, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLanguageStore } from '@/stores/languageStore';

// Label translation map for nav items
const NAV_TRANSLATIONS: Record<string, string> = {
  'Dashboard': 'ڈیش بورڈ',
  'OPD Queue': 'او پی ڈی قطار',
  'My Appointments': 'میری اپائنٹمنٹ',
  'Patient Records': 'مریض کا ریکارڈ',
  'Prescriptions': 'نسخے',
  'Lab Results': 'لیب رپورٹ',
  'Patient Timeline': 'ٹائم لائن',
  'Messages': 'پیغامات',
  'Schedule': 'شیڈول',
  'Register Patient': 'مریض رجسٹریشن',
  'Patient Search': 'مریض تلاش',
  "Today's Appointments": 'آج کی اپائنٹمنٹ',
  'Billing / Cashier': 'بلنگ',
  'Payment History': 'ادائیگی',
  'SMS Notifications': 'ایس ایم ایس',
  'Patient Portal': 'مریض پورٹل',
  'User Management': 'صارف انتظام',
  'Patient Registry': 'مریض رجسٹری',
  'Appointments': 'اپائنٹمنٹ',
  'Doctors': 'ڈاکٹرز',
  'Lab Management': 'لیب انتظام',
  'Pharmacy': 'فارمیسی',
  'Billing & Invoices': 'بلنگ',
  'Reports & Analytics': 'رپورٹس',
  'Audit Trail': 'آڈٹ',
  'Settings': 'ترتیبات',
  'Pending Orders': 'زیر التواء',
  'In Progress': 'جاری',
  'Batch Entry': 'بیچ انٹری',
  'Completed Reports': 'مکمل رپورٹس',
  'Test Templates': 'ٹیسٹ',
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SidebarItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface SidebarContextValue {
  mobileOpen: boolean;
  collapsed: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  mobileOpen: false,
  collapsed: false,
  openMobile: () => {},
  closeMobile: () => {},
  toggleCollapsed: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleCollapsed = useCallback(() => setCollapsed((v) => !v), []);

  // Close mobile sidebar on route change (listen for popstate / navigation)
  useEffect(() => {
    const close = () => setMobileOpen(false);
    window.addEventListener('popstate', close);
    return () => window.removeEventListener('popstate', close);
  }, []);

  return (
    <SidebarContext.Provider value={{ mobileOpen, collapsed, openMobile, closeMobile, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

// ─── Tooltip (for collapsed icon-only mode) ───────────────────────────────────

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-[200] px-2.5 py-1 rounded-[var(--radius-xs)] bg-[var(--surface-elevated,#1e293b)] text-[var(--text-primary)] text-xs font-medium whitespace-nowrap pointer-events-none shadow-xl border border-[var(--surface-border)]"
          role="tooltip"
        >
          {label}
          {/* arrow */}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[var(--surface-elevated,#1e293b)]" />
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  items: SidebarItem[];
  title: string;
  subtitle?: string;
}

export function Sidebar({ items, title, subtitle }: SidebarProps) {
  const { mobileOpen, collapsed, closeMobile, toggleCollapsed } = useSidebar();
  const { language } = useLanguageStore();

  function translateLabel(label: string): string {
    if (language === 'ur') {
      return NAV_TRANSLATIONS[label] ?? label;
    }
    return label;
  }

  // ── Desktop sidebar ──────────────────────────────────────────────────────────
  const desktopSidebar = (
    <aside
      id="tour-sidebar"
      aria-label="Main navigation"
      className={cn(
        'hidden lg:flex flex-col h-screen bg-[var(--sidebar-bg)] backdrop-blur-xl border-r border-[var(--surface-border)] shrink-0',
        'transition-[width] duration-300 ease-in-out overflow-hidden',
        collapsed ? 'w-[64px]' : 'w-[260px]'
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          'flex items-center border-b border-[var(--surface-border)] shrink-0',
          collapsed ? 'px-3 py-5 justify-center' : 'px-6 py-5 gap-3'
        )}
      >
        <div className="w-9 h-9 rounded-[var(--radius-sm)] overflow-hidden shadow-md shrink-0">
          <img src="/stryde-logo.png" alt="Stryde Health" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight whitespace-nowrap">{title}</h1>
            {subtitle && (
              <p className="text-[11px] font-medium text-[var(--primary)] tracking-wide uppercase whitespace-nowrap">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 py-4 space-y-0.5 overflow-y-auto', collapsed ? 'px-1.5' : 'px-3')}>
        {items.map((item) =>
          collapsed ? (
            <Tooltip key={item.path} label={item.label}>
              <NavLink
                to={item.path}
                end={item.path.split('/').length <= 2}
                aria-label={item.label}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-center w-10 h-10 mx-auto rounded-[var(--radius-sm)]',
                    'transition-all duration-250 ease-out',
                    isActive
                      ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] shadow-[0_2px_12px_var(--primary-glow)]'
                      : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--text-primary)]'
                  )
                }
              >
                {({ isActive }) => (
                  <item.icon
                    aria-hidden="true"
                    className={cn('w-[18px] h-[18px]', isActive && 'text-[var(--sidebar-active-text)]')}
                  />
                )}
              </NavLink>
            </Tooltip>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.split('/').length <= 2}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-[13px] font-medium',
                  'transition-all duration-250 ease-out group relative',
                  isActive
                    ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] shadow-[0_2px_12px_var(--primary-glow)] sidebar-active-glow'
                    : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--text-primary)] sidebar-item-shine'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    aria-hidden="true"
                    className={cn(
                      'w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200',
                      !isActive && 'group-hover:scale-110'
                    )}
                  />
                  <span style={language === 'ur' ? { fontFamily: "'Noto Nastaliq Urdu', serif" } : undefined}>
                    {translateLabel(item.label)}
                  </span>
                </>
              )}
            </NavLink>
          )
        )}
      </nav>

      {/* Branding footer */}
      {!collapsed && (
        <div className="px-4 py-2.5 border-t border-[var(--surface-border)]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-[var(--text-tertiary)]">Product of</span>
            <img src="/techgis-logo-long.png" alt="TechGIS" className="h-3.5 object-contain opacity-70" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-tertiary)]">Powered By:</span>
            <img src="/stryde-logo-type.png" alt="STRYDE Technologies" className="h-3.5 object-contain opacity-70" />
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <div
        className={cn(
          'border-t border-[var(--surface-border)] flex items-center',
          collapsed ? 'px-1.5 py-3 justify-center' : 'px-4 py-3 justify-between'
        )}
      >
        {!collapsed && <p className="text-[11px] text-[var(--text-tertiary)]">Stryde Health v1.0</p>}
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'p-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-all duration-200 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
            collapsed && 'w-10 h-10 flex items-center justify-center'
          )}
        >
          <ChevronLeft
            className={cn(
              'w-4 h-4 transition-transform duration-300',
              collapsed && 'rotate-180'
            )}
          />
        </button>
      </div>
    </aside>
  );

  // ── Mobile overlay sidebar (portal) ─────────────────────────────────────────
  const mobileSidebar = createPortal(
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        aria-label="Main navigation"
        aria-hidden={!mobileOpen}
        className={cn(
          'fixed top-0 left-0 z-[301] h-full w-[260px] flex flex-col',
          'bg-[var(--sidebar-bg)] backdrop-blur-xl border-r border-[var(--surface-border)]',
          'transition-transform duration-300 ease-in-out lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand row with close */}
        <div className="px-6 py-5 border-b border-[var(--surface-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--radius-sm)] overflow-hidden shadow-md">
              <img src="/stryde-logo.png" alt="Stryde Health" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">{title}</h1>
              {subtitle && (
                <p className="text-[11px] font-medium text-[var(--primary)] tracking-wide uppercase">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={closeMobile}
            aria-label="Close navigation"
            className="p-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.split('/').length <= 2}
              onClick={closeMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-[13px] font-medium',
                  'transition-all duration-250 ease-out group relative',
                  isActive
                    ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] shadow-[0_2px_12px_var(--primary-glow)]'
                    : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--text-primary)]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    aria-hidden="true"
                    className={cn(
                      'w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200',
                      !isActive && 'group-hover:scale-110'
                    )}
                  />
                  <span style={language === 'ur' ? { fontFamily: "'Noto Nastaliq Urdu', serif" } : undefined}>
                    {translateLabel(item.label)}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-2.5 border-t border-[var(--surface-border)]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-[var(--text-tertiary)]">Product of</span>
            <img src="/techgis-logo-long.png" alt="TechGIS" className="h-3.5 object-contain opacity-70" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-tertiary)]">Powered By:</span>
            <img src="/stryde-logo-type.png" alt="STRYDE Technologies" className="h-3.5 object-contain opacity-70" />
          </div>
        </div>
      </aside>
    </>,
    document.body
  );

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
}
