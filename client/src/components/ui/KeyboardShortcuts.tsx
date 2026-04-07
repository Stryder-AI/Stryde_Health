import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Keyboard, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Shortcut {
  keys: string[];         // e.g. ['Ctrl', 'K'] or ['G', 'D']
  description: string;
  category: 'Global' | 'Navigation' | 'Actions';
  roles?: string[];       // undefined = all roles
}

// ─── Shortcut definitions ─────────────────────────────────────────────────────

const ALL_SHORTCUTS: Shortcut[] = [
  // Global
  { keys: ['?'],              description: 'Show keyboard shortcuts',     category: 'Global' },
  { keys: ['Ctrl', 'K'],      description: 'Open global search',          category: 'Global' },
  { keys: ['Ctrl', '/'],      description: 'Focus search bar',            category: 'Global' },
  { keys: ['Esc'],            description: 'Close modal / panel',         category: 'Global' },
  // Navigation
  { keys: ['Alt', 'D'],       description: 'Go to Dashboard',             category: 'Navigation' },
  { keys: ['Alt', 'P'],       description: 'Go to Patients',              category: 'Navigation' },
  { keys: ['Alt', 'Q'],       description: 'Go to OPD Queue',             category: 'Navigation', roles: ['doctor', 'super_admin'] },
  { keys: ['G', 'D'],         description: 'Go to Dashboard (vim-style)', category: 'Navigation' },
  { keys: ['G', 'O'],         description: 'Go to OPD (vim-style)',       category: 'Navigation', roles: ['doctor', 'super_admin'] },
  // Actions
  { keys: ['Ctrl', 'N'],      description: 'New Patient',                 category: 'Actions',    roles: ['receptionist', 'super_admin'] },
];

// ─── Chord state (for vim-style two-key sequences) ────────────────────────────

type ChordKey = 'G' | null;

// ─── Component ────────────────────────────────────────────────────────────────

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role ?? '';

  // Chord: waiting for second key after 'G'
  const pendingChordRef = useRef<ChordKey>(null);
  const chordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearChord = useCallback(() => {
    pendingChordRef.current = null;
    if (chordTimeoutRef.current) {
      clearTimeout(chordTimeoutRef.current);
      chordTimeoutRef.current = null;
    }
  }, []);

  const dashboardRoute = useCallback(() => {
    const map: Record<string, string> = {
      super_admin: '/admin',
      receptionist: '/reception',
      doctor: '/doctor',
      lab_technician: '/lab',
      pharmacist: '/pharmacy/pos',
    };
    return map[role] ?? '/';
  }, [role]);

  const patientsRoute = useCallback(() => {
    if (role === 'doctor' || role === 'super_admin') return '/doctor/patients';
    if (role === 'receptionist') return '/reception/patients';
    if (role === 'lab_technician') return '/lab/patients';
    return '/';
  }, [role]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // ── Chord: waiting for second key ─────────────────────────────────────
      if (pendingChordRef.current === 'G') {
        clearChord();
        if (inInput) return;
        if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          navigate(dashboardRoute());
          return;
        }
        if ((e.key === 'o' || e.key === 'O') && (role === 'doctor' || role === 'super_admin')) {
          e.preventDefault();
          navigate('/doctor/opd');
          return;
        }
        return;
      }

      // ── Global shortcuts (work even in inputs, like Ctrl+K) ───────────────
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        // Handled by SearchCommand — no action needed here
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        // Focus the search bar button in the header
        const searchBtn = document.querySelector<HTMLButtonElement>('[data-search-trigger]');
        searchBtn?.click();
        return;
      }

      // Below shortcuts should NOT fire inside inputs
      if (inInput) return;

      // ── ? — open shortcuts help ────────────────────────────────────────────
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }

      // ── Ctrl+N — new patient ───────────────────────────────────────────────
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        if (role === 'receptionist' || role === 'super_admin') {
          e.preventDefault();
          navigate('/reception/register');
        }
        return;
      }

      // ── Alt+D — dashboard ─────────────────────────────────────────────────
      if (e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        navigate(dashboardRoute());
        return;
      }

      // ── Alt+Q — OPD queue ─────────────────────────────────────────────────
      if (e.altKey && (e.key === 'q' || e.key === 'Q')) {
        if (role === 'doctor' || role === 'super_admin') {
          e.preventDefault();
          navigate('/doctor/opd');
        }
        return;
      }

      // ── Alt+P — patients ──────────────────────────────────────────────────
      if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        navigate(patientsRoute());
        return;
      }

      // ── G — start chord ───────────────────────────────────────────────────
      if ((e.key === 'g' || e.key === 'G') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        pendingChordRef.current = 'G';
        // Auto-cancel chord after 1.5 seconds
        chordTimeoutRef.current = setTimeout(clearChord, 1500);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearChord();
    };
  }, [navigate, role, dashboardRoute, patientsRoute, clearChord]);

  // Filter shortcuts for current role
  const visibleShortcuts = ALL_SHORTCUTS.filter(
    (s) => !s.roles || s.roles.includes(role)
  );

  const categories: Shortcut['category'][] = ['Global', 'Navigation', 'Actions'];

  if (!open) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-md"
        style={{ animation: 'fadeIn 0.15s ease-out' }}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        className="relative w-full max-w-lg glass-elevated overflow-hidden"
        style={{ animation: 'scaleIn 0.15s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--surface-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--primary)]/10">
              <Keyboard className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Keyboard Shortcuts</h2>
              <p className="text-xs text-[var(--text-tertiary)]">Press <KeyBadge>?</KeyBadge> anytime to toggle</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close shortcuts"
            className="p-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-5">
          {categories.map((cat) => {
            const items = visibleShortcuts.filter((s) => s.category === cat);
            if (!items.length) return null;
            return (
              <div key={cat}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
                  {cat}
                </p>
                <div className="space-y-1">
                  {items.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1.5 px-2 rounded-[var(--radius-xs)] hover:bg-[var(--surface)] transition-colors"
                    >
                      <span className="text-sm text-[var(--text-secondary)]">{s.description}</span>
                      <div className="flex items-center gap-1">
                        {s.keys.map((key, ki) => (
                          <span key={ki} className="flex items-center gap-1">
                            {ki > 0 && (
                              <span className="text-[var(--text-tertiary)] text-[10px]">
                                {s.keys.length === 2 && ki === 1 && s.keys[0].length === 1 ? 'then' : '+'}
                              </span>
                            )}
                            <KeyBadge>{key}</KeyBadge>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--surface-border)] bg-[var(--surface)]/40">
          <p className="text-[11px] text-[var(--text-tertiary)] text-center">
            Showing shortcuts for your role:{' '}
            <span className="font-semibold text-[var(--text-secondary)]">{role.replace('_', ' ')}</span>
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// ─── KeyBadge ─────────────────────────────────────────────────────────────────

function KeyBadge({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center min-w-[26px] h-[22px] px-1.5',
        'text-[11px] font-semibold font-mono',
        'bg-[var(--surface)] border border-[var(--surface-border)] rounded',
        'text-[var(--text-primary)]',
        'shadow-[0_1px_0_var(--surface-border)]'
      )}
    >
      {children}
    </kbd>
  );
}
