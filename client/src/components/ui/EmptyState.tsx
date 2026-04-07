import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type EmptyStateType =
  | 'no-data'
  | 'no-results'
  | 'no-patients'
  | 'no-orders'
  | 'no-prescriptions'
  | 'no-products'
  | 'no-messages';

type EmptyStateSize = 'sm' | 'md' | 'lg';

interface EmptyStateProps {
  type: EmptyStateType;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  size?: EmptyStateSize;
}

// ── Animated SVG Illustrations ────────────────────────────────────────────────

function EmptyIllustration({ type, size }: { type: EmptyStateType; size: EmptyStateSize }) {
  const dims = { sm: 100, md: 160, lg: 200 };
  const w = dims[size];
  const h = Math.round(w * 0.875);

  const primary = 'var(--primary)';
  const accent = 'var(--accent)';
  const primaryLight = 'var(--primary-light)';
  const surfaceBorder = 'var(--surface-border)';
  const id = `es-${type}`; // gradient id prefix

  // Shared keyframes injected once
  const keyframes = `
    @keyframes es-breathe { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-4px) scale(1.03)} }
    @keyframes es-bubble { 0%{transform:translateY(0);opacity:0.8} 100%{transform:translateY(-18px);opacity:0} }
    @keyframes es-spin { to{transform:rotate(360deg)} }
    @keyframes es-sway { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} }
    @keyframes es-grow { 0%{transform:scaleY(0);transform-origin:bottom} 100%{transform:scaleY(1);transform-origin:bottom} }
    @keyframes es-lid { 0%,70%,100%{transform:translateY(0)} 40%{transform:translateY(-6px) rotate(-5deg)} }
    @keyframes es-envelope { 0%,70%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
  `;

  switch (type) {

    // ── No Patients: breathing person silhouette ──────────────────────────────
    case 'no-patients':
      return (
        <svg width={w} height={h} viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <style>{keyframes}</style>
          <defs>
            <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primary} stopOpacity="0.18" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {/* Dotted grid background */}
          <pattern id={`${id}-dots`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill={primary} fillOpacity="0.06" />
          </pattern>
          <rect x="20" y="10" width="120" height="115" rx="8" fill={`url(#${id}-dots)`} />

          <ellipse cx="80" cy="127" rx="52" ry="6" fill={surfaceBorder} />

          {/* Breathing person */}
          <g style={{ animation: 'es-breathe 3s ease-in-out infinite' }}>
            {/* Body */}
            <path d="M58 75 C58 62 102 62 102 75 L102 98 C102 103 97 107 92 107 L68 107 C63 107 58 103 58 98 Z"
              fill={`url(#${id}-grad)`} stroke={primary} strokeWidth="1.5" strokeOpacity="0.35" />
            {/* Head */}
            <circle cx="80" cy="50" r="20" fill={`url(#${id}-grad)`} stroke={primary} strokeWidth="1.5" strokeOpacity="0.35" />
            <circle cx="80" cy="46" r="9" fill={primary} fillOpacity="0.12" />
            {/* Cross / plus medical icon */}
            <rect x="76" y="79" width="8" height="2.5" rx="1.25" fill={primary} fillOpacity="0.3" />
            <rect x="78.75" y="76.5" width="2.5" height="8" rx="1.25" fill={primary} fillOpacity="0.3" />
          </g>

          {/* Accent add-person bubble */}
          <circle cx="113" cy="38" r="14" fill={accent} fillOpacity="0.1" stroke={accent} strokeWidth="1.2" strokeOpacity="0.25" />
          <line x1="108" y1="38" x2="118" y2="38" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
          <line x1="113" y1="33" x2="113" y2="43" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
        </svg>
      );

    // ── No Orders: flask with bubbles ────────────────────────────────────────
    case 'no-orders':
      return (
        <svg width={w} height={h} viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <style>{keyframes}</style>
          <defs>
            <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primary} stopOpacity="0.15" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <pattern id={`${id}-dots`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill={primary} fillOpacity="0.06" />
          </pattern>
          <rect x="20" y="10" width="120" height="115" rx="8" fill={`url(#${id}-dots)`} />
          <ellipse cx="80" cy="127" rx="52" ry="6" fill={surfaceBorder} />

          {/* Flask body */}
          <rect x="67" y="22" width="26" height="32" rx="4" fill={`url(#${id}-grad)`} stroke={primary} strokeWidth="1.5" strokeOpacity="0.3" />
          <path d="M60 100 L52 118 Q51 122 55 122 L105 122 Q109 122 108 118 L100 100 L60 100Z"
            fill={`url(#${id}-grad)`} stroke={primary} strokeWidth="1.5" strokeOpacity="0.3" />
          <path d="M60 100 L67 54 L93 54 L100 100Z"
            fill={`url(#${id}-grad)`} stroke={primary} strokeWidth="1.5" strokeOpacity="0.3" />
          {/* Liquid fill */}
          <path d="M64 108 Q80 104 96 108 L100 122 L60 122Z"
            fill={primary} fillOpacity="0.12" />

          {/* Animated bubbles */}
          {[68, 80, 92].map((cx, i) => (
            <circle
              key={cx}
              cx={cx} cy={112}
              r="3"
              fill={primary}
              fillOpacity="0.25"
              style={{
                animation: `es-bubble 1.8s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}

          {/* Atom/flask cap */}
          <rect x="62" y="22" width="36" height="6" rx="3" fill={primary} fillOpacity="0.15" stroke={primary} strokeWidth="1" strokeOpacity="0.2" />
        </svg>
      );

    // ── No Prescriptions: pill with rotation ────────────────────────────────
    case 'no-prescriptions':
      return (
        <svg width={w} height={h} viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <style>{keyframes}</style>
          <defs>
            <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primary} stopOpacity="0.15" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <pattern id={`${id}-dots`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill={primary} fillOpacity="0.06" />
          </pattern>
          <rect x="20" y="10" width="120" height="115" rx="8" fill={`url(#${id}-dots)`} />
          <ellipse cx="80" cy="127" rx="52" ry="6" fill={surfaceBorder} />

          {/* Prescription pad */}
          <rect x="42" y="24" width="64" height="82" rx="10" fill={`url(#${id}-grad)`} stroke={primary} strokeWidth="1.5" strokeOpacity="0.25" />
          <text x="50" y="48" fontFamily="Georgia, serif" fontSize="18" fill={primary} fillOpacity="0.3" fontWeight="bold">Rx</text>
          <rect x="50" y="56" width="42" height="2.5" rx="1.25" fill={primary} fillOpacity="0.15" />
          <rect x="50" y="65" width="30" height="2.5" rx="1.25" fill={primary} fillOpacity="0.12" />
          <rect x="50" y="74" width="38" height="2.5" rx="1.25" fill={primary} fillOpacity="0.1" />
          <rect x="50" y="83" width="24" height="2.5" rx="1.25" fill={primary} fillOpacity="0.08" />

          {/* Rotating pill */}
          <g style={{ transformOrigin: '115px 68px', animation: 'es-spin 4s linear infinite' }}>
            <ellipse cx="115" cy="68" rx="14" ry="8" rx2="14" fill="none" stroke={accent} strokeWidth="1.5" strokeOpacity="0.3" transform="rotate(-35, 115, 68)" />
            <ellipse cx="115" cy="68" rx="6.5" ry="8" fill={accent} fillOpacity="0.12" transform="rotate(-35, 115, 68)" clipPath="none" />
            <line x1="104.5" y1="72" x2="125.5" y2="64" stroke={accent} strokeWidth="1" strokeOpacity="0.25" />
          </g>
        </svg>
      );

    // ── No Results: swaying magnifying glass ────────────────────────────────
    case 'no-results':
      return (
        <svg width={w} height={h} viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <style>{keyframes}</style>
          <defs>
            <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.15" />
              <stop offset="100%" stopColor={primary} stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <pattern id={`${id}-dots`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill={primary} fillOpacity="0.06" />
          </pattern>
          <rect x="20" y="10" width="120" height="115" rx="8" fill={`url(#${id}-dots)`} />
          <ellipse cx="80" cy="127" rx="52" ry="6" fill={surfaceBorder} />

          {/* Swaying magnifying glass */}
          <g style={{ transformOrigin: '72px 72px', animation: 'es-sway 2.5s ease-in-out infinite' }}>
            <circle cx="68" cy="65" r="28" fill={`url(#${id}-grad)`} stroke={primary} strokeWidth="2" strokeOpacity="0.3" />
            <circle cx="68" cy="65" r="18" fill="none" stroke={primary} strokeWidth="1.5" strokeOpacity="0.2" />
            <circle cx="68" cy="65" r="8" fill={accent} fillOpacity="0.08" />
            {/* X mark inside */}
            <line x1="63" y1="61" x2="73" y2="69" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
            <line x1="73" y1="61" x2="63" y2="69" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
            {/* Handle */}
            <line x1="87" y1="84" x2="108" y2="106" stroke={primary} strokeWidth="3.5" strokeLinecap="round" strokeOpacity="0.3" />
          </g>
        </svg>
      );

    // ── No Data: bar chart bars growing from 0 ────────────────────────────
    case 'no-data':
      return (
        <svg width={w} height={h} viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <style>{keyframes}</style>
          <defs>
            <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primary} stopOpacity="0.15" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id={`${id}-bar1`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={primary} stopOpacity="0.5" />
              <stop offset="100%" stopColor={primary} stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id={`${id}-bar2`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.4" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <pattern id={`${id}-dots`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill={primary} fillOpacity="0.06" />
          </pattern>
          <rect x="20" y="10" width="120" height="115" rx="8" fill={`url(#${id}-dots)`} />
          <ellipse cx="80" cy="127" rx="52" ry="6" fill={surfaceBorder} />

          {/* Chart baseline */}
          <line x1="38" y1="108" x2="122" y2="108" stroke={primary} strokeOpacity="0.2" strokeWidth="1.5" />

          {/* Growing bars */}
          {[
            { x: 44, h: 50, w: 18, delay: 0, grad: `url(#${id}-bar1)` },
            { x: 70, h: 32, w: 18, delay: 0.1, grad: `url(#${id}-bar2)` },
            { x: 96, h: 64, w: 18, delay: 0.2, grad: `url(#${id}-bar1)` },
          ].map((bar) => (
            <rect
              key={bar.x}
              x={bar.x}
              y={108 - bar.h}
              width={bar.w}
              height={bar.h}
              rx="3"
              fill={bar.grad}
              stroke={primary}
              strokeOpacity="0.15"
              strokeWidth="1"
              style={{
                transformOrigin: `${bar.x + bar.w / 2}px 108px`,
                animation: `es-grow 0.8s cubic-bezier(0.34,1.56,0.64,1) both`,
                animationDelay: `${bar.delay}s`,
              }}
            />
          ))}

          {/* Small trend arrow */}
          <path d="M44 72 L70 84 L96 56" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" strokeDasharray="4 2" />
        </svg>
      );

    // ── No Products: box with animated lid ────────────────────────────────
    case 'no-products':
      return (
        <svg width={w} height={h} viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <style>{keyframes}</style>
          <defs>
            <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.14" />
              <stop offset="100%" stopColor={primary} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <pattern id={`${id}-dots`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill={primary} fillOpacity="0.06" />
          </pattern>
          <rect x="20" y="10" width="120" height="115" rx="8" fill={`url(#${id}-dots)`} />
          <ellipse cx="80" cy="127" rx="52" ry="6" fill={surfaceBorder} />

          {/* Box body */}
          <rect x="40" y="68" width="80" height="52" rx="8" fill={`url(#${id}-grad)`} stroke={primary} strokeWidth="1.5" strokeOpacity="0.3" />
          {/* Box center stripe */}
          <line x1="80" y1="68" x2="80" y2="120" stroke={primary} strokeOpacity="0.1" strokeWidth="1" />

          {/* Animated lid */}
          <g style={{ transformOrigin: '80px 68px', animation: 'es-lid 2.4s ease-in-out infinite' }}>
            <path d="M36 68 L124 68 L112 52 L48 52 Z" fill={`url(#${id}-grad)`} stroke={primary} strokeWidth="1.5" strokeOpacity="0.3" />
            {/* Lid flaps */}
            <path d="M80 52 L80 68" stroke={primary} strokeWidth="1" strokeOpacity="0.2" />
          </g>

          {/* Question mark inside */}
          <text x="72" y="100" fontSize="18" fill={primary} fillOpacity="0.15" fontFamily="system-ui" fontWeight="bold">?</text>
        </svg>
      );

    // ── No Messages: animated envelope ────────────────────────────────────
    case 'no-messages':
      return (
        <svg width={w} height={h} viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <style>{keyframes}</style>
          <defs>
            <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primary} stopOpacity="0.14" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <pattern id={`${id}-dots`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill={primary} fillOpacity="0.06" />
          </pattern>
          <rect x="20" y="10" width="120" height="115" rx="8" fill={`url(#${id}-dots)`} />
          <ellipse cx="80" cy="127" rx="52" ry="6" fill={surfaceBorder} />

          {/* Envelope body with floating */}
          <g style={{ animation: 'es-envelope 3s ease-in-out infinite' }}>
            {/* Body */}
            <rect x="28" y="48" width="92" height="64" rx="10" fill={`url(#${id}-grad)`} stroke={primary} strokeWidth="1.5" strokeOpacity="0.3" />
            {/* Flap */}
            <path d="M28 58 L74 84 L120 58" fill="none" stroke={primary} strokeWidth="1.5" strokeOpacity="0.25" />
            {/* Bottom fold */}
            <path d="M28 112 L52 88 L108 88 L120 112" fill="none" stroke={primary} strokeWidth="1" strokeOpacity="0.15" />
            {/* Letter lines */}
            <rect x="46" y="64" width="36" height="2.5" rx="1.25" fill={primary} fillOpacity="0.15" />
            <rect x="46" y="72" width="26" height="2.5" rx="1.25" fill={primary} fillOpacity="0.12" />
            {/* Chat tail */}
            <path d="M44 112 L38 124 L58 112" fill={`url(#${id}-grad)`} stroke={primary} strokeWidth="1.5" strokeOpacity="0.3" />
          </g>

          {/* Notification dot */}
          <circle cx="122" cy="44" r="10" fill={accent} fillOpacity="0.15" stroke={accent} strokeWidth="1.2" strokeOpacity="0.3" />
          <circle cx="122" cy="44" r="4" fill={accent} fillOpacity="0.3" />
        </svg>
      );

    default:
      return null;
  }
}

// ── Main Component ────────────────────────────────────────────────────────────

export function EmptyState({
  type,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const paddingMap = { sm: 'py-10 px-6', md: 'py-16 px-8', lg: 'py-20 px-10' };
  const titleMap = { sm: 'text-base', md: 'text-lg', lg: 'text-xl' };
  const descMap = { sm: 'text-xs', md: 'text-sm', lg: 'text-sm' };

  return (
    <div
      className={cn(
        'glass-card-static flex flex-col items-center justify-center text-center animate-fade-in',
        paddingMap[size],
        className
      )}
    >
      <div className={cn('mb-6', size === 'sm' && 'mb-4')}>
        <EmptyIllustration type={type} size={size} />
      </div>
      <h3 className={cn('font-semibold text-[var(--text-primary)] mb-2', titleMap[size])}>
        {title}
      </h3>
      {description && (
        <p className={cn('text-[var(--text-secondary)] max-w-sm mb-6', descMap[size])}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
