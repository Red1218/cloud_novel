import { useState, useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { ScaleMode } from '../types';
import { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, ZOOM_DEFAULT } from '../constants';

interface UseReaderZoomOptions {
  /** The zoom a book opens at. Defaults to ZOOM_DEFAULT. */
  initialZoom?: number;
  /** How a book opens. Defaults to 'fit-page'. */
  initialScaleMode?: ScaleMode;
  /**
   * The effective (rendered) zoom scale, updated each render by the caller.
   *
   * In a fit mode the internal `zoom` state is stale (the fit calculation
   * does not update it), so the first manual step starts from this value
   * instead, avoiding a jump from e.g. 100% when the page shows at 60%.
   */
  effectiveZoomRef: RefObject<number>;
}

function clamp(value: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
}

/** Rounds a zoom value to 2 decimal places to avoid floating-point drift. */
function roundZoom(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Manages zoom level and scale mode for the Reader.
 * Zoom is for the visit; a book's own opening zoom is saved separately (openZoom).
 */
export function useReaderZoom({
  initialZoom = ZOOM_DEFAULT,
  initialScaleMode = 'fit-page',
  effectiveZoomRef,
}: UseReaderZoomOptions) {
  const [zoom, setZoom] = useState(initialZoom);
  const [scaleMode, setScaleMode] = useState<ScaleMode>(initialScaleMode);

  useEffect(() => {
    setZoom(initialZoom);
    setScaleMode(initialScaleMode);
  }, [initialZoom, initialScaleMode]);

  // Lets the callbacks read the current scaleMode without depending on it.
  const scaleModeRef = useRef<ScaleMode>(initialScaleMode);
  scaleModeRef.current = scaleMode;

  /** Steps the zoom; leaving a fit mode starts from the rendered scale. */
  const stepZoom = useCallback((delta: number) => {
    const wasCustom = scaleModeRef.current === 'custom';
    setScaleMode('custom');
    setZoom(prev => clamp(roundZoom((wasCustom ? prev : effectiveZoomRef.current) + delta)));
  }, [effectiveZoomRef]);

  const zoomIn = useCallback(() => stepZoom(ZOOM_STEP), [stepZoom]);
  const zoomOut = useCallback(() => stepZoom(-ZOOM_STEP), [stepZoom]);

  const resetZoom = useCallback(() => {
    setScaleMode('custom');
    setZoom(ZOOM_DEFAULT);
  }, []);

  const fitPage = useCallback(() => setScaleMode('fit-page'), []);

  /** Jumps to an exact zoom (the Aa zoom bar). */
  const setZoomLevel = useCallback((value: number) => {
    setScaleMode('custom');
    setZoom(clamp(roundZoom(value)));
  }, []);

  return { zoom, scaleMode, zoomIn, zoomOut, resetZoom, fitPage, setZoomLevel };
}
