import { Token } from '../src/tokenizer';
import { Query, QueryParser } from '../src/parser';

test('it should parse tokens to a query object', () => {
  const tokens = [
    { type: 'PresenceTerm', text: '+frontend' },
    { type: 'Term', text: 'engineer' },
    { type: 'PresenceTerm', text: '-backend' },
    { type: 'ExactTerm', text: '"ux  engineer "' },
    { type: 'PresenceTerm', text: '-"full stack"' },
  ];
  const parser = new QueryParser(tokens as Token[]);
  const query: Query = parser.parse();

  expect(query.parts.length).toBe(5);

  expect(query.parts[0].term).toBe('frontend');
  expect(query.parts[0].required).toBe(true);
  expect(query.parts[0].negated).toBe(false);

  expect(query.parts[1].term).toBe('engineer');
  expect(query.parts[1].required).toBe(false);
  expect(query.parts[1].negated).toBe(false);

  expect(query.parts[2].term).toBe('backend');
  expect(query.parts[2].required).toBe(false);
  expect(query.parts[2].negated).toBe(true);

  expect(query.parts[3].term).toBe('ux engineer');
  expect(query.parts[3].required).toBe(false);
  expect(query.parts[3].negated).toBe(false);

  expect(query.parts[4].term).toBe('full stack');
  expect(query.parts[4].required).toBe(false);
  expect(query.parts[4].negated).toBe(true);
});
