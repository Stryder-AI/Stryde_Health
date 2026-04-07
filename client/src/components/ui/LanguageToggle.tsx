import { useLanguageStore } from '@/stores/languageStore';
import { cn } from '@/lib/utils';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguageStore();

  return (
    <div
      className="flex items-center rounded-[var(--radius-sm)] border border-[var(--surface-border)] overflow-hidden bg-[var(--surface)] shrink-0"
      role="group"
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={cn(
          'px-2.5 py-1.5 text-[11px] font-semibold tracking-wide transition-all duration-200',
          language === 'en'
            ? 'bg-[var(--primary)] text-white shadow-sm'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
        )}
      >
        EN
      </button>
      <div className="w-px h-5 bg-[var(--surface-border)]" aria-hidden="true" />
      <button
        type="button"
        onClick={() => setLanguage('ur')}
        aria-pressed={language === 'ur'}
        className={cn(
          'px-2.5 py-1.5 text-[11px] font-semibold tracking-wide transition-all duration-200',
          language === 'ur'
            ? 'bg-[var(--primary)] text-white shadow-sm'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
        )}
        style={{ fontFamily: language === 'ur' ? "'Noto Nastaliq Urdu', serif" : undefined }}
      >
        اردو
      </button>
    </div>
  );
}
