import { useEffect } from 'react';
import { AppRouter } from './Router';
import { ToastContainer } from '@/components/ui/Toast';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';

export function App() {
  const { theme } = useThemeStore();

  // Ensure theme attribute is set on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Revalidate auth session on app mount (checks token with backend)
  useEffect(() => {
    useAuthStore.getState().fetchMe();
  }, []);

  return (
    <>
      <AppRouter />
      <ToastContainer />
    </>
  );
}
