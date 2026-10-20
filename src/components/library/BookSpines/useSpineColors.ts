import { useEffect, useState } from 'react';
import type { Book } from '@/types/book';

export interface SpineColor {
  bg: string;
  fg: string;
}

export const SPINE_FALLBACK: SpineColor = { bg: '#3a352d', fg: '#f2ede3' };

/** Average colour of a cover thumbnail (one-pixel downscale), with readable text on it. */
const colorCache = new Map<string, Promise<SpineColor>>();
function coverColor(src: string): Promise<SpineColor> {
  let pending = colorCache.get(src);
  if (!pending) {
    pending = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const ctx = document.createElement('canvas').getContext('2d');
        if (!ctx) return resolve(SPINE_FALLBACK);
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        const light = 0.299 * r + 0.587 * g + 0.114 * b > 150;
        resolve({ bg: `rgb(${r} ${g} ${b})`, fg: light ? '#1f1b16' : '#f6f1e7' });
      };
      img.onerror = () => resolve(SPINE_FALLBACK);
      img.src = src;
    });
    colorCache.set(src, pending);
  }
  return pending;
}

/** Stable 0..1 value per book, so spine heights vary but never jump between renders. */
export function jitter(id: string): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (h % 1000) / 1000;
}

/** Spine colours for these books, filled in as their covers are measured. */
export function useSpineColors(books: readonly Book[]): Record<string, SpineColor> {
  const [colors, setColors] = useState<Record<string, SpineColor>>({});

  useEffect(() => {
    let alive = true;
    for (const book of books) {
      if (!book.thumbnail || colors[book.id]) continue;
      coverColor(book.thumbnail).then((c) => {
        if (alive) setColors((prev) => ({ ...prev, [book.id]: c }));
      });
    }
    return () => {
      alive = false;
    };
  }, [books, colors]);

  return colors;
}
