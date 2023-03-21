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

export function isNumber(obj: unknown): boolean {
  return !Number.isNaN(obj as number) && typeOf(obj) === 'number';
}

export function isString(obj: unknown): boolean {
  return typeOf(obj) === 'string';
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
export function deepClone<T>(obj: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  } else {
    return JSON.parse(JSON.stringify(obj)) as T;
  }
}

/**
 * Binary search for sorted list of numbers. Returns the index of an item if
 * it is found, or it will return `-1` if nothing was found.
 */
export function binarySearch<T>(arr: T[], item: T): number {
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
    return mid;
  }

  return -1;
}

/**
 * Deletes and returns array item (mutates array).
 */
export function deleteArrayItem<T>(arr: T[], item: T): T | undefined {
  const foundIndex = binarySearch(arr, item);

  if (foundIndex !== -1) {
    return arr.splice(foundIndex, 1)[0];
  }
}
