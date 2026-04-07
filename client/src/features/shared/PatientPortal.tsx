import { useState, useEffect, useRef } from 'react';
import { Clock, User, Stethoscope, ChevronRight, RefreshCw, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QueueEntry {
  tokenNumber: number;
  patientName: string;
  mrNumber: string;
  doctorName: string;
  department: string;
  position: number;
  totalInQueue: number;
  estimatedWaitMinutes: number;
  status: 'waiting' | 'called' | 'in_progress' | 'completed';
}

// ─── Demo queue data ──────────────────────────────────────────────────────────

const INITIAL_QUEUE: QueueEntry = {
  tokenNumber: 14,
  patientName: 'Ahmad Raza',
  mrNumber: 'MR-2026-00014',
  doctorName: 'Dr. Tariq Ahmed',
  department: 'Cardiology',
  position: 3,
  totalInQueue: 12,
  estimatedWaitMinutes: 25,
  status: 'waiting',
};

// Simulate queue advancing over time
function simulateQueueAdvance(entry: QueueEntry): QueueEntry {
  if (entry.position <= 1) return { ...entry, status: 'called', position: 1, estimatedWaitMinutes: 0 };
  const newPos = Math.max(1, entry.position - 1);
  const newWait = Math.max(0, (newPos - 1) * 8 + Math.floor(Math.random() * 3));
  return {
    ...entry,
    position: newPos,
    estimatedWaitMinutes: newWait,
    status: newPos === 1 ? 'called' : 'waiting',
  };
}

// ─── Progress arc (SVG) ───────────────────────────────────────────────────────

function ProgressArc({ value, max, size = 160 }: { value: number; max: number; size?: number }) {
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius; // half circle
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const dashOffset = circumference * (1 - progress);
  const cx = size / 2;
  const cy = size * 0.6;

  return (
    <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
      {/* Track */}
      <path
        d={`M ${10} ${cy} A ${radius} ${radius} 0 0 1 ${size - 10} ${cy}`}
        fill="none"
        stroke="var(--surface-border)"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* Progress */}
      <path
        d={`M ${10} ${cy} A ${radius} ${radius} 0 0 1 ${size - 10} ${cy}`}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{ transition: 'stroke-dashoffset 1s ease', filter: 'drop-shadow(0 0 6px var(--primary-glow))' }}
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PatientPortal() {
  const [queue, setQueue] = useState<QueueEntry>(INITIAL_QUEUE);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [countdown, setCountdown] = useState(30);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isNext = queue.position === 1;
  const isCalled = queue.status === 'called';

  function refresh() {
    setQueue((prev) => simulateQueueAdvance(prev));
    setLastRefresh(new Date());
    setCountdown(30);
  }

  useEffect(() => {
    // Auto-refresh every 30s
    intervalRef.current = setInterval(() => {
      refresh();
    }, 30000);

    // Countdown timer
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { return 30; }
        return c - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const progressValue = queue.totalInQueue - queue.position + 1;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary-light)] mb-4">
            <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
            <span className="text-sm font-semibold text-[var(--primary)]">Live Queue Status</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Stryde Health</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Patient Queue Tracker</p>
        </div>

        {/* Main card */}
        <div
          className={cn(
            'glass-elevated rounded-[var(--radius-lg)] overflow-hidden',
            isNext && 'you-are-next ring-2 ring-[var(--primary)] ring-offset-2'
          )}
        >
          {/* You are next banner */}
          {(isNext || isCalled) && (
            <div className="bg-[var(--primary)] text-white px-6 py-3 flex items-center justify-center gap-2 animate-fade-in">
              <Bell className="w-4 h-4" />
              <span className="text-sm font-bold tracking-wide">
                {isCalled ? 'Please proceed to the doctor room!' : 'You are next!'}
              </span>
            </div>
          )}

          <div className="p-8">
            {/* Token number */}
            <div className="text-center mb-6">
              <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">Token Number</p>
              <div className="inline-flex items-center justify-center">
                <div
                  className="w-28 h-28 rounded-2xl flex items-center justify-center shadow-xl queue-next-pulse"
                  style={{
                    background: `linear-gradient(135deg, var(--primary), var(--accent))`,
                  }}
                >
                  <span className="text-4xl font-black text-white">{String(queue.tokenNumber).padStart(3, '0')}</span>
                </div>
              </div>
            </div>

            {/* Patient info */}
            <div className="glass-card-static rounded-[var(--radius-sm)] p-4 mb-6 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">Patient</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{queue.patientName}</p>
                </div>
                <span className="ml-auto text-xs text-[var(--text-tertiary)]">{queue.mrNumber}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)]">Doctor</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{queue.doctorName}</p>
                </div>
                <span className="ml-auto text-xs text-[var(--text-tertiary)]">{queue.department}</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="glass-card-static rounded-[var(--radius-sm)] p-3 text-center">
                <p className="text-2xl font-black text-[var(--primary)]">{queue.position}</p>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Position</p>
              </div>
              <div className="glass-card-static rounded-[var(--radius-sm)] p-3 text-center">
                <p className="text-2xl font-black" style={{ color: queue.estimatedWaitMinutes === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                  {queue.estimatedWaitMinutes === 0 ? '—' : queue.estimatedWaitMinutes}
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                  {queue.estimatedWaitMinutes === 0 ? 'Your turn!' : 'Min wait'}
                </p>
              </div>
              <div className="glass-card-static rounded-[var(--radius-sm)] p-3 text-center">
                <p className="text-2xl font-black text-[var(--text-primary)]">{queue.totalInQueue}</p>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">In queue</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] mb-2">
                <span>Queue Progress</span>
                <span>{progressValue} of {queue.totalInQueue} processed</span>
              </div>
              <div className="h-3 rounded-full bg-[var(--surface)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${(progressValue / queue.totalInQueue) * 100}%`,
                    background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                    boxShadow: '0 0 8px var(--primary-glow)',
                  }}
                />
              </div>
              {/* Patients ahead markers */}
              <div className="flex items-center gap-1 mt-2 overflow-hidden">
                {Array.from({ length: Math.min(queue.totalInQueue, 12) }, (_, i) => {
                  const pos = i + 1;
                  const isDone = pos < queue.position;
                  const isCurrent = pos === queue.position;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 h-1.5 rounded-full transition-all duration-500',
                        isDone && 'bg-[var(--primary)]',
                        isCurrent && 'bg-[var(--accent)]',
                        !isDone && !isCurrent && 'bg-[var(--surface-border)]'
                      )}
                    />
                  );
                })}
                {queue.totalInQueue > 12 && (
                  <span className="text-[10px] text-[var(--text-tertiary)] ml-1">+{queue.totalInQueue - 12}</span>
                )}
              </div>
            </div>

            {/* Patients ahead */}
            {queue.position > 1 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Patients Ahead</p>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(queue.position - 1, 5) }, (_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: `hsl(${200 + i * 30}, 70%, 50%)` }}
                    >
                      {i + 1}
                    </div>
                  ))}
                  {queue.position - 1 > 5 && (
                    <div className="w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center text-xs font-semibold text-[var(--text-tertiary)]">
                      +{queue.position - 1 - 5}
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-[var(--primary)]"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                  >
                    {queue.position}
                  </div>
                  <span className="text-xs text-[var(--primary)] font-semibold">You</span>
                </div>
              </div>
            )}

            {/* Refresh info */}
            <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Last updated: {lastRefresh.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
              <button
                onClick={refresh}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors border border-[var(--surface-border)]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh ({countdown}s)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[var(--text-tertiary)] mt-6">
          This page auto-refreshes every 30 seconds &middot; Please remain in the waiting area
        </p>
      </div>
    </div>
  );
}
