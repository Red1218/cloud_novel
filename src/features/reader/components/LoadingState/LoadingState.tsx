import './LoadingState.css';

export function LoadingState() {
  return (
    <div className="reader-loading">
      <div className="reader-loading__spinner" aria-hidden="true" />
      <p className="reader-loading__text">Loading document...</p>
    </div>
  );
}
