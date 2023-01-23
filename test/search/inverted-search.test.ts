import { InvertedIndex } from '../../src/search/index';
import { InvertedSearch } from '../../src/search/index';

const stopwords = {
  a: 'a',
  it: 'it',
  is: 'is',
  the: 'the',
};

function createInstance(docs: Array<{ [key: string]: unknown }> = []) {
  const invertedIndex = new InvertedIndex({
    uidKey: 'id',
    fields: ['title'],
  }).addDocuments(
    docs.length
      ? docs
      : [
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
          {
            id: 21,
            name: 'Jamie Black',
            title: 'Foo What Graphic Designer Biz',
          },
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
        ]
  );

  return new InvertedSearch(invertedIndex);
}

/**
 * Basic search
 */
describe('InvertedSearch - Basic search', () => {
  test('it should search simple fields', () => {
    const instance = createInstance();
    const results = instance.search('designer');
    expect(results.length).toBe(2);
    expect(results[0]['id']).toBe(11);
    expect(results[1]['id']).toBe(21);
  });

  test('it should search required fields', () => {
    const instance = createInstance();

    const results = instance.search('+senior +staff');
    expect(results.length).toBe(1);
    expect(results[0]['id']).toBe(101);

    expect(instance.search('+senior +NONE').length).toBe(0);
  });

  test('it should search negated fields', () => {
    const instance = createInstance();
    const results = instance.search('engineer -senior');
    expect(results.length).toBe(1);
    expect(results[0]['id']).toBe(3);
  });

  test('it should search mixed queries', () => {
    const instance = createInstance();
    const results = instance.search(
      `"software engineer" ux designer -"engineer 3" -graphic`
    );
    expect(results.length).toBe(2);
    expect(results[0]['id']).toBe(11);
    expect(results[1]['id']).toBe(32);
  });

  test('it should return empty results', () => {
    const instance = createInstance();
    const results = instance.search(
      `+"software engineer" +senior +staff -"engineer 3"`
    );
    expect(results.length).toBe(0);
  });
});

/**
 * Phrase search
 */
describe('InvertedSearch - Phrase search', () => {
  test('it should search simple phrases', () => {
    const instance = createInstance([
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

    const results = instance.search(`"staff software engineer"`);
    expect(results.length).toBe(1);
    expect(results[0]['id']).toBe(101);
  });

  test('it should search simple phrases even if stopwords appear in between', () => {
    const instance = createInstance([
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

    const results = instance.search(
      `"dummy text printing typesetting industry"`
    );
    expect(results.length).toBe(1);
    expect(results[0]['id']).toBe(200);
  });

  test('it should find phrase even when terms appear multiple times', () => {
    const instance = createInstance([
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

    const results = instance.search(`"one two three"`);
    expect(results.length).toBe(1);
  });

  test('it should NOT find phrase even when terms appear multiple times', () => {
    const instance = createInstance([
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

    const results = instance.search(`"one two three"`);
    expect(results.length).toBe(0);
  });

  test('it should return empty results when all the words appear in document but not as a phrase', () => {
    const instance = createInstance([
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

    // document contains "southwestern" as last word in phrase
    const results = instance.search(`"national park located southwest"`);
    expect(results.length).toBe(0);
  });

  test('it should search simple phrases even with a single term', () => {
    const instance = createInstance([
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

    const results = instance.search(`"engineer"`);
    expect(results.length).toBe(2);
    expect(results[0]['id']).toBe(32);
    expect(results[1]['id']).toBe(101);
  });

  test('it should search required phrases', () => {
    const instance = createInstance([
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

    const results = instance.search(`+"software engineer" -bafoon`);
    expect(results.length).toBe(1);
    expect(results[0]['id']).toBe(101);
  });

  test('it should search required phrases even with a single term', () => {
    const instance = createInstance([
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

    const results = instance.search(`+"software" -bafoon`);
    expect(results.length).toBe(1);
    expect(results[0]['id']).toBe(101);
  });

  test('it should search negated phrases', () => {
    const instance = createInstance([
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

    const results = instance.search(`engineer -"senior staff"`);
    expect(results.length).toBe(2);
    expect(results[0]['id']).toBe(3);
    expect(results[1]['id']).toBe(32);
  });

  test('it should search negated phrases even with a single term', () => {
    const instance = createInstance([
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

    const results = instance.search(`engineer -"staff"`);
    expect(results.length).toBe(2);
    expect(results[0]['id']).toBe(3);
    expect(results[1]['id']).toBe(32);
  });
});
