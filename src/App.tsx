import { useEffect } from 'react';
import { AppRouter } from '@/routes/AppRouter';
import { useThemeStore } from '@/store/themeStore';

export default function App() {
  const { isDark } = useThemeStore();
  useEffect(() => { document.documentElement.classList.toggle('dark', isDark); }, [isDark]);
  return <AppRouter />;
}
