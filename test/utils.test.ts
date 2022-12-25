import {
  hasOwnProperty,
  isNone,
  unquote,
  stripModifiers,
  stripWhitespace,
  objectIntersection,
  isStopWord,
} from '../src/utils';

test('[hasOwnProperty] it returns true for own props otherwise false', () => {
  const obj = { foo: 'foo' };
  expect(hasOwnProperty(obj, 'foo')).toBe(true);
  expect(hasOwnProperty(obj, 'toString')).toBe(false);
});

test('[isNone] it returns true only when value is null or undefined', () => {
  expect(isNone(undefined)).toBe(true);
  expect(isNone(null)).toBe(true);

  expect(isNone(false)).toBe(false);
  expect(isNone(0)).toBe(false);
  expect(isNone('')).toBe(false);
});

test('[unquote] it removes quotes from text', () => {
  expect(unquote(`"ux engineer"`)).toEqual('ux engineer');
  expect(unquote(`-"ux engineer"`)).toEqual('-ux engineer');
  expect(unquote(`+"ux engineer"`)).toEqual('+ux engineer');
});

test('[stripModifiers] it removes quotes from text', () => {
  expect(stripModifiers('-thing')).toEqual('thing');
  expect(stripModifiers('--thing')).toEqual('thing');
  expect(stripModifiers('-"quoted thing"')).toEqual('"quoted thing"');
  expect(stripModifiers('--"quoted thing"')).toEqual('"quoted thing"');

  expect(stripModifiers('+thing')).toEqual('thing');
  expect(stripModifiers('++thing')).toEqual('thing');
  expect(stripModifiers('+"quoted thing"')).toEqual('"quoted thing"');
  expect(stripModifiers('++"quoted thing"')).toEqual('"quoted thing"');
});

test('[stripWhitespace] it removes quotes from text', () => {
  expect(stripWhitespace(' +modifier')).toEqual('+modifier');
  expect(stripWhitespace('  "thing" ')).toEqual(`"thing"`);
  expect(stripWhitespace(`  -"quoted   modifier" `)).toEqual(
    `-"quoted modifier"`
  );
});

test('[objectIntersection] it should return values that intersect', () => {
  const first = { foo: 'foo', bar: 'bar' };
  const second = { biz: 'biz', bar: 'bar' };
  const intersection = objectIntersection(first, second);
  const intersectionKeys = Object.keys(intersection);

  expect(intersectionKeys.length).toBe(1);
  expect(intersectionKeys[0]).toBe('bar');
  expect(intersection).toMatchObject({ bar: 'bar' });
});

test('[isStopWord] it should return true for stopwords or non-word characters', () => {
  expect(isStopWord('the')).toBe(true);
  expect(isStopWord('is')).toBe(true);
  expect(isStopWord('@&$^%*')).toBe(true);
});
