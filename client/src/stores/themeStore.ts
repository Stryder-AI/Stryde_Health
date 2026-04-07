import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  colorBlindMode: boolean;
  toggle: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleColorBlindMode: () => void;
}

function applyColorBlind(enabled: boolean) {
  if (enabled) {
    document.documentElement.setAttribute('data-colorblind', 'true');
  } else {
    document.documentElement.removeAttribute('data-colorblind');
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      colorBlindMode: false,
      toggle: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        set({ theme: next });
      },
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
      toggleColorBlindMode: () => {
        const next = !get().colorBlindMode;
        applyColorBlind(next);
        set({ colorBlindMode: next });
      },
    }),
    {
      name: 'stryde-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-theme', state.theme);
          applyColorBlind(state.colorBlindMode);
        }
      },
    }
  )
);
