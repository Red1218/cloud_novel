import type { IconName } from '@/components/ui';

/**
 * Navigation item configuration.
 * Used by the sidebar nav and route constants.
 */
export interface NavItemConfig {
  /** Display label shown in the sidebar. */
  label: string;
  /** Absolute route path (matches ROUTES constants). */
  path: string;
  /** Icon shown next to the label. */
  icon: IconName;
  /** Optional accessible description for screen readers. */
  ariaLabel?: string;
}
