/**
 * Combines CSS class name strings, filtering out all falsy values.
 *
 * @example
 * cn('btn', isActive && 'btn--active', undefined)
 * // => 'btn btn--active'
 */
export function cn(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(' ');
}
