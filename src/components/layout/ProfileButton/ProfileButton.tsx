import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useSync, type DriveAccount } from '@/features/sync/sync';
import './ProfileButton.css';

const STATUS_LABEL = { synced: 'synced', syncing: 'syncing', error: "sync failed" } as const;

function initials(account: DriveAccount): string {
  const parts = account.name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/** The account's face, or its initials. Shared by the top-right button and the profile page. */
export function Avatar({ account, size }: { account: DriveAccount; size: number }) {
  return account.photoUrl ? (
    <img className="avatar" src={account.photoUrl} alt="" width={size} height={size} referrerPolicy="no-referrer" />
  ) : (
    <span className="avatar avatar--initials" style={{ width: size, height: size, fontSize: size * 0.4 }} aria-hidden="true">
      {initials(account)}
    </span>
  );
}

/** Top right on Home and Library: opens the profile, and shows the sync status once signed in. */
export function ProfileButton() {
  const { account, status } = useSync();

  if (!account) {
    return (
      <Link to={ROUTES.PROFILE} className="profile-button profile-button--signed-out" aria-label="Profile, signed out">
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <circle cx="12" cy="8.5" r="3.5" />
          <path d="M5 19.5c1.2-3.2 3.8-5 7-5s5.8 1.8 7 5" />
        </svg>
      </Link>
    );
  }

  return (
    <Link
      to={ROUTES.PROFILE}
      className={`profile-button profile-button--signed-in profile-button--${status.kind}`}
      aria-label={`Profile, ${STATUS_LABEL[status.kind]}`}
    >
      <Avatar account={account} size={40} />
      <span className="profile-button__dot" aria-hidden="true" />
    </Link>
  );
}
