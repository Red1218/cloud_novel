import './ImportButton.css';

export interface ImportButtonProps {
  /** Callback fired when the button is clicked */
  onImport: () => void;
}

/**
 * Floating Action Button for importing new books.
 */
export function ImportButton({ onImport }: ImportButtonProps) {
  return (
    <button
      type="button"
      className="import-button"
      onClick={onImport}
      aria-label="Import Book"
    >
      <span className="import-button__icon" aria-hidden="true">
        +
      </span>
      <span className="import-button__text">Import</span>
    </button>
  );
}
