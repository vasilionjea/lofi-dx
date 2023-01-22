export function isNone(obj: unknown): boolean {
  return obj === null || obj === undefined;
}

export function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

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
  ['[object Date]', 'date'],
  ['[object RegExp]', 'regexp'],
  ['[object Symbol]', 'symbol'],
  ['[object Error]', 'error'],
]);

export function typeOf(obj: unknown): string {
  const key = Object.prototype.toString.call(obj);
  return JsTypesMap.get(key) || '';
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
 * Removes and returns array item or undefined if not found.
 */
export function removeArrayItem<T = unknown>(arr: T[], item: T): T | undefined {
  let foundItem;

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === item) {
      foundItem = arr.splice(i, 1)[0];
      break;
    }
  }

  return foundItem;
}
