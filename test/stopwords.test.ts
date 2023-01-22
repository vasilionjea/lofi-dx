import {
  getStopwords,
  hasStopword,
  addStopwords,
  isStopword,
  stripStopwords,
} from '../src/stopwords';

describe('Stopwords', () => {
  test('it should have default stopwords', () => {
    expect(hasStopword('the')).toBe(true);
    expect(getStopwords()).toBeInstanceOf(Array);
    expect(getStopwords().includes('the')).toBe(true);
  });

  test('it should allow additional stopwords', () => {
    expect(hasStopword('foo')).toBe(false);
    expect(hasStopword('bar')).toBe(false);

    addStopwords(['foo', 'bar']);
    expect(hasStopword('foo')).toBe(true);
    expect(hasStopword('bar')).toBe(true);

    try {
      addStopwords();
    } catch (err) {
      expect(err).toBeInstanceOf(TypeError);
    }
  });

  test('it should return true for stopwords or non-word characters', () => {
    expect(isStopword('the')).toBe(true);
    expect(isStopword('is')).toBe(true);
    expect(isStopword('@&$^%*')).toBe(true);
  });

  test('it removes stopwords from text', () => {
    expect(stripStopwords('it is the thing')).toEqual('thing');
    expect(stripStopwords('the thing it is')).toEqual('thing');
  });
});
