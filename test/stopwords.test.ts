import stopwords from '../src/stopwords';

test('it should have stopwords', () => {
  expect(stopwords.has('the')).toBe(true);
  expect(stopwords.getAll()).toBeInstanceOf(Array);
  expect(stopwords.getAll().includes('the')).toBe(true);
});

test('it should allow additional stopwords', () => {
  expect(stopwords.has('foo')).toBe(false);
  expect(stopwords.has('bar')).toBe(false);

  stopwords.add(['foo', 'bar']);
  expect(stopwords.has('foo')).toBe(true);
  expect(stopwords.has('bar')).toBe(true);
});
