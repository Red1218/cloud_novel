/**
 * Inline stroke icons (24×24 grid, 1.75 stroke) used across the app shell.
 * Kept as a small path map so there is no icon-library dependency.
 */
const PATHS = {
  book: 'M12 6.5C10.3 5.2 8 4.5 5 4.5v13c3 0 5.3.7 7 2 1.7-1.3 4-2 7-2v-13c-3 0-5.3.7-7 2zm0 0v13',
  home: 'M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z',
  library: 'M5 4h3v16H5zM10 4h3v16h-3zM15.2 4.6l2.9-.8 3.9 15.5-2.9.8z',
  settings: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',
  books: 'M6.5 4H19v14H6.5A2.5 2.5 0 0 0 4 20.5v-14A2.5 2.5 0 0 1 6.5 4zM4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5',
  finished: 'M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0zM8.5 12.2l2.4 2.3 4.6-5',
  menu: 'M4 7h16M4 12h16M4 17h16',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
