import { add } from '../src/utils';

test('it adds numbers', () => {
  const value = add(2, 2, 6);
  expect(value).toBe(10);
});
