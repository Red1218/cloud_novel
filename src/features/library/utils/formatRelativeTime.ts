const relativeTime = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

/** Largest unit first; each unit's length in milliseconds. */
const UNITS: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 86_400_000],
  ['month', 30 * 86_400_000],
  ['week', 7 * 86_400_000],
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
];

/**
 * Formats a timestamp as a relative time string (e.g., "2 hours ago", "yesterday").
 *
 * @param timestamp - The timestamp to format (milliseconds since epoch)
 * @returns A human-readable relative time string, or null if timestamp is missing
 */
export function formatRelativeTime(timestamp: number | undefined | null): string | null {
  if (timestamp === undefined || timestamp === null) {
    return null;
  }

  const diff = Date.now() - timestamp;
  for (const [unit, ms] of UNITS) {
    if (diff >= ms) return relativeTime.format(-Math.floor(diff / ms), unit);
  }
  return 'just now';
}
