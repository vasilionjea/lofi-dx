import { unquote, stripModifiers } from '../src/tokenizer-utils';

test('[unquote] it removes quotes from text', () => {
  expect(unquote(`"ux engineer"`)).toEqual('ux engineer');
  expect(unquote(`-"ux engineer"`)).toEqual('-ux engineer');
});

test('[stripModifiers] it removes quotes from text', () => {
  expect(stripModifiers('-thing')).toEqual('thing');
  expect(stripModifiers('--thing')).toEqual('thing');

  expect(stripModifiers('-"quoted thing"')).toEqual('"quoted thing"');
  expect(stripModifiers('--"quoted thing"')).toEqual('"quoted thing"');
});
