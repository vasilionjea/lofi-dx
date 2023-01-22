import { STOPWORDS_MAP } from './stopwords';

/**
 * Object utils
 */
export function hasOwnProperty(obj: object, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function isNone(obj: unknown): boolean {
  return obj === null || obj === undefined;
}

const JsTypes = new Map<string, string>([
  ['[object Undefined]', 'undefined'],
  ['[object Null]', 'null'],
  ['[object Boolean]', 'boolean'],
  ['[object String]', 'string'],
  ['[object Number]', 'number'],
  ['[object Array]', 'array'],
  ['[object Set]', 'set'],
  ['[object Object]', 'object'],
  ['[object Map]', 'map'],
  ['[object Function]', 'function'],
  ['[object Date]', 'date'],
  ['[object RegExp]', 'regexp'],
  ['[object Symbol]', 'symbol'],
  ['[object Error]', 'error'],
]);

export function typeOf(obj: unknown): string {
  const key = Object.prototype.toString.call(obj);
  return JsTypes.get(key) || '';
}

// Returns a result object with keys that are in both objects
export function objectIntersection(
  first: Record<string, unknown>,
  second: Record<string, unknown>
) {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(first)) {
    if (hasOwnProperty(second, key)) result[key] = first[key];
  }
  return result;
}

// Returns a result object with keys that aren't in the second object
export function objectDifference(
  first: Record<string, unknown>,
  second: Record<string, unknown>
) {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(first)) {
    if (!hasOwnProperty(second, key)) result[key] = first[key];
  }
  return result;
}

/**
 * Array utils
 */
export function spliceItem<T = unknown>(arr: T[], val: T): T | undefined {
  let found;

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === val) {
      found = arr.splice(i, 1)[0];
      break;
    }
  }

  return found;
}

/**
 * Encodes term postings using delta and base36 encoding.
 */
export function encodePostings(nums: number[]): string[] {
  const result: string[] = [];
  if (!nums.length) return result;

  for (let i = 0; i < nums.length; i++) {
    const prev = nums[i - 1];
    const current = nums[i];

    if (i === 0) {
      result.push(current.toString(36));
    } else {
      const delta = current - prev;
      result.push(delta.toString(36));
    }
  }

  return result;
}

/**
 * Decodes postings from base36, then delta-decodes them.
 */
export function decodePostings(arr: string[]): number[] {
  const nums = arr.concat();
  const result: number[] = [];

  if (!nums.length) return result;

  let prev = parseInt(nums.shift() as string, 36);
  result.push(prev);

  for (const current of nums) {
    const n = prev + parseInt(current, 36);
    result.push(n);
    prev = n;
  }

  return result;
}

/**
 * String utils
 */
export function unquote(text = '') {
  return text.replace(/["]/g, '');
}

export function stripModifiers(text = '') {
  return text.replace(/^([-+]+)/, '');
}

export function collapseWhitespace(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

export function isBlank(text: string) {
  return !text || !/\S+/g.test(text);
}

// True if word is a stopword or it contains only non-word chars
export function isStopWord(word: string) {
  return Boolean(STOPWORDS_MAP[word]) || !word.match(/(\w+)/g);
}

/**
 * Removes stopwords from both queries and the index.
 * TODO: expose API to add additional stopwords.
 */
export function stripStopWords(text: string) {
  const result = [];

  for (const word of text.split(/\s+/g)) {
    if (isStopWord(word)) continue;
    result.push(word);
  }

  return result.join(' ');
}

/**
 * Not a stemmer. Just a simple default that only drops "s" from some plural words. Doesn't
 * touch words that end with 'ss', 'es' (e.g. grass, centuries, goes/trees). Used for both,
 * query words and index words. TODO: expose API for users to provide their own stemmer.
 */
const sSuffix = /s$/i;
const ssIesSuffix = /(ss|i?es)$/i;
export function stemmer(text: string): string {
  const result = [];

  for (const word of text.split(/\s+/g)) {
    if (sSuffix.test(word) && !ssIesSuffix.test(word)) {
      result.push(word.replace(sSuffix, ''));
    } else {
      result.push(word);
    }
  }

  return result.join(' ');
}
