import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { ROUTES } from '@/constants/routes';
import { DashboardPage } from '@/pages/Dashboard/DashboardPage';
import { LibraryPage } from '@/pages/Library/LibraryPage';
import { CollectionPage } from '@/pages/Collection/CollectionPage';
import { ReaderPage } from '@/pages/Reader/ReaderPage';
import { SettingsPage } from '@/pages/Settings/SettingsPage';
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage';

/**
 * Application router.
 *
 * Route structure:
 *  /             → AppLayout > DashboardPage  (index)
 *  /library      → AppLayout > LibraryPage
 *  /library/collection/:kind/:name → AppLayout > CollectionPage
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
      { path: ROUTES.COLLECTION.slice(1) + '/:kind/:name?', element: <CollectionPage /> },
      { path: ROUTES.READER.slice(1) + '/:bookId', element: <ReaderPage /> },
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
