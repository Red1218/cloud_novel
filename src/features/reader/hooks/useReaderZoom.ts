import { useState, useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { ScaleMode } from '../types';
import type { ReadingStateUpdate } from '@/repositories/BookRepository';
import { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, ZOOM_DEFAULT } from '../constants';

interface UseReaderZoomOptions {
  /** Initial zoom level from persisted state. Defaults to ZOOM_DEFAULT. */
  initialZoom?: number;
  /** Initial scale mode from persisted state. Defaults to 'fit-page'. */
  initialScaleMode?: ScaleMode;
  /** Receives every zoom and scale mode change (for persistence). */
  persist: (update: ReadingStateUpdate) => void;
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
 *
 * Accepts initial values from persisted state and reports changes to `persist`.
 */
export function useReaderZoom({
  initialZoom = ZOOM_DEFAULT,
  initialScaleMode = 'fit-page',
  persist,
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

  const setMode = useCallback((mode: ScaleMode) => {
    if (scaleModeRef.current !== mode) persist({ scaleMode: mode });
    setScaleMode(mode);
  }, [persist]);

  const setZoomTo = useCallback((pick: (prev: number) => number) => {
    setZoom(prev => {
      const next = pick(prev);
      if (next !== prev) persist({ zoom: next });
      return next;
    });
  }, [persist]);

  /** Steps the zoom; leaving a fit mode starts from the rendered scale. */
  const stepZoom = useCallback((delta: number) => {
    const wasCustom = scaleModeRef.current === 'custom';
    setMode('custom');
    setZoomTo(prev => clamp(roundZoom((wasCustom ? prev : effectiveZoomRef.current) + delta)));
  }, [effectiveZoomRef, setMode, setZoomTo]);

  const zoomIn = useCallback(() => stepZoom(ZOOM_STEP), [stepZoom]);
  const zoomOut = useCallback(() => stepZoom(-ZOOM_STEP), [stepZoom]);

  const resetZoom = useCallback(() => {
    setMode('custom');
    setZoomTo(() => ZOOM_DEFAULT);
  }, [setMode, setZoomTo]);

  const fitPage = useCallback(() => setMode('fit-page'), [setMode]);

  return { zoom, scaleMode, zoomIn, zoomOut, resetZoom, fitPage };
}
