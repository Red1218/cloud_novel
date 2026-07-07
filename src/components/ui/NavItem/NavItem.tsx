import { NavLink } from 'react-router-dom';
import type { NavItemConfig } from '@/types';
import './NavItem.css';

type NavItemProps = NavItemConfig;

/**
 * A single sidebar navigation link.
 * Uses React Router's NavLink to automatically apply active styles.
 *
 * The `end` prop is set only for the root path ("/") to prevent
 * it from matching all routes as "active".
 */
export function NavItem({ label, path, icon, ariaLabel }: NavItemProps) {
  return (
    <NavLink
      to={path}
      end={path === '/'}
      aria-label={ariaLabel ?? label}
      className={({ isActive }) =>
        isActive ? 'nav-item nav-item--active' : 'nav-item'
      }
    >
      <span className="nav-item__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="nav-item__label">{label}</span>
    </NavLink>
  );
}
