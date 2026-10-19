import { ErrorBoundary } from '@/components/common/ErrorBoundary/ErrorBoundary';
import { ToastProvider } from '@/contexts/ToastContext';
import { AppRouter } from './router';

/**
 * Application root.
 *
 * Wraps the entire app in ErrorBoundary so any unexpected rendering
 * error is caught and shows a friendly fallback instead of a blank screen.
 * Also provides the ToastContext for global notifications.
 */
export function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
