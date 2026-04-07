import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useAuthStore } from '@/stores/authStore';

// ── Step Definitions ─────────────────────────────────────────────────────────

interface TourStep {
  targetId: string;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: Record<string, TourStep[]> = {
  doctor: [
    {
      targetId: 'tour-sidebar',
      title: 'Your Portal Navigation',
      description: 'Everything you need is here — queue, patients, prescriptions, and more. It collapses to save screen space.',
      placement: 'right',
    },
    {
      targetId: 'tour-opd-queue',
      title: 'Start Here Each Morning',
      description: 'Your patient queue updates in real-time. Urgent cases are highlighted automatically.',
      placement: 'right',
    },
    {
      targetId: 'tour-consultation',
      title: 'Full Consultation Sheet',
      description: 'Vitals, prescriptions, lab orders, and follow-up scheduling — all in one sheet.',
      placement: 'bottom',
    },
    {
      targetId: 'tour-patient-records',
      title: 'Complete Patient History',
      description: 'Every visit, prescription, and lab result for each patient, all in one place.',
      placement: 'right',
    },
    {
      targetId: 'tour-dashboard-header',
      title: 'Dashboard & Reminders',
      description: 'Follow-up reminders keep you on top of patient care. Check here each morning.',
      placement: 'bottom',
    },
  ],
  receptionist: [
    {
      targetId: 'tour-sidebar',
      title: 'Register Walk-in Patients',
      description: 'Register walk-ins in under 30 seconds with Quick Mode — minimal fields required.',
      placement: 'right',
    },
    {
      targetId: 'tour-token-print',
      title: 'Token Printing',
      description: 'Instantly print receipt-size tokens for patients after registration.',
      placement: 'bottom',
    },
    {
      targetId: 'tour-appointments',
      title: 'Appointment Schedule',
      description: 'View and manage today\'s full schedule. Click any slot to book a new appointment.',
      placement: 'bottom',
    },
    {
      targetId: 'tour-billing',
      title: 'Billing & Payments',
      description: 'Process payments, apply discounts, and print professional receipts.',
      placement: 'bottom',
    },
  ],
  lab_technician: [
    {
      targetId: 'tour-sidebar',
      title: 'Pending Lab Orders',
      description: 'Lab orders from doctors arrive here automatically. Urgent orders are highlighted.',
      placement: 'right',
    },
    {
      targetId: 'tour-result-entry',
      title: 'Result Entry',
      description: 'Auto-flags abnormal values as you type. Critical values trigger immediate alerts.',
      placement: 'bottom',
    },
    {
      targetId: 'tour-batch-entry',
      title: 'Batch Entry',
      description: 'Enter multiple test results simultaneously to speed up high-volume workflows.',
      placement: 'bottom',
    },
  ],
  pharmacist: [
    {
      targetId: 'tour-sidebar',
      title: 'Point-of-Sale System',
      description: 'Full POS with barcode scanning, medicine search, and receipt printing.',
      placement: 'right',
    },
    {
      targetId: 'tour-verify-rx',
      title: 'Verify Prescriptions',
      description: 'Verify doctor prescriptions before dispensing. Flags drug interactions automatically.',
      placement: 'bottom',
    },
    {
      targetId: 'tour-stock-alerts',
      title: 'Stock Alerts',
      description: 'Monitor stock levels with automatic low-stock and expiry alerts.',
      placement: 'bottom',
    },
  ],
};

// ── Overlay + Tooltip Positioning ────────────────────────────────────────────

function getTargetRect(targetId: string): DOMRect | null {
  const el = document.getElementById(targetId);
  if (!el) return null;
  return el.getBoundingClientRect();
}

interface TooltipPosition {
  top: number;
  left: number;
  arrowSide: 'top' | 'bottom' | 'left' | 'right';
}

function computeTooltipPosition(
  rect: DOMRect,
  placement: TourStep['placement'],
  tooltipW = 320,
  tooltipH = 180
): TooltipPosition {
  const gap = 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let top = 0;
  let left = 0;
  let arrowSide: TooltipPosition['arrowSide'] = 'top';

  switch (placement) {
    case 'right':
      top = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.right + gap;
      arrowSide = 'left';
      break;
    case 'left':
      top = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.left - tooltipW - gap;
      arrowSide = 'right';
      break;
    case 'top':
      top = rect.top - tooltipH - gap;
      left = rect.left + rect.width / 2 - tooltipW / 2;
      arrowSide = 'bottom';
      break;
    case 'bottom':
    default:
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - tooltipW / 2;
      arrowSide = 'top';
  }

  // Clamp within viewport
  top = Math.max(12, Math.min(top, vh - tooltipH - 12));
  left = Math.max(12, Math.min(left, vw - tooltipW - 12));

  return { top, left, arrowSide };
}

// ── Main Component ────────────────────────────────────────────────────────────

export function OnboardingTour() {
  const { user } = useAuthStore();
  const { hasSeenTour, currentStep, isTourActive, markSeen, setStep, startTour, endTour } =
    useOnboardingStore();

  const role = user?.role ?? '';
  const steps = TOUR_STEPS[role] ?? [];
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Auto-start on first login
  useEffect(() => {
    if (role && steps.length > 0 && !hasSeenTour[role]) {
      // Small delay to let the layout render
      const t = setTimeout(() => startTour(), 800);
      return () => clearTimeout(t);
    }
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateTargetRect = useCallback(() => {
    if (!isTourActive || steps.length === 0) return;
    const step = steps[currentStep];
    if (!step) return;
    const rect = getTargetRect(step.targetId);
    setTargetRect(rect);
    setVisible(true);
  }, [isTourActive, currentStep, steps]);

  useEffect(() => {
    if (!isTourActive) { setVisible(false); return; }
    setVisible(false);
    const t = setTimeout(updateTargetRect, 100);
    return () => clearTimeout(t);
  }, [isTourActive, currentStep, updateTargetRect]);

  useEffect(() => {
    if (!isTourActive) return;
    window.addEventListener('resize', updateTargetRect);
    return () => window.removeEventListener('resize', updateTargetRect);
  }, [isTourActive, updateTargetRect]);

  if (!isTourActive || steps.length === 0) return null;

  const step = steps[currentStep];
  if (!step) return null;

  const placement = step.placement ?? 'bottom';
  const tooltipPos = targetRect
    ? computeTooltipPosition(targetRect, placement)
    : { top: window.innerHeight / 2 - 90, left: window.innerWidth / 2 - 160, arrowSide: 'top' as const };

  const handleSkip = () => {
    endTour();
    if (dontShowAgain || role) markSeen(role);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setStep(currentStep + 1);
    } else {
      // Last step
      markSeen(role);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setStep(currentStep - 1);
  };

  return createPortal(
    <div className={cn('fixed inset-0 z-[8500]', visible ? 'opacity-100' : 'opacity-0 pointer-events-none')}
      style={{ transition: 'opacity 0.3s ease' }}>

      {/* Dark overlay with cutout for target */}
      {targetRect ? (
        <>
          {/* Top */}
          <div
            className="absolute bg-black/50 backdrop-blur-[1px]"
            style={{ top: 0, left: 0, right: 0, height: targetRect.top - 6 }}
          />
          {/* Bottom */}
          <div
            className="absolute bg-black/50 backdrop-blur-[1px]"
            style={{ top: targetRect.bottom + 6, left: 0, right: 0, bottom: 0 }}
          />
          {/* Left */}
          <div
            className="absolute bg-black/50 backdrop-blur-[1px]"
            style={{
              top: targetRect.top - 6,
              left: 0,
              width: targetRect.left - 6,
              height: targetRect.height + 12,
            }}
          />
          {/* Right */}
          <div
            className="absolute bg-black/50 backdrop-blur-[1px]"
            style={{
              top: targetRect.top - 6,
              left: targetRect.right + 6,
              right: 0,
              height: targetRect.height + 12,
            }}
          />
          {/* Highlight ring around target */}
          <div
            className="absolute rounded-[var(--radius-sm)] pointer-events-none"
            style={{
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
              boxShadow: '0 0 0 3px var(--primary), 0 0 0 6px rgba(13,148,136,0.3)',
              animation: 'tour-ring-pulse 2s ease-in-out infinite',
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className="absolute glass-elevated shadow-xl animate-fade-in-scale"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: 320,
          zIndex: 8600,
        }}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-[var(--surface-border)]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              {currentStep + 1}
            </span>
            <span className="text-xs text-[var(--text-tertiary)] font-medium">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors px-2 py-0.5 rounded hover:bg-[var(--surface)]"
          >
            Skip tour
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          {/* Step dots */}
          <div className="flex gap-1.5 mb-3">
            {steps.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === currentStep
                    ? 'w-5 bg-[var(--primary)]'
                    : i < currentStep
                    ? 'w-1.5 bg-[var(--primary)] opacity-50'
                    : 'w-1.5 bg-[var(--surface-border)]'
                )}
              />
            ))}
          </div>

          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1.5">{step.title}</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.description}</p>

          {/* "Don't show again" on last step */}
          {currentStep === steps.length - 1 && (
            <label className="flex items-center gap-2 mt-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--primary)]"
              />
              <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                Don't show again
              </span>
            </label>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--surface-border)]">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={cn(
              'text-sm font-medium px-3 py-1.5 rounded-[var(--radius-xs)] transition-all',
              currentStep === 0
                ? 'opacity-0 pointer-events-none'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
            )}
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            className="text-sm font-semibold px-4 py-1.5 rounded-[var(--radius-xs)] bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-all active:scale-95"
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next →'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes tour-ring-pulse {
          0%, 100% { box-shadow: 0 0 0 3px var(--primary), 0 0 0 6px rgba(13,148,136,0.3); }
          50% { box-shadow: 0 0 0 3px var(--primary), 0 0 0 10px rgba(13,148,136,0.15); }
        }
      `}</style>
    </div>,
    document.body
  );
}
