import { ErrorBoundary } from '@/components/common';
import { AppRouter } from './router';

/**
 * Application root.
 *
 * Wraps the entire app in ErrorBoundary so any unexpected rendering
 * error is caught and shows a friendly fallback instead of a blank screen.
 */
export function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;
