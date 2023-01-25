import { InvertedIndex } from '../../src/search/index';
import { DocParsedMetadata } from '../../src/utils/encoding';

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

describe('InvertedIndex', () => {
  test('it should add documents', () => {
    const instance = new InvertedIndex({ uidKey: 'id', fields: ['title'] });
    instance.addDocuments(docs);

    const { documents } = instance.toJSON();
    expect(Object.keys(documents).length).toBe(docs.length);

    expect(documents['3'].name).toBe('Mike');
    expect(documents['3'].title).toContain('Chief Forward Impact Engineer');
  });

  test('it should create the index from the document search fields', () => {
    const instance = new InvertedIndex({ uidKey: 'id', fields: ['name'] });
    instance.addDocuments(docs);

    const { index, fields } = instance.toJSON();
    expect(fields.length).toBe(1);
    expect(fields.includes('name')).toBe(true);

    expect(index['mike']).toBeDefined();
    expect(index['mike']['3']).toBeDefined();
    expect(typeof index['mike']['3']).toBe('string');

    expect(index['joe']['7']).toBeDefined();
    expect(index['joe']['32']).toBeDefined();
  });

  test('it should not add stopwords to the index', () => {
    const instance = new InvertedIndex({ uidKey: 'id', fields: ['title'] });
    instance.addDocuments(docs);

    const { index } = instance.toJSON();
    expect(index[stopwords['a']]).not.toBeDefined();
    expect(index[stopwords['it']]).not.toBeDefined();
    expect(index[stopwords['is']]).not.toBeDefined();
    expect(index[stopwords['the']]).not.toBeDefined();
  });

  test('it should index documents with frequency and postings', () => {
    const instance = new InvertedIndex({ uidKey: 'id', fields: ['name'] });
    instance.addDocuments(docs);

    const meta = instance.getDocumentEntry('joe', '7') as DocParsedMetadata;
    expect(meta.frequency).toBe(1);
    expect(meta.postings).toContain(0);

    const meta2 = instance.getDocumentEntry('doe', '7') as DocParsedMetadata;
    expect(meta2.postings).toContain(4);
  });

  test('it should index additional fields', () => {
    const instance = new InvertedIndex({
      uidKey: 'id',
      fields: ['name'],
    }).addDocuments(docs);

    const { index, fields } = instance.toJSON();
    expect(fields.length).toBe(1);
    expect(fields.includes('name')).toBe(true);

    expect(index['mike']).toBeDefined();
    expect(index['mike']['3']).toBeDefined();

    // Expect non-search field to no be indexed
    expect(index['engineer']).not.toBeDefined();
    expect(index['designer']).not.toBeDefined();

    // Index additional field
    instance.index('title');
    const { index: index2, fields: fields2 } = instance.toJSON();

    expect(fields2.length).toBe(2);
    expect(fields2.includes('name')).toBe(true);
    expect(fields2.includes('title')).toBe(true);

    expect(index2['engineer']).toBeDefined();
    expect(index2['designer']).toBeDefined();
  });
});
