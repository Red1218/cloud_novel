import './FilterButton.css';

export interface FilterButtonProps {
  /** The current active state of the filter */
  isActive?: boolean;
  /** Callback fired when the filter button is clicked */
  onClick?: () => void;
}

/**
 * Reusable filter button component.
 * UI only - functionality will be added in a future phase.
 */
export function FilterButton({ isActive, onClick }: FilterButtonProps) {
  return (
    <button
      type="button"
      className={`filter-button ${isActive ? 'filter-button--active' : ''}`}
      onClick={onClick}
      aria-label="Filter library"
      aria-pressed={isActive}
    >
      <span className="filter-button__icon" aria-hidden="true">
        &#9881; {/* ⚙ or some filter icon equivalent */}
      </span>
      <span className="filter-button__text">Filter</span>
    </button>
  );
}
