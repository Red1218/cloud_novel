import type { ReactNode } from 'react';

/**
 * Represents a statistic shown on the Library or Dashboard pages.
 */
export interface LibraryStat {
  label: string;
  value: string | number;
  icon?: ReactNode;
}
