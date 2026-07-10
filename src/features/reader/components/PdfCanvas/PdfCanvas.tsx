import { forwardRef } from 'react';
import './PdfCanvas.css';

interface PdfCanvasProps {
  isLoading: boolean;
  error:     string | null;
}

/**
 * Purely presentational component that renders the canvas element.
 *
 * The scroll container and stacking context previously owned by this component
 * have moved to ReaderViewport, which composes PdfCanvas and PdfTextLayer
 * as siblings inside a shared positioning context.
 *
 * The actual rendering logic is handled by usePdfRenderer which receives
 * canvasRef from ReaderPage.
 */
export const PdfCanvas = forwardRef<HTMLCanvasElement, PdfCanvasProps>(
  ({ isLoading, error }, ref) => {
    return (
      <canvas
        ref={ref}
        className={`pdf-canvas ${isLoading || error ? 'pdf-canvas--hidden' : ''}`}
      />
    );
  },
);

PdfCanvas.displayName = 'PdfCanvas';
