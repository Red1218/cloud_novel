import { useState, useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
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
  /**
   * Ref to the effective (rendered) zoom scale.
   *
   * When the user zooms in or out from a fit mode (fit-width / fit-page),
   * the internal `zoom` state may be stale (it was not updated by the fit
   * calculation). Without this ref, the first manual step would jump from
   * the stale value (e.g. 100%) rather than from the actual rendered scale
   * (e.g. 60%), causing a discontinuous jump.
   *
   * The ref is updated each render by the caller — using a ref avoids
   * adding effectiveZoom to the zoomIn/zoomOut useCallback dep arrays,
   * which would cause unnecessary callback churn.
   */
  effectiveZoomRef?: RefObject<number>;
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
    effectiveZoomRef,
  } = options;

  const [zoom, setZoom] = useState(initialZoom);
  const [scaleMode, setScaleMode] = useState<ScaleMode>(initialScaleMode);

  useEffect(() => {
    setZoom(initialZoom);
    setScaleMode(initialScaleMode);
  }, [initialZoom, initialScaleMode]);

  // Captures the current scaleMode so zoomIn/zoomOut can read it without
  // adding scaleMode to their dependency arrays (which would cause churn).
  const scaleModeRef = useRef<ScaleMode>(initialScaleMode);
  scaleModeRef.current = scaleMode;

  const zoomIn = useCallback(() => {
    const wasCustom = scaleModeRef.current === 'custom';
    if (!wasCustom) {
      onScaleModeChange?.('custom');
    }
    setScaleMode('custom');
    setZoom(prev => {
      // When transitioning from a fit mode, seed from the actual rendered
      // scale so the first step is relative to what the user sees, not the
      // stale internal zoom value.
      const base = !wasCustom && effectiveZoomRef?.current != null
        ? effectiveZoomRef.current
        : prev;
      const next = clamp(roundZoom(base + ZOOM_STEP));
      if (next !== prev) {
        onZoomChange?.(next);
      }
      return next;
    });
  }, [onScaleModeChange, onZoomChange, effectiveZoomRef]);

  const zoomOut = useCallback(() => {
    const wasCustom = scaleModeRef.current === 'custom';
    if (!wasCustom) {
      onScaleModeChange?.('custom');
    }
    setScaleMode('custom');
    setZoom(prev => {
      // Same seed logic as zoomIn — start from the effective rendered scale
      // when leaving a fit mode.
      const base = !wasCustom && effectiveZoomRef?.current != null
        ? effectiveZoomRef.current
        : prev;
      const next = clamp(roundZoom(base - ZOOM_STEP));
      if (next !== prev) {
        onZoomChange?.(next);
      }
      return next;
    });
  }, [onScaleModeChange, onZoomChange, effectiveZoomRef]);

  const resetZoom = useCallback(() => {
    setScaleMode(prev => {
      if (prev !== 'custom') {
        onScaleModeChange?.('custom');
      }
      return 'custom';
    });
    setZoom(prev => {
      if (prev !== ZOOM_DEFAULT) {
        onZoomChange?.(ZOOM_DEFAULT);
      }
      return ZOOM_DEFAULT;
    });
  }, [onScaleModeChange, onZoomChange]);

  const fitWidth = useCallback(() => {
    setScaleMode(prev => {
      if (prev !== 'fit-width') {
        onScaleModeChange?.('fit-width');
      }
      return 'fit-width';
    });
  }, [onScaleModeChange]);

  const fitPage = useCallback(() => {
    setScaleMode(prev => {
      if (prev !== 'fit-page') {
        onScaleModeChange?.('fit-page');
      }
      return 'fit-page';
    });
  }, [onScaleModeChange]);

  return { zoom, scaleMode, zoomIn, zoomOut, resetZoom, fitWidth, fitPage };
}
