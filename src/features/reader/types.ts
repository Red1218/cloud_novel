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

/** Visual environment around the published PDF page. */
export type ReaderTheme = 'dark' | 'light' | 'sepia' | 'contrast';

/** Scale modes exposed in Reading Behavior controls. */
export type ReaderOpeningMode = Extract<ScaleMode, 'fit-width' | 'fit-page'>;

/** Reader environment settings persisted per book. */
export interface ReaderEnvironmentSettings {
  theme: ReaderTheme;
  brightness: number;
  autoHideControls: boolean;
}
