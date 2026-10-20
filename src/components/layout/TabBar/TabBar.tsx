import { NavLink } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon/Icon';
import { NAV_ITEMS } from '@/constants/navigation';
import './TabBar.css';

/**
 * Bottom navigation for tablets and phones (<1024px). Desktop uses the Sidebar.
 */
export function TabBar() {
  return (
    <nav className="tab-bar" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) => (isActive ? 'tab-bar__item tab-bar__item--active' : 'tab-bar__item')}
        >
          <Icon name={item.icon} size={22} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
