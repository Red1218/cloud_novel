import type { KeyboardEvent, RefObject } from 'react';
import type { SearchStatus } from '../../hooks/useReaderSearch';
import './SearchBar.css';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  status: SearchStatus;
  progress: { done: number; total: number };
  matchCount: number;
  /** True when there are more matches than were returned. */
  truncated: boolean;
  /** 1-based position of the current match, or 0 when there is none. */
  currentPosition: number;
  onNext: () => void;
  onPrevious: () => void;
  onShowResults: () => void;
  onClose: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
}

function statusText({ query, status, progress, matchCount, truncated, currentPosition }: SearchBarProps): string {
  if (!query.trim()) return '';
  if (status === 'indexing') {
    const pct = progress.total ? Math.floor((progress.done / progress.total) * 100) : 0;
    return `Indexing ${pct}%`;
  }
  if (status === 'error') return 'Search failed';
  if (status !== 'ready') return '';
  if (matchCount === 0) return 'No matches';
  return `${currentPosition} of ${matchCount}${truncated ? '+' : ''}`;
}

/**
 * Search field shown under the reader top bar.
 *
 * Presentational only — state lives in `useReaderSearch`.
 * Enter / Shift+Enter move between matches; Escape closes search.
 */
export function SearchBar(props: SearchBarProps) {
  const { query, onQueryChange, matchCount, onNext, onPrevious, onShowResults, onClose, inputRef } = props;
  const hasMatches = matchCount > 0;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (event.shiftKey) onPrevious();
      else onNext();
    } else if (event.key === 'Escape') {
      // Keep Escape from also reaching the page-level handler.
      event.stopPropagation();
      onClose();
    }
  };

  return (
    <div className="search-bar" role="search">
      <svg className="search-bar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        ref={inputRef}
        className="search-bar__input"
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search in book"
        aria-label="Search in book"
        autoComplete="off"
        spellCheck={false}
        autoFocus
      />
      <span className="search-bar__status" aria-live="polite">
        {statusText(props)}
      </span>
      <button
        type="button"
        className="search-bar__button"
        onClick={onPrevious}
        disabled={!hasMatches}
        aria-label="Previous match"
        title="Previous match (Shift+Enter)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
      <button
        type="button"
        className="search-bar__button"
        onClick={onNext}
        disabled={!hasMatches}
        aria-label="Next match"
        title="Next match (Enter)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <button
        type="button"
        className="search-bar__button"
        onClick={onShowResults}
        disabled={!hasMatches}
        aria-label="Show all matches"
        title="All matches"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 6h13" />
          <path d="M8 12h13" />
          <path d="M8 18h13" />
          <path d="M3 6h.01" />
          <path d="M3 12h.01" />
          <path d="M3 18h.01" />
        </svg>
      </button>
      <button
        type="button"
        className="search-bar__button"
        onClick={onClose}
        aria-label="Close search"
        title="Close search (Esc)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.25"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}
