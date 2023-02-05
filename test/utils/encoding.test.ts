import { encodePositions, decodePositions } from '../../src/utils/encoding';

describe('Encoding utils', () => {
  test('[encodePositions] it should encode sorted numbers to their deltas', () => {
    const original = [
      18, 41, 105, 444, 1048, 1087, 1285, 1290, 1319, 1396, 1886,
    ];
    const encoded = [
      'i',
      'n',
      '1s',
      '9f',
      'gs',
      '13',
      '5i',
      '5',
      't',
      '25',
      'dm',
    ];
    expect(encodePositions(original)).toEqual(encoded);
    expect(original).toBe(original); // it didn't modify array
    expect(encodePositions([])).toEqual([]); // empty input
  });

  test('[decodePositions] it should decode deltas to the original sorted numbers', () => {
    const encoded = [
      'i',
      'n',
      '1s',
      '9f',
      'gs',
      '13',
      '5i',
      '5',
      't',
      '25',
      'dm',
    ];
    const original = [
      18, 41, 105, 444, 1048, 1087, 1285, 1290, 1319, 1396, 1886,
    ];
    expect(decodePositions(encoded)).toEqual(original);
    expect(encoded).toBe(encoded); // it didn't modify array
    expect(decodePositions([])).toEqual([]); // empty input
  });
});
