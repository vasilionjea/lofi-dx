import {
  isNone,
  hasOwn,
  typeOf,
  objectIntersection,
  objectDifference,
  deleteArrayItem,
} from '../../src/utils/core';

describe('Core utils', () => {
  test('[isNone] it returns true only when value is null or undefined', () => {
    expect(isNone(undefined)).toBe(true);
    expect(isNone(null)).toBe(true);

    expect(isNone(false)).toBe(false);
    expect(isNone(0)).toBe(false);
    expect(isNone('')).toBe(false);
  });

  test('[hasOwn] it returns true for own props otherwise false', () => {
    const obj = { foo: 'foo' };
    expect(hasOwn(obj, 'foo')).toBe(true);
    expect(hasOwn(obj, 'toString')).toBe(false);
  });

  test(`[typeOf] it should return an object's JavaScript type`, () => {
    expect(typeOf(null)).toBe('null');
    expect(typeOf(undefined)).toBe('undefined');
    expect(typeOf(false)).toBe('boolean');
    expect(typeOf(true)).toBe('boolean');
    expect(typeOf('foo bar')).toBe('string');
    expect(typeOf('')).toBe('string');
    expect(typeOf(10)).toBe('number');

    expect(typeOf([])).toBe('array');
    expect(typeOf(new Set())).toBe('set');

    expect(typeOf({})).toBe('object');
    expect(typeOf(new Map())).toBe('map');

    const fn = () => 0;
    expect(typeOf(fn)).toBe('function');

    expect(typeOf(new RegExp(''))).toBe('regexp');
    expect(typeOf(/./g)).toBe('regexp');
    expect(typeOf(new Error('oh no'))).toBe('error');

    // Random unsupported object
    expect(typeOf(new ArrayBuffer(0))).toBe('');
  });

  test('[objectIntersection] it should return key-value pairs found in both objects', () => {
    const first = { foo: 'foo', bar: 'bar' };
    const second = { biz: 'biz', bar: 'bar' };
    const intersection = objectIntersection(first, second);
    const intersectionKeys = Object.keys(intersection);

    expect(intersectionKeys.length).toBe(1);
    expect(intersectionKeys[0]).toBe('bar');
    expect(intersection).toMatchObject({ bar: 'bar' });
  });

  test('[objectDifference] it should return key-value pairs not present in the second object', () => {
    const first = { foo: 'foo', bar: 'bar' };
    const second = { biz: 'biz', bar: 'bar' };
    const diff = objectDifference(first, second);
    const diffKeys = Object.keys(diff);

    expect(diffKeys.length).toBe(1);
    expect(diffKeys[0]).toBe('foo');
    expect(diff).toMatchObject({ foo: 'foo' });
  });

  test('[deleteArrayItem] it should delete and return array item mutating the array', () => {
    const arr = [1, 2, 3, 4, 5];
    const item = deleteArrayItem(arr, 4);
    expect(item).toBe(4);
    expect(arr.length).toBe(4);
    expect(arr.indexOf(4)).toBe(-1);
  });
});
