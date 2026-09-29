import type { TextLayerHighlight } from '../types';

interface ItemHighlight {
  start: number;
  end: number;
  selected: boolean;
  /** Position within a match that spans several items (PDF.js classes). */
  part: 'whole' | 'begin' | 'middle' | 'end';
}

/**
 * Highlights matches inside a PDF.js text layer by wrapping the matched
 * characters of each text span in `<span class="highlight">`, using the
 * PDF.js text-layer styles. Only the transparent overlay changes; the
 * rendered page is untouched (ADR-002).
 *
 * Framework-agnostic: works on the TextLayer's `textDivs` and
 * `textContentItemsStr`, whose indexes match the search ranges.
 */
export class TextLayerHighlighter {
  private readonly textDivs: HTMLElement[];
  private readonly itemStrings: string[];
  private readonly touched = new Set<number>();

  constructor(textDivs: HTMLElement[], itemStrings: string[]) {
    this.textDivs = textDivs;
    this.itemStrings = itemStrings;
  }

  /**
   * Replaces any existing highlights with `highlights`.
   * Returns the first element of the selected match, if any.
   */
  apply(highlights: TextLayerHighlight[]): HTMLElement | null {
    this.clear();

    const byItem = new Map<number, ItemHighlight[]>();
    for (const { ranges, selected } of highlights) {
      ranges.forEach((range, i) => {
        const part = ranges.length === 1
          ? 'whole'
          : i === 0 ? 'begin' : i === ranges.length - 1 ? 'end' : 'middle';
        const list = byItem.get(range.itemIndex) ?? [];
        list.push({ start: range.start, end: range.end, selected, part });
        byItem.set(range.itemIndex, list);
      });
    }

    let selectedElement: HTMLElement | null = null;
    for (const [itemIndex, list] of byItem) {
      const div = this.textDivs[itemIndex];
      const text = this.itemStrings[itemIndex];
      if (!div || text === undefined) continue;

      list.sort((a, b) => a.start - b.start);
      div.textContent = '';
      let offset = 0;
      for (const h of list) {
        if (h.start < offset) continue; // overlapping; keep the first
        if (h.start > offset) div.append(text.slice(offset, h.start));
        const span = document.createElement('span');
        // "appended" keeps the nested span in flow (PDF.js text-layer CSS
        // positions every other text-layer span absolutely).
        span.className = h.part === 'whole' ? 'highlight appended' : `highlight appended ${h.part}`;
        if (h.selected) span.classList.add('selected');
        span.textContent = text.slice(h.start, h.end);
        div.append(span);
        if (h.selected && !selectedElement) selectedElement = span;
        offset = h.end;
      }
      if (offset < text.length) div.append(text.slice(offset));
      this.touched.add(itemIndex);
    }
    return selectedElement;
  }

  /** Restores every highlighted span to its plain text. */
  clear(): void {
    for (const itemIndex of this.touched) {
      const div = this.textDivs[itemIndex];
      if (div) div.textContent = this.itemStrings[itemIndex] ?? '';
    }
    this.touched.clear();
  }
}
