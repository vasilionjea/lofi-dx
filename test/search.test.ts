import { Query, QueryPartType } from '../src/parser';
import { Search } from '../src/search';

let docs: Array<{ [key: string]: unknown }>;
const stopwords = {
  a: 'a',
  it: 'it',
  is: 'is',
  the: 'the',
};

beforeEach(() => {
  docs = [
    {
      id: 3,
      name: 'Mike',
      title: `${stopwords['the']} Chief Forward Impact Engineer 3 ${stopwords['is']} Foo ${stopwords['a']}`,
    },
    {
      id: 7,
      name: 'Joe Doe',
      title: `${stopwords['a']} Chief Interactions Liason ${stopwords['it']}`,
    },
    {
      id: 11,
      name: 'Alice Smith',
      title: `UX Designer Bar Baz ${stopwords['it']}`,
    },
    { id: 21, name: 'Jamie Black', title: 'Foo What Graphic Designer Biz' },
    {
      id: 32,
      name: 'Joe Brown',
      title: `Senior Software Engineer Barfoo ${stopwords['the']}`,
    },
    {
      id: 49,
      name: 'Helen Queen',
      title: 'Staff Dynamic Resonance Orchestrator Foo',
    },
    {
      id: 55,
      name: 'Mary',
      title: 'Queen Product Program Executive Manager Foo',
    },
    {
      id: 101,
      name: 'Alan Smith',
      title: 'Bar Senior The Staff Software Engineer 3 Foobar',
    },
  ];
});

test('it should add documents', () => {
  const instance = new Search({ uidKey: 'id', searchFields: ['title'] });
  instance.addDocuments(docs);

  const documentsTable = instance.getDocumentsTable();
  expect(Object.keys(documentsTable).length).toBe(docs.length);

  expect(documentsTable['3'].name).toBe('Mike');
  expect(documentsTable['3'].title).toContain('Chief Forward Impact Engineer');
});

test('it should create the index from the document search fields', () => {
  const instance = new Search({ uidKey: 'id', searchFields: ['name'] });
  instance.addDocuments(docs);

  const indexTable = instance.getIndexTable();
  expect(instance.searchFields.size).toBe(1);
  expect(instance.searchFields.has('name')).toBe(true);

  expect(indexTable['mike']).toBeDefined();
  expect(indexTable['mike']['3']).toBeDefined();
  expect(indexTable['mike']['3']).toBeInstanceOf(Object);

  expect(indexTable['joe']['7']).toBeDefined();
  expect(indexTable['joe']['32']).toBeDefined();
});

test('it should not add stopwords to the index', () => {
  const instance = new Search({ uidKey: 'id', searchFields: ['title'] });
  instance.addDocuments(docs);

  const indexTable = instance.getIndexTable();
  expect(indexTable[stopwords['a']]).not.toBeDefined();
  expect(indexTable[stopwords['it']]).not.toBeDefined();
  expect(indexTable[stopwords['is']]).not.toBeDefined();
  expect(indexTable[stopwords['the']]).not.toBeDefined();
});

test('it should index documents with frequency and postings', () => {
  const instance = new Search({ uidKey: 'id', searchFields: ['name'] });
  instance.addDocuments(docs);

  const indexTable = instance.getIndexTable();
  expect(indexTable['joe']['7'].frequency).toBe(1);
  expect(indexTable['joe']['7'].postings).toContain(0);
  expect(indexTable['doe']['7'].postings).toContain(4);
});

test('it should index additional fields', () => {
  const instance = new Search({
    uidKey: 'id',
    searchFields: ['name'],
  }).addDocuments(docs);

  let indexTable = instance.getIndexTable();
  expect(instance.searchFields.size).toBe(1);
  expect(instance.searchFields.has('name')).toBe(true);

  expect(indexTable['mike']).toBeDefined();
  expect(indexTable['mike']['3']).toBeDefined();

  // Expect non-search field to no be indexed
  expect(indexTable['engineer']).not.toBeDefined();
  expect(indexTable['designer']).not.toBeDefined();

  // Index additional field
  instance.index('title');
  indexTable = instance.getIndexTable();

  expect(instance.searchFields.size).toBe(2);
  expect(instance.searchFields.has('name')).toBe(true);
  expect(instance.searchFields.has('title')).toBe(true);

  expect(indexTable['engineer']).toBeDefined();
  expect(indexTable['designer']).toBeDefined();
});

test('it should search simple fields', () => {
  const instance = new Search({
    uidKey: 'id',
    searchFields: ['title'],
  }).addDocuments(docs);

  const query = new Query();
  query.add({ term: 'designer', type: QueryPartType.Simple, isPhrase: false });
  const results = instance.search(query);

  expect(results.length).toBe(2);
  expect(results[0]['id']).toBe(11);
  expect(results[1]['id']).toBe(21);
});

test('it should search simple phrases', () => {
  const instance = new Search({
    uidKey: 'id',
    searchFields: ['title'],
  }).addDocuments(docs);

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

test('it should search simple phrases even with a single term', () => {
  const instance = new Search({
    uidKey: 'id',
    searchFields: ['title'],
  }).addDocuments(docs);

  const query = new Query();
  query.add({
    term: 'engineer',
    type: QueryPartType.Simple,
    isPhrase: true,
  });
  const results = instance.search(query);

  expect(results.length).toBe(3);
  expect(results[0]['id']).toBe(3);
  expect(results[1]['id']).toBe(32);
  expect(results[2]['id']).toBe(101);
});

test('it should search required fields', () => {
  const instance = new Search({
    uidKey: 'id',
    searchFields: ['title'],
  }).addDocuments(docs);

  const query = new Query();
  query.add({ term: 'senior', type: QueryPartType.Required, isPhrase: false });
  query.add({ term: 'staff', type: QueryPartType.Required, isPhrase: false });
  const results = instance.search(query);

  expect(results.length).toBe(1);
  expect(results[0]['id']).toBe(101);
});

test('it should search negated fields', () => {
  const instance = new Search({
    uidKey: 'id',
    searchFields: ['title'],
  }).addDocuments(docs);

  const query = new Query();
  query.add({ term: 'engineer', type: QueryPartType.Simple, isPhrase: false });
  query.add({ term: 'senior', type: QueryPartType.Negated, isPhrase: false });
  const results = instance.search(query);

  expect(results.length).toBe(1);
  expect(results[0]['id']).toBe(3);
});

test('it should search required phrases', () => {
  const instance = new Search({
    uidKey: 'id',
    searchFields: ['title'],
  }).addDocuments(docs);

  const query = new Query();
  query.add({
    term: 'software engineer',
    type: QueryPartType.Required,
    isPhrase: true,
  });
  query.add({ term: 'barfoo', type: QueryPartType.Negated, isPhrase: false });
  const results = instance.search(query);

  expect(results.length).toBe(1);
  expect(results[0]['id']).toBe(101);
});

test('it should search required phrases even with a single term', () => {
  const instance = new Search({
    uidKey: 'id',
    searchFields: ['title'],
  }).addDocuments(docs);

  const query = new Query();
  query.add({
    term: 'software',
    type: QueryPartType.Required,
    isPhrase: true,
  });
  query.add({ term: 'barfoo', type: QueryPartType.Negated, isPhrase: false });
  const results = instance.search(query);

  expect(results.length).toBe(1);
  expect(results[0]['id']).toBe(101);
});

test('it should search negated phrases', () => {
  const instance = new Search({
    uidKey: 'id',
    searchFields: ['title'],
  }).addDocuments(docs);

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
  const instance = new Search({
    uidKey: 'id',
    searchFields: ['title'],
  }).addDocuments(docs);

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

test('it should search mixed queries', () => {
  const instance = new Search({
    uidKey: 'id',
    searchFields: ['title'],
  }).addDocuments(docs);

  const query = new Query();
  query.add({
    term: 'software engineer',
    type: QueryPartType.Simple,
    isPhrase: true,
  });
  query.add({ term: 'ux', type: QueryPartType.Simple, isPhrase: false });
  query.add({ term: 'designer', type: QueryPartType.Simple, isPhrase: false });
  query.add({
    term: 'engineer 3',
    type: QueryPartType.Negated,
    isPhrase: true,
  });
  query.add({ term: 'graphic', type: QueryPartType.Negated, isPhrase: false });
  const results = instance.search(query);

  expect(results.length).toBe(2);
  expect(results[0]['id']).toBe(11);
  expect(results[1]['id']).toBe(32);
});

test('it should return empty results', () => {
  const instance = new Search({
    uidKey: 'id',
    searchFields: ['title'],
  }).addDocuments(docs);

  const query = new Query();
  query.add({
    term: 'software engineer',
    type: QueryPartType.Required,
    isPhrase: true,
  });
  query.add({ term: 'senior', type: QueryPartType.Required, isPhrase: false });
  query.add({ term: 'staff', type: QueryPartType.Required, isPhrase: false });
  query.add({
    term: 'engineer 3',
    type: QueryPartType.Negated,
    isPhrase: true,
  });
  const results = instance.search(query);

  expect(results.length).toBe(0);
});
