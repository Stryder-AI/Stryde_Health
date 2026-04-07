import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Stethoscope, User, FileText, UserPlus, Calendar, DollarSign, FlaskConical, ClipboardList, ShoppingCart, CheckSquare, AlertTriangle, Users, BarChart3 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

// ── Role Actions ─────────────────────────────────────────────────────────────

interface FabAction {
  icon: LucideIcon;
  label: string;
  path: string;
  color?: string;
}

const ROLE_ACTIONS: Record<string, FabAction[]> = {
  doctor: [
    { icon: Stethoscope, label: 'Start Consult', path: '/doctor/opd', color: 'bg-teal-500 hover:bg-teal-600' },
    { icon: User, label: 'Patient Search', path: '/doctor/patients', color: 'bg-blue-500 hover:bg-blue-600' },
    { icon: FileText, label: 'New Prescription', path: '/doctor/prescriptions', color: 'bg-purple-500 hover:bg-purple-600' },
  ],
  receptionist: [
    { icon: UserPlus, label: 'Register Patient', path: '/reception/register', color: 'bg-teal-500 hover:bg-teal-600' },
    { icon: Calendar, label: 'Book Appointment', path: '/reception/schedule', color: 'bg-blue-500 hover:bg-blue-600' },
    { icon: DollarSign, label: 'New Bill', path: '/reception/billing', color: 'bg-emerald-500 hover:bg-emerald-600' },
  ],
  lab_technician: [
    { icon: FlaskConical, label: 'Pending Orders', path: '/lab/pending', color: 'bg-amber-500 hover:bg-amber-600' },
    { icon: ClipboardList, label: 'Batch Entry', path: '/lab/batch-entry', color: 'bg-teal-500 hover:bg-teal-600' },
  ],
  pharmacist: [
    { icon: ShoppingCart, label: 'POS', path: '/pharmacy/pos', color: 'bg-teal-500 hover:bg-teal-600' },
    { icon: CheckSquare, label: 'Verify Rx', path: '/pharmacy/verify', color: 'bg-blue-500 hover:bg-blue-600' },
    { icon: AlertTriangle, label: 'Stock Alerts', path: '/pharmacy/stock-alerts', color: 'bg-amber-500 hover:bg-amber-600' },
  ],
  super_admin: [
    { icon: Users, label: 'Users', path: '/admin/users', color: 'bg-purple-500 hover:bg-purple-600' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports', color: 'bg-teal-500 hover:bg-teal-600' },
    { icon: User, label: 'Patients', path: '/admin/patients', color: 'bg-blue-500 hover:bg-blue-600' },
  ],
};

// ── Position storage ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'stryde-fab-position';

function loadPosition(): { bottom: number; right: number } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {/* ignore */}
  return { bottom: 24, right: 24 };
}

function savePosition(pos: { bottom: number; right: number }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch {/* ignore */}
}

// ── Component ────────────────────────────────────────────────────────────────

export function FloatingActionButton() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [position, setPosition] = useState(loadPosition);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startBottom: number; startRight: number } | null>(null);
  const mainBtnRef = useRef<HTMLButtonElement>(null);

  const role = user?.role ?? '';
  const actions = ROLE_ACTIONS[role] ?? [];

  if (actions.length === 0) return null;

  // ── Close on backdrop click ──────────────────────────────────────────────
  const handleBackdropClick = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // ── Drag to reposition ───────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    if (open) return; // don't drag when expanded
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startBottom: position.bottom,
      startRight: position.right,
    };
    setDragging(true);

    const onMove = (me: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = me.clientX - dragRef.current.startX;
      const dy = me.clientY - dragRef.current.startY;
      const newRight = Math.max(12, Math.min(window.innerWidth - 64, dragRef.current.startRight - dx));
      const newBottom = Math.max(12, Math.min(window.innerHeight - 64, dragRef.current.startBottom - dy));
      setPosition({ bottom: newBottom, right: newRight });
    };

    const onUp = () => {
      setDragging(false);
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      setPosition((pos) => { savePosition(pos); return pos; });
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleMainClick = () => {
    if (dragging) return;
    setOpen((v) => !v);
  };

  const handleActionClick = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const fab = (
    <div
      className="fab-container fixed z-[7000] select-none"
      style={{ bottom: position.bottom, right: position.right }}
    >
      {/* Backdrop when open */}
      {open && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Mini action buttons — fan up */}
      <div className="absolute bottom-full mb-3 right-0 flex flex-col items-end gap-2.5">
        {actions.map((action, i) => {
          const delay = open ? i * 50 : (actions.length - 1 - i) * 40;
          const translateY = open ? 0 : 16;
          const opacity = open ? 1 : 0;
          const scale = open ? 1 : 0.8;

          return (
            <div
              key={action.path}
              className="flex items-center gap-2"
              style={{
                transform: `translateY(${translateY}px) scale(${scale})`,
                opacity,
                transition: `all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
                pointerEvents: open ? 'auto' : 'none',
              }}
            >
              {/* Label tooltip */}
              <span
                className={cn(
                  'text-xs font-semibold whitespace-nowrap px-2.5 py-1 rounded-[var(--radius-xs)]',
                  'glass-elevated shadow-md text-[var(--text-primary)]',
                  'transition-all duration-150',
                  hoveredIndex === i ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
                )}
              >
                {action.label}
              </span>

              {/* Action button */}
              <button
                onClick={() => handleActionClick(action.path)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                aria-label={action.label}
                className={cn(
                  'w-11 h-11 rounded-full text-white shadow-lg',
                  'flex items-center justify-center flex-shrink-0',
                  'transition-all duration-200 active:scale-90 hover:scale-110',
                  action.color ?? 'bg-[var(--primary)] hover:bg-[var(--primary-hover)]'
                )}
              >
                <action.icon className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Main FAB button */}
      <button
        ref={mainBtnRef}
        onClick={handleMainClick}
        onMouseDown={handleMouseDown}
        aria-label={open ? 'Close quick actions' : 'Quick actions'}
        aria-expanded={open}
        className={cn(
          'w-14 h-14 rounded-full shadow-xl flex items-center justify-center',
          'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)]',
          'transition-all duration-300',
          'hover:shadow-[0_8px_32px_var(--primary-glow)] hover:scale-110',
          'active:scale-95',
          dragging && 'cursor-grabbing',
          !open && !dragging && 'cursor-grab',
          open && 'bg-gradient-to-br from-[var(--text-secondary)] to-[var(--text-tertiary)]'
        )}
        style={{ touchAction: 'none' }}
      >
        <span
          className="transition-transform duration-300"
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
        >
          {open ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
        </span>
      </button>

      {/* Drag hint tooltip */}
      {!open && !dragging && (
        <div className="absolute -top-8 right-0 text-[10px] text-[var(--text-tertiary)] whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          Drag to move
        </div>
      )}
    </div>
  );

  return createPortal(fab, document.body);
}
