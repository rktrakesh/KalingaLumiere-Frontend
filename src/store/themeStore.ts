import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState { isDark: boolean; toggle: () => void; setDark: (v: boolean) => void; }

export const useThemeStore = create<ThemeState>()(persist(
  (set, get) => ({
    isDark: false,
    toggle:  () => { const n = !get().isDark; set({ isDark: n }); document.documentElement.classList.toggle('dark', n); },
    setDark: (v) => { set({ isDark: v }); document.documentElement.classList.toggle('dark', v); },
  }),
  { name: 'kalinga-theme' }
));
