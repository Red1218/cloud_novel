import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { PDFPageProxy } from 'pdfjs-dist';

/** Space between a page and its neighbour while turning, in the reader's colour. */
const GAP = 16;
/** A drag this far, or a flick this fast (px/ms), turns the page. */
const TURN_DISTANCE = 50;
const TURN_SPEED = 0.3;
/** Movement before a touch counts as a drag, and how sideways it must be. */
const LOCK_DISTANCE = 10;
const LOCK_RATIO = 1.5;
/** Pull past the first or last page moves the page this much of the finger's distance. */
const EDGE_RESISTANCE = 0.25;
const SETTLE_MS = 240;
const SPRING_MS = 200;
const EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

interface PageTurnRefs {
  /** The scroll container the page sits in. */
  containerRef: RefObject<HTMLElement | null>;
  /** Holds the page and its neighbours; the only thing that moves. */
  trackRef: RefObject<HTMLElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  prevRef: RefObject<HTMLCanvasElement | null>;
  nextRef: RefObject<HTMLCanvasElement | null>;
}

interface PageTurnOptions extends PageTurnRefs {
  currentPage: number;
  totalPages: number;
  /** The current page object; a new one means the turned-to page has arrived. */
  page: PDFPageProxy | null;
  nextPage: () => void;
  previousPage: () => void;
}

interface Gesture {
  x: number;
  y: number;
  /** Zoomed in: a turn may only start from the edge the page was already at. */
  atLeft: boolean;
  atRight: boolean;
  lock: 'x' | 'y' | null;
  /** Finger position when the drag locked, so the page starts moving from rest. */
  base: number;
  offset: number;
  samples: { x: number; t: number }[];
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * "Follow and settle" page turns. The page follows a sideways drag 1:1 with
 * its neighbour beside it, then settles the rest of the way (or springs
 * back). Buttons and keys get the same settle without the drag. Everything
 * moves one transformed layer; React only hears about the turn when it
 * commits, after the neighbour's image has been copied onto the page canvas
 * so the swap shows no jump.
 */
export function usePageTurn({
  containerRef, trackRef, canvasRef, prevRef, nextRef,
  currentPage, totalPages, page, nextPage, previousPage,
}: PageTurnOptions) {
  // The latest values, for listeners and callbacks that outlive a render.
  const latest = useRef({ currentPage, totalPages, nextPage, previousPage });
  latest.current = { currentPage, totalPages, nextPage, previousPage };
  /** Finishes a running settle or spring at once; null when nothing runs. */
  const runningRef = useRef<(() => void) | null>(null);

  const canTurn = useCallback((dir: 1 | -1) => {
    const { currentPage: p, totalPages: n } = latest.current;
    return dir > 0 ? p < n : p > 1;
  }, []);

  const move = useCallback((x: number, ms = 0) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = ms ? `transform ${ms}ms ${EASE}` : 'none';
    track.style.transform = x ? `translate3d(${x}px, 0, 0)` : '';
  }, [trackRef]);

  const begin = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    track.dataset.turning = 'true'; // shows the neighbours
    track.style.willChange = 'transform';
  }, [trackRef]);

  const end = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    move(0);
    delete track.dataset.turning;
    track.style.willChange = '';
  }, [move, trackRef]);

  /** Runs `then` when the track's transition ends (or soon after, if it never fires). */
  const after = useCallback((ms: number, then: () => void) => {
    const track = trackRef.current;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      track?.removeEventListener('transitionend', finish);
      clearTimeout(timer);
      runningRef.current = null;
      then();
    };
    const timer = setTimeout(finish, ms + 60);
    track?.addEventListener('transitionend', finish);
    runningRef.current = finish;
  }, [trackRef]);

  /** Shows the neighbour on the page canvas, resets the layer, and tells React. */
  const commit = useCallback((dir: 1 | -1) => {
    const main = canvasRef.current;
    const source = (dir > 0 ? nextRef : prevRef).current;
    if (main && source) {
      main.width = source.width;
      main.height = source.height;
      main.style.width = source.style.width;
      main.style.height = source.style.height;
      main.getContext('2d')?.drawImage(source, 0, 0);
    }
    if (trackRef.current) trackRef.current.dataset.stale = 'true'; // hide the old text layer
    end();
    const container = containerRef.current;
    if (container) container.scrollLeft = dir > 0 ? 0 : container.scrollWidth;
    const { nextPage: next, previousPage: prev } = latest.current;
    if (dir > 0) next(); else prev();
  }, [canvasRef, containerRef, end, nextRef, prevRef, trackRef]);

  /** Slides the rest of the way so the neighbour takes the page's place, then commits. */
  const settle = useCallback((dir: 1 | -1) => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;
    const width = track.offsetWidth;
    // From the page alone: the visible neighbours widen scrollWidth while turning.
    const style = getComputedStyle(container);
    const maxScroll = Math.max(0, width + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) - container.clientWidth);
    // Next lands at its left edge, previous at its right edge (they match when not zoomed).
    const target = dir > 0
      ? -(width + GAP - container.scrollLeft)
      : width + GAP - maxScroll + container.scrollLeft;
    move(target, SETTLE_MS);
    after(SETTLE_MS, () => commit(dir));
  }, [after, commit, containerRef, move, trackRef]);

  const springBack = useCallback(() => {
    move(0, SPRING_MS);
    after(SPRING_MS, end);
  }, [after, end, move]);

  /** For the bottom bar's ‹ › and the arrow keys. */
  const turn = useCallback((dir: 1 | -1) => {
    runningRef.current?.();
    if (!canTurn(dir)) return;
    if (reducedMotion()) {
      const { nextPage: next, previousPage: prev } = latest.current;
      if (dir > 0) next(); else prev();
      return;
    }
    begin();
    settle(dir);
  }, [begin, canTurn, settle]);

  // The turned-to page has arrived: its text layer can show again.
  useEffect(() => {
    if (trackRef.current) delete trackRef.current.dataset.stale;
  }, [page, trackRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let g: Gesture | null = null;

    const cancelDrag = () => {
      if (g?.lock === 'x') springBack();
      g = null;
    };

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        cancelDrag(); // a second finger: a pinch, not a turn
        return;
      }
      runningRef.current?.(); // finish a settling turn before the next one starts
      const t = e.touches[0];
      g = {
        x: t.clientX,
        y: t.clientY,
        atLeft: el.scrollLeft <= 1,
        atRight: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
        lock: null,
        base: 0,
        offset: 0,
        samples: [],
      };
    };

    const onMove = (e: TouchEvent) => {
      if (!g || g.lock === 'y') return;
      if (e.touches.length !== 1) {
        cancelDrag();
        return;
      }
      const t = e.touches[0];
      if (!g.lock) {
        const dx = t.clientX - g.x;
        const dy = t.clientY - g.y;
        if (Math.abs(dx) < LOCK_DISTANCE && Math.abs(dy) < LOCK_DISTANCE) return;
        const fromEdge = dx < 0 ? g.atRight : g.atLeft;
        if (Math.abs(dx) <= LOCK_RATIO * Math.abs(dy) || !fromEdge) {
          g.lock = 'y'; // scrolling, or panning a zoomed page: leave it to the browser
          return;
        }
        g.lock = 'x';
        g.base = t.clientX;
        if (!reducedMotion()) begin();
      }
      e.preventDefault(); // the drag owns this touch; no browser pan or scroll
      g.offset = t.clientX - g.base;
      g.samples.push({ x: t.clientX, t: e.timeStamp });
      if (g.samples.length > 5) g.samples.shift();
      if (reducedMotion()) return;
      const blocked = !canTurn(g.offset < 0 ? 1 : -1);
      move(blocked ? g.offset * EDGE_RESISTANCE : g.offset);
    };

    const onEnd = (e: TouchEvent) => {
      if (!g || e.touches.length > 0) return;
      const drag = g;
      g = null;
      if (drag.lock !== 'x') return;

      const dir: 1 | -1 = drag.offset < 0 ? 1 : -1;
      const first = drag.samples[0];
      const last = drag.samples[drag.samples.length - 1];
      const speed = first && last && last.t > first.t ? (last.x - first.x) / (last.t - first.t) : 0;
      const flick = Math.abs(speed) > TURN_SPEED && Math.sign(speed) === Math.sign(drag.offset);
      const turns = canTurn(dir) && (Math.abs(drag.offset) > TURN_DISTANCE || flick);

      if (reducedMotion()) {
        if (turns) {
          const { nextPage: next, previousPage: prev } = latest.current;
          if (dir > 0) next(); else prev();
        }
        return;
      }
      if (turns) settle(dir);
      else springBack();
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', cancelDrag, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', cancelDrag);
    };
  }, [begin, canTurn, containerRef, move, settle, springBack]);

  return {
    turnNext: useCallback(() => turn(1), [turn]),
    turnPrevious: useCallback(() => turn(-1), [turn]),
  };
}
