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

  test('[collapseWhitespace] it collapses multiple whitespace chars', () => {
    expect(collapseWhitespace(' +modifier')).toEqual('+modifier');
    expect(collapseWhitespace('  "thing" ')).toEqual('"thing"');
    expect(collapseWhitespace('  -"quoted   modifier" ')).toEqual(
      '-"quoted modifier"'
    );
    expect(collapseWhitespace('    ')).toEqual('');
    expect(collapseWhitespace('')).toEqual('');
    expect(collapseWhitespace()).toEqual('');
  });

  test('[unquote] it removes quotes from text', () => {
    expect(unquote('"ux engineer"')).toEqual('ux engineer');
    expect(unquote('-"ux engineer"')).toEqual('-ux engineer');
    expect(unquote('+"ux engineer"')).toEqual('+ux engineer');
    expect(unquote('""')).toEqual('');
    expect(unquote('"')).toEqual('');
    expect(unquote()).toEqual('');
  });

  test('[stripModifiers] it removes prefix modifiers from text', () => {
    expect(stripModifiers('-thing')).toEqual('thing');
    expect(stripModifiers('--thing')).toEqual('thing');
    expect(stripModifiers('-"quoted thing"')).toEqual('"quoted thing"');
    expect(stripModifiers('--"quoted thing"')).toEqual('"quoted thing"');

    expect(stripModifiers('+thing')).toEqual('thing');
    expect(stripModifiers('++thing')).toEqual('thing');
    expect(stripModifiers('+"quoted thing"')).toEqual('"quoted thing"');
    expect(stripModifiers('++"quoted thing"')).toEqual('"quoted thing"');

    // Only strip from prefixes
    expect(stripModifiers('foo-bar')).toEqual('foo-bar');
    expect(stripModifiers('-foo+bar')).toEqual('foo+bar');
    expect(stripModifiers('foo+bar')).toEqual('foo+bar');
    expect(stripModifiers('+foo+bar')).toEqual('foo+bar');

    expect(stripModifiers('-')).toEqual('');
    expect(stripModifiers('+')).toEqual('');
    expect(stripModifiers('')).toEqual('');
    expect(stripModifiers()).toEqual('');
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
