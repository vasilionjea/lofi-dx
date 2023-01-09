import { Query, QueryPartType } from '../src/parser';
import { Search } from '../src/search';

const stopwords = {
  a: 'a',
  it: 'it',
  is: 'is',
  the: 'the',
};

test('it should find phrase even when terms appear multiple times', () => {
  const instance = new Search({ uidKey: 'id', searchFields: ['title'] });
  instance.addDocuments([
    {
      id: 49,
      name: 'Helen Queen',
      title: 'Staff Dynamic Resonance Orchestrator Foo',
    },
    {
      id: 72,
      name: 'one two three',
      title:
        'hello one two lorem ipsum three dolor three one two foobar one two three biz baz',
    },
  ]);
  const query = new Query();
  query.add({
    term: 'one two three',
    type: QueryPartType.Simple,
    isPhrase: true,
  });
  const results = instance.search(query);
  expect(results.length).toBe(1);
});

test('it should NOT find phrase even when terms appear multiple times', () => {
  const instance = new Search({ uidKey: 'id', searchFields: ['title'] });
  instance.addDocuments([
    {
      id: 49,
      name: 'Helen Queen',
      title: 'One Staff Dynamic Resonance Two Orchestrator Foo',
    },
    {
      id: 72,
      name: 'one two three',
      title:
        'hello one two lorem ipsum three dolor three one two foobar two biz three',
    },
  ]);
  const query = new Query();
  query.add({
    term: 'one two three',
    type: QueryPartType.Simple,
    isPhrase: true,
  });
  const results = instance.search(query);
  expect(results.length).toBe(0);
});
