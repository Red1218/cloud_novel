import { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import './AppLayout.css';

const DESKTOP_BREAKPOINT = 1024;

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

  /* Auto-close drawer when viewport grows to desktop width. */
  useEffect(() => {
    function handleResize(): void {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) {
        setIsSidebarOpen(false);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
