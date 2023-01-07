import { Token } from '../src/tokenizer';
import { Query, QueryParser, QueryPartType } from '../src/parser';

test('it should parse tokens to a query object', () => {
  const tokens = [
    { type: 'PresenceTerm', text: '+frontend' },
    { type: 'Term', text: 'engineer' },
    { type: 'PresenceTerm', text: '-backend' },
    { type: 'ExactTerm', text: '"ux  engineer "' },
    { type: 'PresenceTerm', text: '-"full stack"' },
    { type: 'ExactTerm', text: '"the backend  engineer "' },
    { type: 'PresenceTerm', text: '+"the mean stack is"' },
  ];
  const parser = new QueryParser(tokens as Token[]);
  const query: Query = parser.parse();

  expect(query.parts.length).toBe(7);

  expect(query.parts[0].term).toBe('frontend');
  expect(query.parts[0].type).toBe(QueryPartType.Required);
  expect(query.parts[0].isPhrase).toBe(false);

  expect(query.parts[1].term).toBe('engineer');
  expect(query.parts[1].type).toBe(QueryPartType.Simple);
  expect(query.parts[1].isPhrase).toBe(false);

  expect(query.parts[2].term).toBe('backend');
  expect(query.parts[2].type).toBe(QueryPartType.Negated);
  expect(query.parts[2].isPhrase).toBe(false);

  expect(query.parts[3].term).toBe('ux engineer');
  expect(query.parts[3].isPhrase).toBe(true);
  expect(query.parts[3].type).toBe(QueryPartType.Simple);

  expect(query.parts[4].term).toBe('full stack');
  expect(query.parts[4].isPhrase).toBe(true);
  expect(query.parts[4].type).toBe(QueryPartType.Negated);

  expect(query.parts[5].term).toBe('backend engineer');
  expect(query.parts[5].isPhrase).toBe(true);
  expect(query.parts[5].type).toBe(QueryPartType.Simple);

  expect(query.parts[6].term).toBe('mean stack');
  expect(query.parts[6].isPhrase).toBe(true);
  expect(query.parts[6].type).toBe(QueryPartType.Required);
});
