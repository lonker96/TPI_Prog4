import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  darkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (value: boolean) => void;
}

function applyThemeClass(darkMode: boolean) {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', darkMode);
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      toggleTheme: () => {
        const next = !get().darkMode;
        applyThemeClass(next);
        set({ darkMode: next });
      },
      setDarkMode: (value: boolean) => {
        applyThemeClass(value);
        set({ darkMode: value });
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeClass(state.darkMode);
        }
      },
    }
  )
);