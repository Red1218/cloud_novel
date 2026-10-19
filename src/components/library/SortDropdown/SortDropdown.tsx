import type { SortOption } from '@/features/library/utils/sortBooks';
import './SortDropdown.css';

export interface SortDropdownProps {
  /** The current selected sort value */
  value: SortOption;
  /** Callback fired when the sort option changes */
  onChange: (value: SortOption) => void;
}

/**
 * Sort dropdown for the library grid.
 */
export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="sort-dropdown">
      <select
        className="sort-dropdown__select"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        aria-label="Sort library"
      >
        <option value="recentlyAdded">Recently Added</option>
        <option value="lastOpened">Recently Opened</option>
        <option value="title">Title</option>
        <option value="author">Author</option>
      </select>
      <div className="sort-dropdown__icon" aria-hidden="true">
        &#9662; {/* ▾ */}
      </div>
    </div>
  );
}
