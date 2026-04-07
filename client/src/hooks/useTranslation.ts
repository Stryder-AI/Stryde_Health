import { useLanguageStore } from '@/stores/languageStore';
import { t } from '@/lib/i18n';

export function useTranslation() {
  const { language } = useLanguageStore();
  return {
    t: (key: string) => t(key, language),
    language,
  };
}
