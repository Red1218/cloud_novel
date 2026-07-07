import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback UI. If omitted, the default error card is shown. */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches unexpected React rendering errors and displays a friendly
 * fallback UI instead of a blank/crashed screen.
 *
 * Note: Error boundaries must be class components per React's design.
 * All other components in this project are functional.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo): void {
    // Log for observability; replace with a real logger in production.
    console.error('[ErrorBoundary] Uncaught rendering error:', error);
  }

  private handleReset(): void {
    this.setState({ hasError: false, error: null });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary" role="alert" aria-live="assertive">
          <div className="error-boundary__card">
            <div className="error-boundary__icon" aria-hidden="true">
              &#9888;
            </div>
            <h1 className="error-boundary__title">Something went wrong</h1>
            <p className="error-boundary__message">
              An unexpected error occurred. Please try refreshing or click
              below to retry.
            </p>
            {this.state.error && (
              <pre className="error-boundary__detail">
                {this.state.error.message}
              </pre>
            )}
            <button
              id="error-boundary-retry-btn"
              className="error-boundary__btn"
              onClick={() => this.handleReset()}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
