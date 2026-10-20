/**
 * Programmatically opens the OS file dialog to select one or more PDF files.
 * Returns a Promise that resolves with the selected files, or rejects if cancelled.
 */
export function selectPdfFiles(): Promise<File[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.multiple = true;
    input.style.display = 'none';

    input.onchange = () => {
      const files = Array.from(input.files ?? []);
      if (files.length === 0) {
        reject(new Error('File selection cancelled'));
        return;
      }
      resolve(files);
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
