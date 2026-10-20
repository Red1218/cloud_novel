/**
 * Application route path constants.
 *
 * Use these everywhere instead of hardcoding strings.
 *
 * @example
 * import { ROUTES } from '@/constants';
 * <NavLink to={ROUTES.LIBRARY}>Library</NavLink>
 */
export const ROUTES = {
  DASHBOARD: '/',
  LIBRARY: '/library',
  COLLECTION: '/library/collection',
  READER: '/reader',
  SETTINGS: '/settings',
} as const;

/** Path of one collection page; an empty author name is the "No author" group. */
export function collectionPath(kind: 'series' | 'author' | 'genre', name: string): string {
  return `${ROUTES.COLLECTION}/${kind}/${encodeURIComponent(name)}`;
}
