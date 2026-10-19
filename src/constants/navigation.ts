import { ROUTES } from './routes';
import type { NavItemConfig } from '@/types';

/**
 * Sidebar navigation items, ordered as they appear in the UI.
 * The reader has no entry of its own: it always needs a book, so it is
 * reached by opening one from the Dashboard or Library.
 */
export const NAV_ITEMS: NavItemConfig[] = [
  {
    label: 'Home',
    path: ROUTES.DASHBOARD,
    icon: 'home',
    ariaLabel: 'Go to Home',
  },
  {
    label: 'Library',
    path: ROUTES.LIBRARY,
    icon: 'library',
    ariaLabel: 'Go to Library',
  },
  {
    label: 'Settings',
    path: ROUTES.SETTINGS,
    icon: 'settings',
    ariaLabel: 'Go to Settings',
  },
];
