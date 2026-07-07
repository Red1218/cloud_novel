import './Header.css';

interface HeaderProps {
  /** Called when the hamburger button is clicked. */
  onMenuToggle: () => void;
  /** Whether the sidebar drawer is currently open. */
  isSidebarOpen: boolean;
}

/**
 * Application top bar.
 *
 * Desktop: hamburger button is hidden (sidebar is always visible).
 * Tablet/Mobile: hamburger button is visible and controls the sidebar drawer.
 */
export function Header({ onMenuToggle, isSidebarOpen }: HeaderProps) {
  return (
    <header className="header" role="banner">
      <div className="header__left">
        <button
          id="sidebar-toggle-btn"
          className="header__menu-btn"
          onClick={onMenuToggle}
          aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isSidebarOpen}
          aria-controls="app-sidebar"
        >
          <span className="header__menu-icon" aria-hidden="true">
            &#9776;
          </span>
        </button>
        <span className="header__brand">Cloud Novel</span>
      </div>

      <div className="header__right">
        {/* Reserved for future: search, notifications, user avatar */}
      </div>
    </header>
  );
}
