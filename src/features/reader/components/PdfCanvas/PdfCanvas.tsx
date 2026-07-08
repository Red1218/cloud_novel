import { forwardRef } from 'react';
import './PdfCanvas.css';

interface PdfCanvasProps {
  isLoading: boolean;
  error: string | null;
}

/**
 * Purely presentational component that renders the canvas element.
 * The actual rendering logic is handled by the hook which receives the ref.
 */
export const PdfCanvas = forwardRef<HTMLCanvasElement, PdfCanvasProps>(
  ({ isLoading, error }, ref) => {
    return (
      <div className="pdf-canvas-container">
        <div className="pdf-canvas-wrapper">
          <canvas
            ref={ref}
            className={`pdf-canvas ${isLoading || error ? 'pdf-canvas--hidden' : ''}`}
          />
        </div>
      </div>
    );
  }
);

PdfCanvas.displayName = 'PdfCanvas';
