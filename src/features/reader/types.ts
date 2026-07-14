/**
 * Determines how the PDF page is scaled within its container.
 *
 * - 'fit-width'  Scale to fill the container width.
 *                Re-calculates on window resize.
 * - 'fit-page'   Scale so the entire page fits within the container.
 *                Re-calculates on window resize.
 * - 'custom'     Use the explicit zoom value chosen by the user.
 *                Preserved on window resize.
 */
export type ScaleMode = 'fit-width' | 'fit-page' | 'custom';
