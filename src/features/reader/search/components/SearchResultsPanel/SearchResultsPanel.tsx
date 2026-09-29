import type { SearchMatch } from '../../types';
import './SearchResultsPanel.css';

interface SearchResultsPanelProps {
  matches: SearchMatch[];
  /** True when there are more matches than listed. */
  truncated: boolean;
  /** Index of the current match, or -1. */
  currentIndex: number;
  /** Called with a match's index when the reader selects it. */
  onSelect: (index: number) => void;
  onClose: () => void;
}

/**
 * Lists every search match with its page and surrounding text.
 *
 * Presentational only — results come from `useReaderSearch`.
 */
export function SearchResultsPanel({ matches, truncated, currentIndex, onSelect, onClose }: SearchResultsPanelProps) {
  const count = `${matches.length}${truncated ? '+' : ''}`;

  return (
    <section
      className="search-results"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-results-title"
    >
      <div className="search-results__handle" aria-hidden="true" />

      <header className="search-results__header">
        <h2 id="search-results-title" className="search-results__title">
          Matches
          <span className="search-results__count">{count}</span>
        </h2>
        <button
          type="button"
          className="search-results__close"
          onClick={onClose}
          aria-label="Close matches"
          title="Close"
          autoFocus
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.25"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </header>

      <ol className="search-results__list">
        {matches.map((match) => {
          const isCurrent = match.index === currentIndex;
          return (
            <li key={match.index}>
              <button
                type="button"
                className={`search-results__item ${isCurrent ? 'search-results__item--current' : ''}`}
                onClick={() => onSelect(match.index)}
                aria-current={isCurrent ? 'true' : undefined}
              >
                <span className="search-results__page">Page {match.pageNumber}</span>
                <span className="search-results__snippet">
                  {match.snippet.before && <>…{match.snippet.before}</>}
                  <mark className="search-results__mark">{match.snippet.match}</mark>
                  {match.snippet.after && <>{match.snippet.after}…</>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {truncated && (
        <p className="search-results__note">
          Showing the first {matches.length} matches. Refine your search to see more.
        </p>
      )}
    </section>
  );
}
