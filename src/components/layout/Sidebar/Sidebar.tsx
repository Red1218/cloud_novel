import { Icon } from '@/components/ui/Icon/Icon';
import { NavItem } from '@/components/ui/NavItem/NavItem';
import { NAV_ITEMS } from '@/constants/navigation';
import './Sidebar.css';

/**
 * Desktop navigation column (≥1024px). Smaller screens use the TabBar.
 */
export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar__brand">
        <span className="sidebar__logo" aria-hidden="true">
          <Icon name="book" size={20} />
        </span>
        <span className="sidebar__title">Cloud Novel</span>
      </div>

      <nav className="sidebar__nav" aria-label="Primary navigation">
        <ul className="sidebar__nav-list" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavItem {...item} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <span className="sidebar__version">Stored on this device</span>
      </div>
    </aside>
  );
}
