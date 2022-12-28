import { STOPWORDS_MAP } from './stopwords';

/**
 * Object utils
 * -------------
 */
export function hasOwnProperty(obj: object, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function isNone(obj: unknown): boolean {
  return obj === null || obj === undefined;
}

/**
 * JS type utils
 * --------------
 */
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
 * String utils
 * -------------
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
