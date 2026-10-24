/** Fills a bookcase's planks with spines, left to right, greedily. */

export const SPINE_GAP = 3;
/** 8px of air, then the 6px bookend. */
export const BOOKEND = 14;
/** A full plank with this much room left lets its last book lean. */
export const LEAN_ROOM = 26;
/** Free room on the last plank that lets its last two books lie flat. */
export const STACK_ROOM = 140;
const STACK_MIN_BOOKS = 5;

export interface Plank {
  /** Indexes of the standing books, in order. */
  books: number[];
  /** The last standing book leans into the gap. */
  lean: boolean;
}

export interface Packed {
  planks: Plank[];
  /** The shelf's last two books, lying flat on its last plank. */
  stack: number[];
}

const used = (widths: readonly number[], books: readonly number[]) =>
  books.reduce((sum, i) => sum + widths[i], 0) + Math.max(0, books.length - 1) * SPINE_GAP;

/** Spine widths in, planks out; `room` is a bay's inner width. Same input, same case. */
export function packPlanks(widths: readonly number[], room: number): Packed {
  const planks: Plank[] = [{ books: [], lean: false }];
  widths.forEach((w, i) => {
    const plank = planks[planks.length - 1];
    if (plank.books.length > 0 && used(widths, plank.books) + SPINE_GAP + w > room) {
      planks.push({ books: [i], lean: false });
    } else {
      plank.books.push(i);
    }
  });

  // The last plank also holds the bookend.
  const last = planks[planks.length - 1];
  if (last.books.length > 1 && used(widths, last.books) + BOOKEND > room) {
    planks.push({ books: [last.books.pop()!], lean: false });
  }
  for (const plank of planks.slice(0, -1)) plank.lean = room - used(widths, plank.books) >= LEAN_ROOM;

  const end = planks[planks.length - 1];
  const stack =
    widths.length >= STACK_MIN_BOOKS && end.books.length >= 2 && room - used(widths, end.books) >= STACK_ROOM
      ? end.books.splice(-2)
      : [];
  return { planks, stack };
}

/** Spine width from page count: thin novellas, fat epics. */
export const spineWidth = (pageCount: number) => Math.round(Math.min(38, Math.max(22, 17 + pageCount / 32)));
