import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Calendar, ExternalLink, Stethoscope } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

// ── Types ─────────────────────────────────────────────────────

export interface PatientPreview {
  id: string;
  mr: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  bloodGroup: string;
  conditions: string[];
  allergies: string[];
  lastVisit?: string;
}

interface PatientHoverCardProps {
  patient: PatientPreview;
  children: React.ReactNode;
  onOpenRecord?: () => void;
  onStartConsult?: () => void;
}

// ── Component ─────────────────────────────────────────────────

export default function PatientHoverCard({
  patient,
  children,
  onOpenRecord,
  onStartConsult,
}: PatientHoverCardProps) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, showAbove: false });
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const clearTimers = () => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  const handleMouseEnter = useCallback(() => {
    clearTimers();
    showTimer.current = setTimeout(() => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const cardHeight = 280;
      const cardWidth = 320;
      const spaceBelow = window.innerHeight - rect.bottom;
      const showAbove = spaceBelow < cardHeight + 16 && rect.top > cardHeight + 16;

      let left = rect.left;
      if (left + cardWidth > window.innerWidth - 16) {
        left = window.innerWidth - cardWidth - 16;
      }
      if (left < 8) left = 8;

      setCoords({
        top: showAbove ? rect.top - cardHeight - 8 : rect.bottom + 8,
        left,
        showAbove,
      });
      setVisible(true);
    }, 400);
  }, []);

  const handleMouseLeave = useCallback(() => {
    clearTimers();
    hideTimer.current = setTimeout(() => {
      setVisible(false);
    }, 200);
  }, []);

  const handleCardMouseEnter = useCallback(() => {
    clearTimers();
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    clearTimers();
    hideTimer.current = setTimeout(() => {
      setVisible(false);
    }, 200);
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const initials = patient.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const card = visible
    ? createPortal(
        <div
          ref={cardRef}
          className="fixed z-[99999] w-80 glass-elevated rounded-[var(--radius)] border border-[var(--surface-border)] shadow-2xl animate-fade-in-scale overflow-hidden"
          style={{ top: coords.top, left: coords.left }}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-[var(--surface-border)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-teal-400 flex items-center justify-center text-white font-bold text-base shadow-md shadow-[var(--primary-glow)] shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] truncate">{patient.name}</p>
                <p className="text-xs text-[var(--text-tertiary)] font-mono">{patient.mr}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {patient.age} yrs · {patient.gender === 'M' ? 'Male' : 'Female'}
                  </span>
                  <span className="text-xs font-bold text-red-500">{patient.bloodGroup}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 py-3 space-y-3">
            {/* Conditions */}
            {patient.conditions.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1.5">Conditions</p>
                <div className="flex flex-wrap gap-1">
                  {patient.conditions.slice(0, 3).map((c) => (
                    <Badge key={c} variant="info" className="text-[10px]">{c}</Badge>
                  ))}
                  {patient.conditions.length > 3 && (
                    <Badge variant="default" className="text-[10px]">+{patient.conditions.length - 3} more</Badge>
                  )}
                </div>
              </div>
            )}

            {/* Allergies */}
            {patient.allergies.length > 0 && (
              <div className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Allergies: </span>
                  <span className="text-xs text-red-500">{patient.allergies.join(', ')}</span>
                </div>
              </div>
            )}

            {/* Last visit */}
            {patient.lastVisit && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                <span className="text-xs text-[var(--text-secondary)]">Last visit: {patient.lastVisit}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 pb-4 flex items-center gap-2">
            <button
              onClick={() => {
                setVisible(false);
                if (onOpenRecord) {
                  onOpenRecord();
                } else {
                  navigate('/doctor/patients');
                }
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--radius-sm)] text-xs font-semibold bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--surface-border)] transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Record
            </button>
            <button
              onClick={() => {
                setVisible(false);
                if (onStartConsult) {
                  onStartConsult();
                } else {
                  navigate('/doctor/opd');
                }
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[var(--radius-sm)] text-xs font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-dark,var(--primary))] shadow-sm shadow-[var(--primary-glow)] transition-all"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Start Consult
            </button>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </span>
      {card}
    </>
  );
}
