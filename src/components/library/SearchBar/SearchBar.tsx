import './SearchBar.css';

export interface SearchBarProps {
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Current value of the search input */
  value?: string;
  /** Callback fired when the input value changes */
  onChange?: (value: string) => void;
}

/**
 * Reusable search bar component.
 * UI only - functionality will be added in a future phase.
 */
export function SearchBar({ placeholder = 'Search...', value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar">
      <div className="search-bar__icon" aria-hidden="true">
        &#128269; {/* 🔍 */}
      </div>
      <input
        type="search"
        className="search-bar__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label="Search"
      />
    </div>
  );
}
