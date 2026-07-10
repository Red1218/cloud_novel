import { forwardRef } from 'react';
import type { RefObject } from 'react';
import './PdfCanvas.css';

interface PdfCanvasProps {
  isLoading:    boolean;
  error:        string | null;
  /** Ref forwarded to the scroll container for viewport fit measurements. */
  containerRef: RefObject<HTMLDivElement | null>;
}

/**
 * Purely presentational component that renders the canvas element.
 * The actual rendering logic is handled by usePdfRenderer which receives canvasRef.
 * containerRef is attached to the scroll container so useReader can measure
 * available dimensions for fit-width and fit-page calculations.
 */
export const PdfCanvas = forwardRef<HTMLCanvasElement, PdfCanvasProps>(
  ({ isLoading, error, containerRef }, ref) => {
    return (
      <div className="pdf-canvas-container" ref={containerRef}>
        <div className="pdf-canvas-wrapper">
          <canvas
            ref={ref}
            className={`pdf-canvas ${isLoading || error ? 'pdf-canvas--hidden' : ''}`}
          />
        </div>
      </div>
    );
  },
);

PdfCanvas.displayName = 'PdfCanvas';
