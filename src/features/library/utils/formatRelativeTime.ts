/**
 * Formats a timestamp as a relative time string (e.g., "2 hours ago", "yesterday").
 *
 * @param timestamp - The timestamp to format (milliseconds since epoch)
 * @returns A human-readable relative time string, or null if timestamp is invalid
 */
export function formatRelativeTime(timestamp: number | undefined | null): string | null {
  if (timestamp === undefined || timestamp === null) {
    return null;
  }

  const now = Date.now();
  const diff = now - timestamp;

  // Future dates
  if (diff < 0) {
    return 'just now';
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return 'just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days === 1) {
    return 'yesterday';
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  if (weeks < 4) {
    return `${weeks}w ago`;
  }

  if (months < 12) {
    return `${months}mo ago`;
  }

  if (years === 1) {
    return '1y ago';
  }

  return `${years}y ago`;
}
