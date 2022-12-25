import { STOPWORDS_MAP } from './stopwords';

export function hasOwnProperty(obj: object, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function isNone(obj: unknown): boolean {
  return obj === null || obj === undefined;
}

export function unquote(text = '') {
  return text.replace(/["]/g, '');
}

export function stripModifiers(text = '') {
  return text.replace(/^([-+]+)/, '');
}

export function stripWhitespace(text = '') {
  return text
    .trim()
    .split(/(?:\s+)/g)
    .join(' ');
}

/**
 * Returns values that are in both the `first` and
 * the `second` object.
 */
export function objectIntersection(
  first: Record<string, unknown>,
  second: Record<string, unknown>
) {
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(first)) {
    if (hasOwnProperty(second, key)) {
      result[key] = first[key];
    }
  }

  return result;
}

/**
 * True if a token's text is a stopword, or it contains
 * only non word characters.
 */
export function isStopWord(word: string) {
  return Boolean(STOPWORDS_MAP[word]) || !word.match(/(\w+)/g);
}
