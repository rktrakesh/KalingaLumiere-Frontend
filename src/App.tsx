import { useEffect } from 'react';
import { AppRouter } from '@/routes/AppRouter';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api/auth.api';

export default function App() {
  const { isDark } = useThemeStore();
  const { isAuthenticated, setUser } = useAuthStore();
  useEffect(() => { document.documentElement.classList.toggle('dark', isDark); }, [isDark]);
  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    authApi.getProfile().then((response) => {
      if (active) setUser(response.data.data);
    }).catch(() => {
      // Authentication failures are handled by the shared refresh/logout interceptor.
    });
    return () => { active = false; };
  }, [isAuthenticated, setUser]);
  return <AppRouter />;
}
