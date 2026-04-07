import { useEffect } from 'react';
import { AppRouter } from './Router';
import { ToastContainer } from '@/components/ui/Toast';
import { useThemeStore } from '@/stores/themeStore';

export function App() {
  const { theme } = useThemeStore();

  // Ensure theme attribute is set on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      <AppRouter />
      <ToastContainer />
    </>
  );
}
