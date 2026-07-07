import './ImportButton.css';

export interface ImportButtonProps {
  /** Callback fired when the button is clicked */
  onImport?: () => void;
}

/**
 * Floating Action Button for importing new books.
 */
export function ImportButton({ onImport }: ImportButtonProps) {
  const handleImport = () => {
    if (onImport) {
      onImport();
    } else {
      console.log('Import PDF coming in Phase 3');
    }
  };

  return (
    <button
      type="button"
      className="import-button"
      onClick={handleImport}
      aria-label="Import Book"
    >
      <span className="import-button__icon" aria-hidden="true">
        +
      </span>
      <span className="import-button__text">Import</span>
    </button>
  );
}
