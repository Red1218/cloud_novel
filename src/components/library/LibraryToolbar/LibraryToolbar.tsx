import { SearchBar } from '../SearchBar';
import { SortDropdown } from '../SortDropdown';
import { FilterButton } from '../FilterButton';
import './LibraryToolbar.css';

export interface LibraryToolbarProps {
  /** Search bar props (e.g., value, onChange) */
  search?: {
    value?: string;
    onChange?: (val: string) => void;
  };
  /** Sort dropdown props (e.g., value, onChange) */
  sort?: {
    value?: string;
    onChange?: (val: string) => void;
  };
  /** Filter button props (e.g., isActive, onClick) */
  filter?: {
    isActive?: boolean;
    onClick?: () => void;
  };
}

/**
 * Composes the Search, Sort, and Filter controls into a single toolbar.
 */
export function LibraryToolbar({ search, sort, filter }: LibraryToolbarProps) {
  return (
    <div className="library-toolbar">
      <div className="library-toolbar__main">
        <SearchBar value={search?.value} onChange={search?.onChange} />
      </div>
      <div className="library-toolbar__actions">
        <SortDropdown value={sort?.value} onChange={sort?.onChange} />
        <FilterButton isActive={filter?.isActive} onClick={filter?.onClick} />
      </div>
    </div>
  );
}
