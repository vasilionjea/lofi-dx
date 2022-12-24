import { isNone, unquote, stripModifiers, stripWhitespace } from '../src/utils';

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
