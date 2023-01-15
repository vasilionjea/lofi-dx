import {
  hasOwnProperty,
  isNone,
  typeOf,
  objectIntersection,
  unquote,
  stripModifiers,
  collapseWhitespace,
  isBlank,
  isStopWord,
  stripStopWords,
  spliceItem,
  deltaEncode,
  deltaDecode,
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

test(`[typeOf] it should return an object's JavaScript type`, () => {
  expect(typeOf(null)).toBe('null');
  expect(typeOf(undefined)).toBe('undefined');
  expect(typeOf(false)).toBe('boolean');
  expect(typeOf(true)).toBe('boolean');
  expect(typeOf('foo bar')).toBe('string');
  expect(typeOf(10)).toBe('number');

  expect(typeOf([])).toBe('array');
  expect(typeOf(new Set())).toBe('set');

  expect(typeOf({})).toBe('object');
  expect(typeOf(new Map())).toBe('map');

  const fn = () => 0;
  expect(typeOf(fn)).toBe('function');

  expect(typeOf(new Date())).toBe('date');
  expect(typeOf(new RegExp(''))).toBe('regexp');
  expect(typeOf(/./g)).toBe('regexp');
  expect(typeOf(Symbol('id'))).toBe('symbol');
  expect(typeOf(new Error('oh no'))).toBe('error');
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

test('[isBlank] it should return true when string is empty or only whitespace', () => {
  expect(isBlank('')).toBe(true);
  expect(isBlank(' ')).toBe(true);
  expect(isBlank('   ')).toBe(true);
  expect(isBlank('foo')).toBe(false);
  expect(isBlank('  foo  ')).toBe(false);
});

test('[isStopWord] it should return true for stopwords or non-word characters', () => {
  expect(isStopWord('the')).toBe(true);
  expect(isStopWord('is')).toBe(true);
  expect(isStopWord('@&$^%*')).toBe(true);
});

test('[stripStopWords] it removes stopwords from text', () => {
  expect(stripStopWords('it is the thing')).toEqual('thing');
  expect(stripStopWords('the thing it is')).toEqual('thing');
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

test('[collapseWhitespace] it removes quotes from text', () => {
  expect(collapseWhitespace(' +modifier')).toEqual('+modifier');
  expect(collapseWhitespace('  "thing" ')).toEqual(`"thing"`);
  expect(collapseWhitespace(`  -"quoted   modifier" `)).toEqual(
    `-"quoted modifier"`
  );
});

test('[spliceItem] it should find and return an array item, mutating existing array', () => {
  const arr = [1, 2, 3, 4, 5];
  const item = spliceItem(arr, 4);
  expect(item).toBe(4);
  expect(arr.length).toBe(4);
  expect(arr.indexOf(4)).toBe(-1);
});

test('[deltaEncode] it should encode sorted numbers to their deltas', () => {
  const original = [18, 41, 105, 444, 1048, 1087, 1285, 1290, 1319, 1396, 1886];
  const encoded = [18, 23, 64, 339, 604, 39, 198, 5, 29, 77, 490];
  expect(deltaEncode(original)).toEqual(encoded);
  expect(original).toBe(original); // it didn't modify array
});

test('[deltaDecode] it should decode deltas to the original sorted numbers', () => {
  const encoded = [18, 23, 64, 339, 604, 39, 198, 5, 29, 77, 490];
  const original = [18, 41, 105, 444, 1048, 1087, 1285, 1290, 1319, 1396, 1886];
  expect(deltaDecode(encoded)).toEqual(original);
  expect(encoded).toBe(encoded); // it didn't modify array
});
