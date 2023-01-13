import { Query, QueryPartType } from '../src/parser';
import { Search } from '../src/search';

const stopwords = {
  a: 'a',
  it: 'it',
  is: 'is',
  the: 'the',
};

test('it should search simple phrases', () => {
  const instance = new Search({ uidKey: 'id', searchFields: ['title'] });
  instance.addDocuments([
    {
      id: 0,
      name: 'Helen Queen',
      title: 'Staff Dynamic Resonance Orchestrator',
    },
    {
      id: 101,
      name: 'Alan Smith',
      title: 'Bar Senior The Staff Software Engineer 3 Foobar',
    },
  ]);

  const query = new Query();
  query.add({
    term: 'staff software engineer',
    type: QueryPartType.Simple,
    isPhrase: true,
  });
  const results = instance.search(query);

  expect(results.length).toBe(1);
  expect(results[0]['id']).toBe(101);
});

test('it should search simple phrases even if stopwords appear in between', () => {
  const instance = new Search({ uidKey: 'id', searchFields: ['title'] });
  instance.addDocuments([
    {
      id: 0,
      name: 'Helen Queen',
      title: 'Staff Dynamic Resonance Orchestrator',
    },
    {
      id: 200,
      name: 'Foo Bar',
      title:
        'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
    },
  ]);

  const query = new Query();
  query.add({
    term: 'dummy text printing typesetting industry',
    type: QueryPartType.Simple,
    isPhrase: true,
  });
  const results = instance.search(query);

  expect(results.length).toBe(1);
  expect(results[0]['id']).toBe(200);
});

test('it should find phrase even when terms appear multiple times', () => {
  const instance = new Search({ uidKey: 'id', searchFields: ['title'] });
  instance.addDocuments([
    {
      id: 0,
      name: 'Helen Queen',
      title: 'Staff Dynamic Resonance Orchestrator',
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
      id: 0,
      name: 'Helen Queen',
      title: 'One Staff Dynamic Resonance Two Orchestrator One',
    },
    {
      id: 72,
      name: 'one two three',
      title:
        'one one two lorem ipsum two three dolor three one one two two foobar two three',
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

test('it should return empty results when all the words appear in document but not as a phrase', () => {
  const instance = new Search({ uidKey: 'id', searchFields: ['title'] });
  instance.addDocuments([
    {
      id: 0,
      name: 'Helen Queen',
      title: 'Staff Dynamic Resonance Orchestrator',
    },
    {
      id: 300,
      name: 'national park',
      title:
        'Great national park located foobar southwest. National park located in southwestern Utah',
    },
  ]);

  const query = new Query();
  query.add({
    term: 'national park located southwest', // document contains "southwestern" as last word in phrase
    type: QueryPartType.Simple,
    isPhrase: true,
  });
  const results = instance.search(query);

  expect(results.length).toBe(0);
});

test('it should search simple phrases even with a single term', () => {
  const instance = new Search({ uidKey: 'id', searchFields: ['title'] });
  instance.addDocuments([
    {
      id: 101,
      name: 'Alan Smith',
      title: 'Bar Senior The Staff Software Engineer 3 Foobar',
    },
    {
      id: 0,
      name: 'Helen Queen',
      title: 'Staff Dynamic Resonance Orchestrator',
    },
    {
      id: 32,
      name: 'Joe Brown',
      title: 'Senior Software Engineer Bafoon',
    },
  ]);

  const query = new Query();
  query.add({
    term: 'engineer',
    type: QueryPartType.Simple,
    isPhrase: true,
  });
  const results = instance.search(query);

  expect(results.length).toBe(2);
  expect(results[0]['id']).toBe(32);
  expect(results[1]['id']).toBe(101);
});

test('it should search required phrases', () => {
  const instance = new Search({ uidKey: 'id', searchFields: ['title'] });
  instance.addDocuments([
    {
      id: 0,
      name: 'Helen Queen',
      title: 'Staff Dynamic Resonance Orchestrator',
    },
    {
      id: 32,
      name: 'Joe Brown',
      title: 'Senior Software Engineer Bafoon',
    },
    {
      id: 101,
      name: 'Alan Smith',
      title: 'Bar Senior The Staff Software Engineer 3 Foobar',
    },
  ]);

  const query = new Query();
  query.add({
    term: 'software engineer',
    type: QueryPartType.Required,
    isPhrase: true,
  });
  query.add({ term: 'bafoon', type: QueryPartType.Negated, isPhrase: false });
  const results = instance.search(query);

  expect(results.length).toBe(1);
  expect(results[0]['id']).toBe(101);
});

test('it should search required phrases even with a single term', () => {
  const instance = new Search({ uidKey: 'id', searchFields: ['title'] });
  instance.addDocuments([
    {
      id: 0,
      name: 'Helen Queen',
      title: 'Staff Dynamic Resonance Orchestrator',
    },
    {
      id: 32,
      name: 'Joe Brown',
      title: 'Senior Software Engineer Bafoon',
    },
    {
      id: 101,
      name: 'Alan Smith',
      title: 'Bar Senior The Staff Software Engineer 3 Foobar',
    },
  ]);

  const query = new Query();
  query.add({
    term: 'software',
    type: QueryPartType.Required,
    isPhrase: true,
  });
  query.add({ term: 'bafoon', type: QueryPartType.Negated, isPhrase: false });
  const results = instance.search(query);

  expect(results.length).toBe(1);
  expect(results[0]['id']).toBe(101);
});

test('it should search negated phrases', () => {
  const instance = new Search({ uidKey: 'id', searchFields: ['title'] });
  instance.addDocuments([
    {
      id: 0,
      name: 'Helen Queen',
      title: 'Staff Dynamic Resonance Orchestrator',
    },
    {
      id: 3,
      name: 'Mike',
      title: `${stopwords['the']} Chief Forward Impact Engineer 3 ${stopwords['is']} Foo`,
    },
    {
      id: 32,
      name: 'Joe Brown',
      title: 'Senior Software Engineer Bafoon',
    },
    {
      id: 101,
      name: 'Alan Smith',
      title: 'Bar Senior The Staff Software Engineer 3 Foobar',
    },
  ]);

  const query = new Query();
  query.add({ term: 'engineer', type: QueryPartType.Simple, isPhrase: false });
  query.add({
    term: 'senior staff',
    type: QueryPartType.Negated,
    isPhrase: true,
  });
  const results = instance.search(query);

  expect(results.length).toBe(2);
  expect(results[0]['id']).toBe(3);
  expect(results[1]['id']).toBe(32);
});

test('it should search negated phrases even with a single term', () => {
  const instance = new Search({ uidKey: 'id', searchFields: ['title'] });
  instance.addDocuments([
    {
      id: 0,
      name: 'Helen Queen',
      title: 'Staff Dynamic Resonance Orchestrator',
    },
    {
      id: 3,
      name: 'Mike',
      title: `${stopwords['the']} Chief Forward Impact Engineer 3 ${stopwords['is']} Foo`,
    },
    {
      id: 32,
      name: 'Joe Brown',
      title: 'Senior Software Engineer Bafoon',
    },
    {
      id: 101,
      name: 'Alan Smith',
      title: 'Bar Senior The Staff Software Engineer 3 Foobar',
    },
  ]);

  const query = new Query();
  query.add({ term: 'engineer', type: QueryPartType.Simple, isPhrase: false });
  query.add({
    term: 'staff',
    type: QueryPartType.Negated,
    isPhrase: true,
  });
  const results = instance.search(query);

  expect(results.length).toBe(2);
  expect(results[0]['id']).toBe(3);
  expect(results[1]['id']).toBe(32);
});
