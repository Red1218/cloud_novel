import { useEffect, type RefObject } from 'react';

/** How far a finger must travel sideways (px) to turn the page. */
const SWIPE_MIN_PX = 50;

interface UseReaderSwipeOptions {
  nextPage: () => void;
  previousPage: () => void;
}

/**
 * Turns the page on a one-finger horizontal swipe over the page area.
 *
 * Swipe left for the next page, right for the previous one. The swipe must
 * be mostly sideways so vertical scrolling is untouched. When the page is
 * wider than the screen (zoomed in), a swipe only turns the page if the
 * view was already at that edge when the finger went down, so panning
 * across the page still works. Pinches (two fingers) are ignored.
 */
export function useReaderSwipe(
  containerRef: RefObject<HTMLElement | null>,
  { nextPage, previousPage }: UseReaderSwipeOptions,
): void {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let start: { x: number; y: number; atLeft: boolean; atRight: boolean } | null = null;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        start = null; // second finger: a pinch, not a swipe
        return;
      }
      const t = e.touches[0];
      start = {
        x: t.clientX,
        y: t.clientY,
        atLeft: el.scrollLeft <= 1,
        atRight: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
      };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!start || e.touches.length > 0) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const { atLeft, atRight } = start;
      start = null;
      if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0 && atRight) nextPage();
      else if (dx > 0 && atLeft) previousPage();
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [containerRef, nextPage, previousPage]);
}
