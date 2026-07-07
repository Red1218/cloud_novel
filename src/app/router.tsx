import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/layouts';
import { ROUTES } from '@/constants';
import {
  DashboardPage,
  LibraryPage,
  ReaderPage,
  SettingsPage,
  NotFoundPage,
} from '@/pages';

/**
 * Application router.
 *
 * Route structure:
 *  /             → AppLayout > DashboardPage  (index)
 *  /library      → AppLayout > LibraryPage
 *  /reader       → AppLayout > ReaderPage
 *  /settings     → AppLayout > SettingsPage
 *  *             → NotFoundPage (standalone, no AppLayout)
 *
 * All path strings come from ROUTES constants — never hardcoded.
 * Child paths use slice(1) to convert absolute constants to
 * relative segments required by the nested router config.
 */
const router = createBrowserRouter([
  {
    path: ROUTES.DASHBOARD,
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: ROUTES.LIBRARY.slice(1), element: <LibraryPage /> },
      { path: ROUTES.READER.slice(1), element: <ReaderPage /> },
      { path: ROUTES.SETTINGS.slice(1), element: <SettingsPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
