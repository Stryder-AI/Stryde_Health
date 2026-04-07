import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Bell, CheckCheck, FlaskConical, UserPlus, AlertTriangle,
  FileText, Calendar, Settings, CreditCard, Pill, Clock, Stethoscope,
  ShieldAlert, Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type NotifTab = 'all' | 'alerts' | 'tasks' | 'system';

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  tab: 'alerts' | 'tasks' | 'system';
  icon: React.ReactNode;
}

const initialNotifications: Notification[] = [
  { id: '1', title: 'Lab Results Ready', description: 'CBC report for Ahmad Khan (MR-2026-00001) is ready for review.', timestamp: '2 min ago', read: false, tab: 'tasks', icon: <FlaskConical className="w-4 h-4 text-purple-500" /> },
  { id: '2', title: 'New Patient Registered', description: 'Fatima Bibi (MR-2026-00002) has been registered at reception.', timestamp: '5 min ago', read: false, tab: 'alerts', icon: <UserPlus className="w-4 h-4 text-blue-500" /> },
  { id: '3', title: 'Low Stock Alert', description: 'Paracetamol 500mg stock is below reorder level (15 units remaining).', timestamp: '8 min ago', read: false, tab: 'alerts', icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> },
  { id: '4', title: 'Prescription Pending Verification', description: 'Dr. Tariq Ahmed prescribed 3 items for Token #12 awaiting pharmacy verification.', timestamp: '12 min ago', read: false, tab: 'tasks', icon: <Pill className="w-4 h-4 text-teal-500" /> },
  { id: '5', title: 'Appointment Cancelled', description: 'Rabia Kanwal cancelled her 10:45 AM appointment with Dr. Asif Javed.', timestamp: '18 min ago', read: true, tab: 'alerts', icon: <Calendar className="w-4 h-4 text-red-500" /> },
  { id: '6', title: 'Follow-up Reminder', description: 'Usman Ali is due for a cardiology follow-up visit today.', timestamp: '25 min ago', read: false, tab: 'tasks', icon: <Stethoscope className="w-4 h-4 text-[var(--primary)]" /> },
  { id: '7', title: 'System Update Available', description: 'Stryde Health v2.1.0 is available. New features include improved reporting.', timestamp: '1 hr ago', read: true, tab: 'system', icon: <Settings className="w-4 h-4 text-gray-500" /> },
  { id: '8', title: 'Payment Received', description: 'Rs. 3,500 received from Hassan Ali for consultation and lab tests.', timestamp: '1 hr ago', read: true, tab: 'alerts', icon: <CreditCard className="w-4 h-4 text-emerald-500" /> },
  { id: '9', title: 'Lab Order Placed', description: 'Dr. Saira Khan ordered Lipid Profile and RFTs for Ayesha Noor.', timestamp: '1.5 hr ago', read: true, tab: 'tasks', icon: <FileText className="w-4 h-4 text-blue-500" /> },
  { id: '10', title: 'Security Alert', description: 'Failed login attempt detected from IP 192.168.1.45 — 3 attempts.', timestamp: '2 hr ago', read: false, tab: 'system', icon: <ShieldAlert className="w-4 h-4 text-red-500" /> },
  { id: '11', title: 'Inventory Expiry Warning', description: 'Insulin Mixtard 70/30 batch #BT-4521 expires in 15 days.', timestamp: '2 hr ago', read: true, tab: 'alerts', icon: <Package className="w-4 h-4 text-orange-500" /> },
  { id: '12', title: 'Backup Completed', description: 'Daily database backup completed successfully at 03:00 AM.', timestamp: '5 hr ago', read: true, tab: 'system', icon: <Settings className="w-4 h-4 text-emerald-500" /> },
  { id: '13', title: 'Queue Update', description: '3 patients are currently waiting in the OPD queue.', timestamp: '30 min ago', read: false, tab: 'tasks', icon: <Clock className="w-4 h-4 text-amber-500" /> },
];

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const [tab, setTab] = useState<NotifTab>('all');
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const drawerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = tab === 'all' ? notifications : notifications.filter((n) => n.tab === tab);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const tabs: { key: NotifTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'alerts', label: 'Alerts' },
    { key: 'tasks', label: 'Tasks' },
    { key: 'system', label: 'System' },
  ];

  const drawer = (
    <div
      className={cn(
        'fixed inset-0 z-[9998] transition-opacity duration-300',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md glass-elevated rounded-none border-l border-[var(--surface-border)] shadow-2xl flex flex-col transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-border)] shrink-0">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="danger" dot>{unreadCount} new</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-all group"
            >
              <X className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--surface-border)] px-6 shrink-0">
          {tabs.map((t) => {
            const count = t.key === 'all' ? notifications.length : notifications.filter((n) => n.tab === t.key).length;
            const unread = t.key === 'all' ? unreadCount : notifications.filter((n) => n.tab === t.key && !n.read).length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200',
                  tab === t.key
                    ? 'text-[var(--primary)] border-[var(--primary)]'
                    : 'text-[var(--text-tertiary)] border-transparent hover:text-[var(--text-secondary)]'
                )}
              >
                {t.label}
                {unread > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--danger)] text-white text-[10px] font-bold">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Bell className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--surface-border)]">
              {filtered.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex gap-3 px-6 py-4 transition-colors duration-200 hover:bg-[var(--surface)] group cursor-pointer',
                    !n.read && 'bg-[var(--primary-light)]/30'
                  )}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="shrink-0 mt-0.5 p-2 rounded-[var(--radius-xs)] bg-[var(--surface)] border border-[var(--surface-border)]">
                    {n.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm text-[var(--text-primary)]', !n.read && 'font-semibold')}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{n.description}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {n.timestamp}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    className="shrink-0 p-1 rounded-[var(--radius-xs)] opacity-0 group-hover:opacity-100 hover:bg-[var(--danger-bg)] transition-all"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5 text-[var(--text-tertiary)] hover:text-[var(--danger)]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(drawer, document.body);
}

/** Hook to get unread count for the bell icon */
export function useNotificationCount() {
  return initialNotifications.filter((n) => !n.read).length;
}
