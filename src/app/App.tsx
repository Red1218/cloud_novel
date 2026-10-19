import { ErrorBoundary } from '@/components/common/ErrorBoundary/ErrorBoundary';
import { ToastProvider } from '@/contexts/ToastContext';
import { useNativeApp } from '@/hooks/useNativeApp';
import { AppRouter } from './router';

/**
 * Application root.
 *
 * Wraps the entire app in ErrorBoundary so any unexpected rendering
 * error is caught and shows a friendly fallback instead of a blank screen.
 * Also provides the ToastContext for global notifications, and the Android
 * status bar and back button handling when running as the native app.
 */
export function App() {
  useNativeApp();

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
