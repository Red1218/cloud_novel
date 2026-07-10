import { useState, useCallback } from 'react';
import type { ScaleMode } from '../types';
import { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, ZOOM_DEFAULT } from '../constants';

export interface UseReaderZoomResult {
  zoom:      number;
  scaleMode: ScaleMode;
  zoomIn:    () => void;
  zoomOut:   () => void;
  resetZoom: () => void;
  fitWidth:  () => void;
  fitPage:   () => void;
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
 * All callbacks are stable (empty useCallback deps).
 */
export function useReaderZoom(): UseReaderZoomResult {
  const [zoom,      setZoom]      = useState(ZOOM_DEFAULT);
  const [scaleMode, setScaleMode] = useState<ScaleMode>('fit-width');

  const zoomIn = useCallback(() => {
    setScaleMode('custom');
    setZoom(prev => clamp(roundZoom(prev + ZOOM_STEP)));
  }, []);

  const zoomOut = useCallback(() => {
    setScaleMode('custom');
    setZoom(prev => clamp(roundZoom(prev - ZOOM_STEP)));
  }, []);

  const resetZoom = useCallback(() => {
    setScaleMode('custom');
    setZoom(ZOOM_DEFAULT);
  }, []);

  const fitWidth = useCallback(() => setScaleMode('fit-width'), []);
  const fitPage  = useCallback(() => setScaleMode('fit-page'),  []);

  return { zoom, scaleMode, zoomIn, zoomOut, resetZoom, fitWidth, fitPage };
}
