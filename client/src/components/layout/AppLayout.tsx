import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Bell, Search, User, Menu } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar, SidebarProvider, useSidebar, type SidebarItem } from '@/components/ui/Sidebar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ROLE_LABELS } from '@/lib/constants';
import { SearchCommand } from '@/components/ui/SearchCommand';
import { PageTransition } from '@/components/ui/PageTransition';
import { NotificationDrawer, useNotificationCount } from '@/components/ui/NotificationDrawer';
import { KeyboardShortcuts } from '@/components/ui/KeyboardShortcuts';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { OnboardingTour } from '@/components/ui/OnboardingTour';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { useThemeStore } from '@/stores/themeStore';

interface AppLayoutProps {
  sidebarItems: SidebarItem[];
  portalTitle: string;
}

// Inner layout — consumes the SidebarContext provided by SidebarProvider
function AppLayoutInner({ sidebarItems, portalTitle }: AppLayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = useNotificationCount();
  const { openMobile, collapsed } = useSidebar();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  const { colorBlindMode } = useThemeStore();

  // Sync data-colorblind attribute on html element
  useEffect(() => {
    if (colorBlindMode) {
      document.documentElement.setAttribute('data-colorblind', 'true');
    } else {
      document.documentElement.removeAttribute('data-colorblind');
    }
  }, [colorBlindMode]);

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of Stryde Health?',
      confirmText: 'Sign Out',
      cancelText: 'Stay',
      variant: 'warning',
    });
    if (!ok) return;
    logout();
    navigate('/login');
  };

  // Trigger SearchCommand by firing the Ctrl+K keyboard event
  const openSearch = () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  };

  return (
    <div className="bg-mesh flex min-h-screen">
      <div className="blob-extra" />
      <div className="blob-1" />
      <div className="blob-2" />
      <div className="blob-3" />
      <div className="blob-4" />

      <Sidebar items={sidebarItems} title="Stryde Health" subtitle={portalTitle} />

      {/* Main area — shifts based on sidebar state */}
      <div
        className="flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300"
        style={{ marginLeft: 0 }}
      >
        {/* Top Bar */}
        <header id="tour-header" className="h-16 bg-[var(--sidebar-bg)] backdrop-blur-xl border-b border-[var(--surface-border)] flex items-center justify-between px-4 lg:px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={openMobile}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search trigger */}
            <button
              data-search-trigger
              onClick={openSearch}
              className="flex items-center gap-2.5 px-4 py-2 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--surface-border)] text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--surface-border-hover)] hover:bg-[var(--surface-hover)] transition-all duration-200 group"
            >
              <Search className="w-4 h-4 group-hover:text-[var(--primary)] transition-colors" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline ml-2 text-[10px] font-semibold bg-[var(--surface-hover)] px-1.5 py-0.5 rounded border border-[var(--surface-border)]">
                Ctrl+K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <LanguageToggle />

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <button
              onClick={() => setNotifOpen(true)}
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              className="relative p-2 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-all duration-200 group"
            >
              <Bell className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--danger)] text-white text-[10px] font-bold ring-2 ring-[var(--bg-base)]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="w-px h-8 bg-[var(--surface-border)]" aria-hidden="true" />

            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{user?.fullName}</p>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  {user?.role ? ROLE_LABELS[user.role] : ''}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-md">
                <User className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-[var(--radius-xs)] hover:bg-[var(--danger-bg)] transition-all duration-200 group"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--danger)] transition-colors" />
              </button>
            </div>
          </div>
        </header>

        {/* Breadcrumb — shown on non-dashboard pages */}
        <Breadcrumb />

        {/* Main Content */}
        <main id="tour-main-content" className="flex-1 p-6 overflow-auto">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>

      <SearchCommand />
      <KeyboardShortcuts />
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
      <OnboardingTour />
      <FloatingActionButton />
      <ConfirmDialog
        open={confirmState.open}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
        loading={confirmState.loading}
      />
    </div>
  );
}

// Public export wraps with the SidebarProvider
export function AppLayout({ sidebarItems, portalTitle }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppLayoutInner sidebarItems={sidebarItems} portalTitle={portalTitle} />
    </SidebarProvider>
  );
}
