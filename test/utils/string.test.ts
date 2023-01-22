import {
  isBlank,
  collapseWhitespace,
  unquote,
  stripModifiers,
  stemWord,
} from '../../src/utils/string';

describe('String utils', () => {
  test('[isBlank] it should return true when string is empty or only whitespace', () => {
    expect(isBlank('')).toBe(true);
    expect(isBlank(' ')).toBe(true);
    expect(isBlank('   ')).toBe(true);
    expect(isBlank('foo')).toBe(false);
    expect(isBlank('  foo  ')).toBe(false);
  });

  test('[collapseWhitespace] it removes quotes from text', () => {
    expect(collapseWhitespace(' +modifier')).toEqual('+modifier');
    expect(collapseWhitespace('  "thing" ')).toEqual(`"thing"`);
    expect(collapseWhitespace(`  -"quoted   modifier" `)).toEqual(
      `-"quoted modifier"`
    );
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

  test('[stemWord] it singularizes plurals ending with "s"', () => {
    expect(stemWord('pets')).toBe('pet');
    expect(stemWord('hello worlds')).toBe('hello world');

    expect(stemWord('the zones')).toBe('the zones');
    expect(stemWord('there she goes')).toBe('there she goes');
    expect(stemWord('the grass')).toBe('the grass');
    expect(stemWord('during pasts centuries')).toBe('during past centuries');
  });
});
