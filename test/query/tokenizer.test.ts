import { QueryTokenType, QueryTokenizer } from '../../src/query/tokenizer';

describe('QueryTokenizer', () => {
  test('it should strip illegal character from query', () => {
    const invalid = '^*()_}][{>\\<|/`~}';
    const tokenizer = new QueryTokenizer(
      `lorem${invalid} ipsum${invalid} dolor${invalid}`
    );

    expect(tokenizer.queryText).toEqual('lorem ipsum dolor');
  });

  test('it should not strip legal character from query', () => {
    const tokenizer = new QueryTokenizer(`-negated +Term "eXact term"`);
    expect(tokenizer.queryText).toEqual('-negated +Term "eXact term"');
  });

  test('it should not create tokens for empty queries', () => {
    const tokens1 = new QueryTokenizer(``).tokenize();
    const tokens2 = new QueryTokenizer(`   `).tokenize();

    expect(tokens1.length).toBe(0);
    expect(tokens2.length).toBe(0);
  });

  test('it should create tokens for simple terms', () => {
    const tokens = new QueryTokenizer(` Hello  world! `).tokenize();
    expect(tokens.length).toBe(2);

    expect(tokens[0].type).toEqual(QueryTokenType.Term);
    expect(tokens[0].text).toEqual('Hello');

    expect(tokens[1].type).toEqual(QueryTokenType.Term);
    expect(tokens[1].text).toEqual('world!');
  });

  test('it should create tokens for exact terms', () => {
    const tokens = new QueryTokenizer(` "sea bass"  salmon `).tokenize();
    expect(tokens.length).toBe(2);

    expect(tokens[0].type).toEqual(QueryTokenType.ExactTerm);
    expect(tokens[0].text).toEqual(`"sea bass"`);

    expect(tokens[1].type).toEqual(QueryTokenType.Term);
    expect(tokens[1].text).toEqual('salmon');
  });

  test('it should create tokens for presence terms', () => {
    const tokens = new QueryTokenizer(` -car +jaguar speed`).tokenize();
    expect(tokens.length).toBe(3);

    expect(tokens[0].type).toEqual(QueryTokenType.PresenceTerm);
    expect(tokens[0].text).toEqual('-car');

    expect(tokens[1].type).toEqual(QueryTokenType.PresenceTerm);
    expect(tokens[1].text).toEqual('+jaguar');

    expect(tokens[2].type).toEqual(QueryTokenType.Term);
    expect(tokens[2].text).toEqual('speed');
  });

  test('it should create tokens when combining terms', () => {
    const tokens = new QueryTokenizer(
      ` -"web design"  ux  +"user experience"  "2022" `
    ).tokenize();
    expect(tokens.length).toBe(4);

    expect(tokens[0].type).toEqual(QueryTokenType.PresenceTerm);
    expect(tokens[0].text).toEqual(`-"web design"`);

    expect(tokens[1].type).toEqual(QueryTokenType.Term);
    expect(tokens[1].text).toEqual('ux');

    expect(tokens[2].type).toEqual(QueryTokenType.PresenceTerm);
    expect(tokens[2].text).toEqual(`+"user experience"`);

    expect(tokens[3].type).toEqual(QueryTokenType.ExactTerm);
    expect(tokens[3].text).toEqual(`"2022"`);
  });

  test('it should not create tokens for stopwords', () => {
    const tokens = new QueryTokenizer(`it is @#$% the me was what`).tokenize();
    expect(tokens.length).toBe(0);
  });
});
