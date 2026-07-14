import { useEffect } from 'react';
import { NavItem } from '@/components/ui';
import { NAV_ITEMS } from '@/constants';
import './Sidebar.css';

interface SidebarProps {
  /** Whether the drawer is open (relevant on tablet/mobile only). */
  isOpen: boolean;
  /** Callback to close the drawer. */
  onClose: () => void;
}

/**
 * Application sidebar navigation.
 *
 * Desktop (≥1024px): Always visible as a fixed-width column.
 *   `isOpen` and `onClose` are unused on desktop.
 *
 * Tablet/Mobile (<1024px): Rendered as a drawer overlay.
 *   Opens/closes based on `isOpen`.
 *   Closes on:
 *     - Clicking outside (via backdrop)
 *     - Pressing Escape
 *     - Clicking a navigation link (handled by each NavItem's li onClick)
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  /* Close drawer on Escape key press (tablet/mobile). */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop — only visible on tablet/mobile when drawer is open */}
      <div
        className={`sidebar-backdrop${isOpen ? ' sidebar-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        id="app-sidebar"
        className={`sidebar${isOpen ? ' sidebar--open' : ''}`}
        aria-label="Main navigation"
      >
        {/* Brand / Logo */}
        <div className="sidebar__brand">
          <span className="sidebar__logo" aria-hidden="true">
            &#128216;
          </span>
          <span className="sidebar__title">Cloud Novel</span>
        </div>

        {/* Navigation links */}
        <nav className="sidebar__nav" aria-label="Primary navigation">
          <ul className="sidebar__nav-list" role="list">
            {NAV_ITEMS.map((item) => (
              <li key={item.path} onClick={onClose}>
                <NavItem {...item} />
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          <span className="sidebar__version">v0.1.0 · Phase 1</span>
        </div>
      </aside>
    </>
  );
}
