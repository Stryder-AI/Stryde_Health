import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '@/lib/i18n';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => {
        document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
        if (lang === 'ur') {
          document.documentElement.classList.add('font-urdu');
        } else {
          document.documentElement.classList.remove('font-urdu');
        }
        set({ language: lang });
      },
    }),
    {
      name: 'stryde-language',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.dir = state.language === 'ur' ? 'rtl' : 'ltr';
          document.documentElement.lang = state.language;
          if (state.language === 'ur') {
            document.documentElement.classList.add('font-urdu');
          } else {
            document.documentElement.classList.remove('font-urdu');
          }
        }
      },
    }
  )
);
