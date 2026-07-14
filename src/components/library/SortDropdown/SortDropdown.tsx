import './SortDropdown.css';

export interface SortDropdownProps {
  /** The current selected sort value */
  value?: string;
  /** Callback fired when the sort option changes */
  onChange?: (value: string) => void;
}

/**
 * Reusable sort dropdown component.
 * UI only - functionality will be added in a future phase.
 */
export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="sort-dropdown">
      <select
        className="sort-dropdown__select"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label="Sort library"
      >
        <option value="recent">Recently Added</option>
        <option value="opened">Recently Opened</option>
        <option value="title">Title</option>
        <option value="author">Author</option>
      </select>
      <div className="sort-dropdown__icon" aria-hidden="true">
        &#9662; {/* ▾ */}
      </div>
    </div>
  );
}
