import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header/Header';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import './AppLayout.css';

/**
 * The single application shell.
 *
 * Structure:
 * ┌──────────────────────────────────────┐
 * │ Sidebar │ Header                      │
 * │         ├─────────────────────────────┤
 * │         │ <Outlet /> (page content)   │
 * └──────────────────────────────────────┘
 *
 * Sidebar visibility:
 *  - Desktop (≥1024px): always visible, CSS grid column.
 *  - Tablet/Mobile (<1024px): hidden drawer, toggled via Header hamburger.
 */
export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  const toggleSidebar = useCallback(
    () => setIsSidebarOpen((prev) => !prev),
    [],
  );

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="app-main">
        <Header
          onMenuToggle={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <main id="main-content" className="app-content">
          <div className="app-content__inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
