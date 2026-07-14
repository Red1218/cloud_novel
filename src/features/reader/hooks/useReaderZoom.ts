import { useState, useCallback, useEffect } from 'react';
import type { ScaleMode } from '../types';
import { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, ZOOM_DEFAULT } from '../constants';

export interface UseReaderZoomOptions {
  /** Initial zoom level from persisted state. Defaults to ZOOM_DEFAULT. */
  initialZoom?: number;
  /** Initial scale mode from persisted state. Defaults to 'fit-width'. */
  initialScaleMode?: ScaleMode;
  /** Callback invoked whenever zoom changes (for persistence). */
  onZoomChange?: (zoom: number) => void;
  /** Callback invoked whenever scaleMode changes (for persistence). */
  onScaleModeChange?: (scaleMode: ScaleMode) => void;
}

export interface UseReaderZoomResult {
  zoom: number;
  scaleMode: ScaleMode;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitWidth: () => void;
  fitPage: () => void;
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
 * Accepts initial values from persisted state and reports changes via callbacks.
 * All callbacks are stable (empty useCallback deps where possible).
 */
export function useReaderZoom(options: UseReaderZoomOptions = {}): UseReaderZoomResult {
  const {
    initialZoom = ZOOM_DEFAULT,
    initialScaleMode = 'fit-width',
    onZoomChange,
    onScaleModeChange,
  } = options;

  const [zoom, setZoom] = useState(initialZoom);
  const [scaleMode, setScaleMode] = useState<ScaleMode>(initialScaleMode);

  // Report zoom changes to parent for persistence
  useEffect(() => {
    onZoomChange?.(zoom);
  }, [zoom, onZoomChange]);

  // Report scaleMode changes to parent for persistence
  useEffect(() => {
    onScaleModeChange?.(scaleMode);
  }, [scaleMode, onScaleModeChange]);

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
  const fitPage = useCallback(() => setScaleMode('fit-page'), []);

  return { zoom, scaleMode, zoomIn, zoomOut, resetZoom, fitWidth, fitPage };
}
