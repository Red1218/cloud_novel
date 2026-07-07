import { ROUTES } from './routes';
import type { NavItemConfig } from '@/types';

/**
 * Sidebar navigation items, ordered as they appear in the UI.
 * Icons use Unicode/emoji for Phase 1 (no icon library dependency).
 */
export const NAV_ITEMS: NavItemConfig[] = [
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: '\u229E',
    ariaLabel: 'Go to Dashboard',
  },
  {
    label: 'Library',
    path: ROUTES.LIBRARY,
    icon: '\u{1F4DA}',
    ariaLabel: 'Go to Library',
  },
  {
    label: 'Reader',
    path: ROUTES.READER,
    icon: '\u{1F4D6}',
    ariaLabel: 'Go to Reader',
  },
  {
    label: 'Settings',
    path: ROUTES.SETTINGS,
    icon: '\u2699',
    ariaLabel: 'Go to Settings',
  },
];
