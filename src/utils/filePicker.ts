/**
 * Programmatically opens the OS file dialog to select a single PDF file.
 * Returns a Promise that resolves with the selected File, or rejects if cancelled/invalid.
 */
export function selectPdfFile(): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.style.display = 'none';

    // Handle file selection
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      if (file.type !== 'application/pdf') {
        reject(new Error('Invalid file type. Only PDFs are supported.'));
        return;
      }

      resolve(file);
    };

    // Attempt to handle cancellation (Note: browser support for cancel event on input[type=file] is imperfect,
    // but works in modern browsers to avoid hanging promises).
    input.oncancel = () => {
      reject(new Error('File selection cancelled'));
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });
}
