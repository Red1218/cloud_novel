import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import { TabBar } from '@/components/layout/TabBar/TabBar';
import './AppLayout.css';

/**
 * The single application shell, on paper.
 *
 *  - Desktop (≥1024px): sidebar column + scrolling content.
 *  - Tablet/Mobile (<1024px): scrolling content + bottom tab bar.
 *
 * The reader covers the whole shell (it is a fixed overlay).
 */
export function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <main id="main-content" className="app-content">
          <div className="app-content__inner">
            <Outlet />
          </div>
        </main>
        <TabBar />
      </div>
    </div>
  );
}
