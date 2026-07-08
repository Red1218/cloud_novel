import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import './ErrorState.css';

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  const navigate = useNavigate();

  return (
    <div className="reader-error">
      <div className="reader-error__icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h2 className="reader-error__title">Failed to load book</h2>
      <p className="reader-error__message">{message}</p>
      <button 
        type="button" 
        className="reader-error__action"
        onClick={() => navigate(ROUTES.LIBRARY)}
      >
        Return to Library
      </button>
    </div>
  );
}
