/**
 * Navigation item configuration.
 * Used by the sidebar nav and route constants.
 */
export interface NavItemConfig {
  /** Display label shown in the sidebar. */
  label: string;
  /** Absolute route path (matches ROUTES constants). */
  path: string;
  /** Icon character or emoji for the nav item. */
  icon: string;
  /** Optional accessible description for screen readers. */
  ariaLabel?: string;
}
