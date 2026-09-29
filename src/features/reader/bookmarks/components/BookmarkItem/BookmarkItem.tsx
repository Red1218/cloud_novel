import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Bookmark } from '../../types';
import './BookmarkItem.css';

interface BookmarkItemProps {
  bookmark: Bookmark;
  /** Whether this bookmark is on the page currently being read. */
  isCurrent: boolean;
  onSelect: (page: number) => void;
  onRemove: (bookmarkId: string) => void;
  /** Called with the new label; an empty label clears it. */
  onRename: (bookmarkId: string, label: string) => void;
}

const LABEL_MAX_LENGTH = 80;
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

/**
 * Renders a single bookmark entry within the BookmarkPanel.
 *
 * Rename is inline: Enter or blur saves, Escape cancels.
 */
export function BookmarkItem({ bookmark, isCurrent, onSelect, onRemove, onRename }: BookmarkItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const renameButtonRef = useRef<HTMLButtonElement>(null);
  // Guards against a second save when the input blurs as it unmounts.
  const isFinishedRef = useRef(false);
  const restoreFocusRef = useRef(false);

  const pageLabel = `Page ${bookmark.page}`;
  const date = dateFormat.format(bookmark.createdAt);

  useEffect(() => {
    if (!isEditing && restoreFocusRef.current) {
      restoreFocusRef.current = false;
      renameButtonRef.current?.focus();
    }
  }, [isEditing]);

  const startEditing = (): void => {
    isFinishedRef.current = false;
    setIsEditing(true);
  };

  /** Ends editing; `value` null cancels, otherwise saves if it changed. */
  const finishEditing = (value: string | null, restoreFocus: boolean): void => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    restoreFocusRef.current = restoreFocus;
    setIsEditing(false);
    if (value !== null && value.trim() !== (bookmark.label ?? '')) {
      onRename(bookmark.id, value);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();
      finishEditing(event.currentTarget.value, true);
    } else if (event.key === 'Escape') {
      // Keep Escape from also closing the panel.
      event.stopPropagation();
      finishEditing(null, true);
    }
  };

  return (
    <li className={`bookmark-item ${isCurrent ? 'bookmark-item--current' : ''}`}>
      {isEditing ? (
        <input
          className="bookmark-item__input"
          type="text"
          defaultValue={bookmark.label ?? ''}
          placeholder={pageLabel}
          maxLength={LABEL_MAX_LENGTH}
          aria-label={`Name for bookmark on ${pageLabel.toLowerCase()}`}
          autoFocus
          onFocus={(event) => event.currentTarget.select()}
          onKeyDown={handleKeyDown}
          onBlur={(event) => finishEditing(event.currentTarget.value, false)}
        />
      ) : (
        <>
          <button
            type="button"
            className="bookmark-item__main"
            onClick={() => onSelect(bookmark.page)}
            aria-current={isCurrent ? 'page' : undefined}
          >
            <span className="bookmark-item__title">{bookmark.label ?? pageLabel}</span>
            <span className="bookmark-item__meta">
              {bookmark.label ? `${pageLabel} · ${date}` : date}
            </span>
          </button>
          <button
            ref={renameButtonRef}
            type="button"
            className="bookmark-item__action"
            onClick={startEditing}
            aria-label={`Rename bookmark on ${pageLabel.toLowerCase()}`}
            title="Rename bookmark"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <button
            type="button"
            className="bookmark-item__action"
            onClick={() => onRemove(bookmark.id)}
            aria-label={`Remove bookmark on ${pageLabel.toLowerCase()}`}
            title="Remove bookmark"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
            </svg>
          </button>
        </>
      )}
    </li>
  );
}
