import { isNone } from '../src/utils';

test('[isNone] it returns true only when value is null or undefined', () => {
  expect(isNone(undefined)).toBe(true);
  expect(isNone(null)).toBe(true);

  expect(isNone(false)).toBe(false);
  expect(isNone(0)).toBe(false);
  expect(isNone('')).toBe(false);
});
