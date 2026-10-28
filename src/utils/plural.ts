/** "1 book", "3 books". */
export const plural = (n: number, word: string) => `${n} ${n === 1 ? word : `${word}s`}`;
