const JsTypesMap = new Map<string, string>([
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
  ['[object RegExp]', 'regexp'],
  ['[object Error]', 'error'],
]);

export function typeOf(obj: unknown): string {
  const key = Object.prototype.toString.call(obj);
  return JsTypesMap.get(key) || '';
}

export function isNone(obj: unknown): boolean {
  return obj === null || obj === undefined;
}

export function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Returns a result object with keys that are in both objects (non symmetrical).
 */
export function objectIntersection(
  first: Record<string, unknown>,
  second: Record<string, unknown>
) {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(first)) {
    if (hasOwn(second, key)) result[key] = first[key];
  }
  return result;
}

/**
 * Returns a result object with keys that aren't in the second object (non symmetrical).
 */
export function objectDifference(
  first: Record<string, unknown>,
  second: Record<string, unknown>
) {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(first)) {
    if (!hasOwn(second, key)) result[key] = first[key];
  }
  return result;
}

/**
 * Native deepclone or fallback to JSON stringify+parse.
 */
export function deepClone<T = unknown>(obj: T): T {
  if (structuredClone instanceof Function) {
    return structuredClone(obj);
  } else {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
}

/**
 * Deletes and returns array item using binary search (mutates array).
 */
export function bsDeleteItem<T = unknown>(arr: T[], item: T) {
  let start = 0;
  let end = arr.length - 1;
  let mid = Math.floor(end / 2);

  while (arr[mid] !== item && start < end) {
    if (item < arr[mid]) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }

    mid = Math.floor((start + end) / 2);
  }

  if (item === arr[mid]) {
    return arr.splice(mid, 1)[0];
  }
}
