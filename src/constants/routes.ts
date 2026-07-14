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
  READER: '/reader',
  SETTINGS: '/settings',
} as const;

/** Union type of all valid route paths. */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
