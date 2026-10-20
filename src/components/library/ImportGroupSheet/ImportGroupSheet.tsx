import { useEffect, useMemo, useRef, useState } from 'react';
import type { Book } from '@/types/book';
import type { CollectionsUpdate } from '@/repositories/BookRepository';
import { allGenres, guessSeries } from '@/features/library/utils/collections';
import '../BookCollectionsSheet/BookCollectionsSheet.css';
import './ImportGroupSheet.css';

export interface ImportGroupSheetProps {
  /** The books the import just added. */
  added: readonly Book[];
  /** The whole library (series can include books imported earlier). */
  books: readonly Book[];
  onApply: (updates: { id: string; update: CollectionsUpdate }[]) => void;
  onClose: () => void;
}

/**
 * Shown after importing several books: series guessed from titles (accept
 * or reject each), the author groups made from PDF details, and an optional
 * genre for all of them. Nothing changes until Done.
 */
export function ImportGroupSheet({ added, books, onApply, onClose }: ImportGroupSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const guesses = useMemo(() => guessSeries(books, added), [books, added]);
  const genreOptions = useMemo(() => allGenres(books), [books]);
  const authors = useMemo(() => {
    const counts = new Map<string, number>();
    for (const book of added) if (book.author) counts.set(book.author, (counts.get(book.author) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [added]);
  const withoutAuthor = added.filter((b) => !b.author).length;

  const [decisions, setDecisions] = useState<Record<string, 'yes' | 'no'>>({});
  const [genres, setGenres] = useState<string[]>([]);
  const [extraGenres, setExtraGenres] = useState<string[]>([]);
  const [newGenre, setNewGenre] = useState('');

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const toggleGenre = (genre: string) =>
    setGenres((current) => (current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre]));

  const addGenre = () => {
    const genre = newGenre.trim();
    if (!genre) return;
    if (!genreOptions.includes(genre) && !extraGenres.includes(genre)) setExtraGenres([...extraGenres, genre]);
    if (!genres.includes(genre)) setGenres([...genres, genre]);
    setNewGenre('');
  };

  const apply = () => {
    const updates = new Map<string, CollectionsUpdate>();
    for (const guess of guesses) {
      if (decisions[guess.name] !== 'yes') continue;
      for (const { book, number } of guess.books) {
        updates.set(book.id, { series: { name: guess.name, number } });
      }
    }
    if (genres.length > 0) {
      for (const book of added) {
        const merged = [...new Set([...(book.genres ?? []), ...genres])];
        updates.set(book.id, { ...updates.get(book.id), genres: merged });
      }
    }
    onApply([...updates].map(([id, update]) => ({ id, update })));
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="collections-sheet"
      aria-labelledby="import-group-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="collections-sheet__panel">
        <span className="collections-sheet__handle" aria-hidden="true" />

        <div>
          <h2 id="import-group-title" className="import-group__title">
            {added.length} books added
          </h2>
          <p className="collections-sheet__subtitle">Some ways to group them. Nothing changes until you choose Done.</p>
        </div>

        {guesses.map((guess) => {
          const decision = decisions[guess.name];
          return (
            <section key={guess.name} className="import-group__card" aria-label={`Series suggestion: ${guess.name}`}>
              <h3 className="import-group__card-title">Looks like a series: {guess.name}</h3>
              <p className="collections-sheet__hint">Numbers found in the titles</p>
              <ol className="import-group__list">
                {guess.books.map(({ book, number }) => (
                  <li key={book.id}>
                    <span className="import-group__number" aria-hidden="true">{number}</span>
                    <span className="import-group__book">{book.title}</span>
                  </li>
                ))}
              </ol>
              {decision ? (
                <p role="status" className="import-group__decided">
                  {decision === 'yes' ? `Will become the series "${guess.name}".` : 'Left as separate books.'}{' '}
                  <button
                    type="button"
                    className="import-group__undo"
                    onClick={() => setDecisions(({ [guess.name]: _, ...rest }) => rest)}
                  >
                    Undo
                  </button>
                </p>
              ) : (
                <div className="import-group__choices">
                  <button type="button" className="pill pill--filled" onClick={() => setDecisions({ ...decisions, [guess.name]: 'yes' })}>
                    Make it a series
                  </button>
                  <button type="button" className="pill collections-sheet__chip" onClick={() => setDecisions({ ...decisions, [guess.name]: 'no' })}>
                    Not a series
                  </button>
                </div>
              )}
            </section>
          );
        })}

        <section className="import-group__card" aria-labelledby="import-group-authors">
          <h3 id="import-group-authors" className="import-group__card-title">Grouped by author</h3>
          <p className="collections-sheet__hint">Done for you from the PDF details</p>
          {authors.length > 0 && (
            <ul className="import-group__authors">
              {authors.map(([name, count]) => (
                <li key={name}>
                  <span>{name}</span>
                  <span className="collections-sheet__option-meta">{count} {count === 1 ? 'book' : 'books'}</span>
                </li>
              ))}
            </ul>
          )}
          {withoutAuthor > 0 && (
            <p className="collections-sheet__hint">
              {withoutAuthor === 1 ? '1 book has' : `${withoutAuthor} books have`} no author. Add one from the book's Collections button in the Library.
            </p>
          )}
        </section>

        <fieldset className="import-group__card collections-sheet__group">
          <legend className="import-group__card-title">A genre for all {added.length}?</legend>
          <p className="collections-sheet__hint">Optional. You can also set genres book by book later.</p>
          <div className="collections-sheet__chips">
            {[...genreOptions, ...extraGenres].map((genre) => (
              <button
                key={genre}
                type="button"
                className="pill collections-sheet__chip"
                aria-pressed={genres.includes(genre)}
                onClick={() => toggleGenre(genre)}
              >
                {genres.includes(genre) ? `✓ ${genre}` : genre}
              </button>
            ))}
          </div>
          <form
            className="collections-sheet__new-genre"
            onSubmit={(e) => {
              e.preventDefault();
              addGenre();
            }}
          >
            <input
              type="text"
              className="collections-sheet__input"
              aria-label="New genre"
              placeholder="New genre, e.g. Mystery"
              value={newGenre}
              onChange={(e) => setNewGenre(e.target.value)}
            />
            <button type="submit" className="pill pill--outline" disabled={!newGenre.trim()}>Add</button>
          </form>
        </fieldset>

        <div className="import-group__footer">
          <button type="button" className="collections-sheet__text-btn" onClick={onClose}>Skip</button>
          <button type="button" className="pill pill--filled import-group__done" onClick={apply}>Done</button>
        </div>
      </div>
    </dialog>
  );
}

/**
 * Opens the grouping sheet after an import that added two or more books.
 * Render it on any page that has an Import button.
 */
export function ImportGroupPrompt({
  books,
  lastImportedIds,
  onApply,
  onClose,
}: {
  books: readonly Book[];
  lastImportedIds: readonly string[];
  onApply: ImportGroupSheetProps['onApply'];
  onClose: () => void;
}) {
  const added = useMemo(() => books.filter((b) => lastImportedIds.includes(b.id)), [books, lastImportedIds]);
  if (added.length < 2) return null;
  return <ImportGroupSheet added={added} books={books} onApply={onApply} onClose={onClose} />;
}
