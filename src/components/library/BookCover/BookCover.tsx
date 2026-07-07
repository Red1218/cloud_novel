import './BookCover.css';

export interface BookCoverProps {
  /** Optional source URL for the cover image. If omitted, a placeholder renders. */
  src?: string;
  /** Title used for alt text or placeholder text */
  title: string;
}

/**
 * Reusable BookCover component.
 * Renders an image if src is provided, otherwise falls back to a styled placeholder.
 */
export function BookCover({ src, title }: BookCoverProps) {
  if (src) {
    return (
      <div className="book-cover book-cover--image">
        <img src={src} alt={`Cover for ${title}`} className="book-cover__img" loading="lazy" />
      </div>
    );
  }

  return (
    <div className="book-cover book-cover--placeholder">
      <div className="book-cover__placeholder-text" aria-hidden="true">
        {title}
      </div>
    </div>
  );
}
