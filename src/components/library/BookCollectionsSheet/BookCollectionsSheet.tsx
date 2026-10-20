import { useEffect, useMemo, useRef, useState } from 'react';
import type { Book } from '@/types/book';
import type { CollectionsUpdate } from '@/repositories/BookRepository';
import { allGenres, deriveCollections } from '@/features/library/utils/collections';
import './BookCollectionsSheet.css';

const NEW_SERIES = '\u0000new';

export interface BookCollectionsSheetProps {
  book: Book;
  /** The whole library, for the existing series and genres to choose from. */
  books: readonly Book[];
  onSave: (update: CollectionsUpdate) => void;
  onClose: () => void;
}

/**
 * Sheet for one book's collections: at most one series (with its number in
 * it), the author, and any number of genres. Nothing is saved until Done.
 */
export function BookCollectionsSheet({ book, books, onSave, onClose }: BookCollectionsSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const series = useMemo(
    () => deriveCollections(books).filter((c) => c.kind === 'series'),
    [books]
  );
  const genreOptions = useMemo(
    () => [...new Set([...allGenres(books), ...(book.genres ?? [])])].sort((a, b) => a.localeCompare(b)),
    [books, book.genres]
  );

  const [seriesChoice, setSeriesChoice] = useState(book.series?.name ?? '');
  const [newSeriesName, setNewSeriesName] = useState('');
  const [number, setNumber] = useState(book.series?.number ?? 1);
  const [author, setAuthor] = useState(book.author ?? '');
  const [genres, setGenres] = useState<string[]>(book.genres ?? []);
  const [extraGenres, setExtraGenres] = useState<string[]>([]);
  const [newGenre, setNewGenre] = useState('');

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const chooseSeries = (name: string) => {
    setSeriesChoice(name);
    if (name === book.series?.name) {
      setNumber(book.series.number);
      return;
    }
    // Joining a series: go after its last book.
    const members = series.find((s) => s.name === name)?.books ?? [];
    setNumber(Math.max(0, ...members.map((b) => b.series?.number ?? 0)) + 1);
  };

  const toggleGenre = (genre: string) =>
    setGenres((current) => (current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre]));

  const addGenre = () => {
    const genre = newGenre.trim();
    if (!genre) return;
    if (!genreOptions.includes(genre) && !extraGenres.includes(genre)) setExtraGenres([...extraGenres, genre]);
    if (!genres.includes(genre)) setGenres([...genres, genre]);
    setNewGenre('');
  };

  const seriesName = seriesChoice === NEW_SERIES ? newSeriesName.trim() : seriesChoice;

  const save = () => {
    onSave({
      author,
      series: seriesName ? { name: seriesName, number } : null,
      genres,
    });
    onClose();
  };

  const authorHint = !author.trim()
    ? 'No author: the book shows under "No author" until you add one.'
    : author.trim() === book.author
      ? 'From the PDF details. Change it and the book moves to that author.'
      : `The book will group under ${author.trim()}.`;

  return (
    <dialog
      ref={dialogRef}
      className="collections-sheet"
      aria-labelledby="collections-sheet-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="collections-sheet__panel">
        <span className="collections-sheet__handle" aria-hidden="true" />

        <header className="collections-sheet__header">
          <div className="collections-sheet__heading">
            <h2 id="collections-sheet-title" className="collections-sheet__title">{book.title}</h2>
            <p className="collections-sheet__subtitle">Collections for this book</p>
          </div>
          <button type="button" className="collections-sheet__text-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="pill pill--filled collections-sheet__done" onClick={save}>Done</button>
        </header>

        <fieldset className="collections-sheet__group">
          <legend className="paper-eyebrow">Series · one per book</legend>
          <label className="collections-sheet__option">
            <input type="radio" name="series" checked={seriesChoice === ''} onChange={() => chooseSeries('')} />
            <span>Not in a series</span>
          </label>
          {series.map((s) => (
            <label key={s.name} className="collections-sheet__option">
              <input type="radio" name="series" checked={seriesChoice === s.name} onChange={() => chooseSeries(s.name)} />
              <span>{s.name}</span>
              <span className="collections-sheet__option-meta">
                {s.books.length} {s.books.length === 1 ? 'book' : 'books'}
              </span>
            </label>
          ))}
          <label className="collections-sheet__option">
            <input type="radio" name="series" checked={seriesChoice === NEW_SERIES} onChange={() => chooseSeries(NEW_SERIES)} />
            <span>New series…</span>
          </label>
          {seriesChoice === NEW_SERIES && (
            <input
              type="text"
              className="collections-sheet__input"
              aria-label="New series name"
              placeholder="Series name"
              value={newSeriesName}
              onChange={(e) => setNewSeriesName(e.target.value)}
              autoFocus
            />
          )}
          {seriesChoice !== '' && (
            <div className="collections-sheet__number">
              <span id="book-number-label">Book number</span>
              <div className="collections-sheet__stepper" role="group" aria-labelledby="book-number-label">
                <button type="button" aria-label="Lower book number" onClick={() => setNumber((n) => Math.max(1, n - 1))}>−</button>
                <span aria-live="polite">{number}</span>
                <button type="button" aria-label="Raise book number" onClick={() => setNumber((n) => n + 1)}>+</button>
              </div>
            </div>
          )}
        </fieldset>

        <div className="collections-sheet__group">
          <label htmlFor="collections-author" className="paper-eyebrow">Author</label>
          <input
            id="collections-author"
            type="text"
            className="collections-sheet__input"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <p className="collections-sheet__hint">{authorHint}</p>
        </div>

        <fieldset className="collections-sheet__group">
          <legend className="paper-eyebrow">Genres · as many as you like</legend>
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
      </div>
    </dialog>
  );
}
