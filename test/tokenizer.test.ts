import { TokenType, QueryTokenizer } from '../src/tokenizer';

test('it should strip illegal character from query', () => {
  const invalid = '@(,<=\\*#>';
  const invalid2 = '$^.]_|+.&';
  const invalid3 = "[~`!{%}/*)';";
  const tokenizer = new QueryTokenizer(
    `lorem${invalid} ipsum${invalid2} dolor${invalid3}`
  );
  expect(tokenizer.query).not.toContain(invalid);
  expect(tokenizer.query).not.toContain(invalid2);
  expect(tokenizer.query).not.toContain(invalid3);
  expect(tokenizer.query).toEqual('lorem ipsum dolor');
});

test('it should not strip legal character from query', () => {
  const tokenizer = new QueryTokenizer(`-negated term "exact term"`);
  expect(tokenizer.query).toEqual('-negated term "exact term"');
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

  expect(tokens[0].type).toEqual(TokenType.Term);
  expect(tokens[0].text).toEqual('hello');

  expect(tokens[1].type).toEqual(TokenType.Term);
  expect(tokens[1].text).toEqual('world');
});

test('it should create tokens for exact terms', () => {
  const tokens = new QueryTokenizer(` "sea bass"  salmon `).tokenize();
  expect(tokens.length).toBe(2);

  expect(tokens[0].type).toEqual(TokenType.ExactTerm);
  expect(tokens[0].text).toEqual('sea bass');

  expect(tokens[1].type).toEqual(TokenType.Term);
  expect(tokens[1].text).toEqual('salmon');
});

test('it should create tokens for negated terms', () => {
  const tokens = new QueryTokenizer(` -car jaguar speed `).tokenize();
  expect(tokens.length).toBe(3);

  expect(tokens[0].type).toEqual(TokenType.NegatedTerm);
  expect(tokens[0].text).toEqual('car');

  expect(tokens[1].type).toEqual(TokenType.Term);
  expect(tokens[1].text).toEqual('jaguar');

  expect(tokens[2].type).toEqual(TokenType.Term);
  expect(tokens[2].text).toEqual('speed');
});

test('it should create token for OR operator', () => {
  const tokens = new QueryTokenizer(
    ` "backend engineer"  OR  "full stack" `
  ).tokenize();
  expect(tokens.length).toBe(3);

  expect(tokens[0].type).toEqual(TokenType.ExactTerm);
  expect(tokens[0].text).toEqual('backend engineer');

  expect(tokens[1].type).toEqual(TokenType.OrOperator);
  expect(tokens[1].text).toEqual('or');

  expect(tokens[2].type).toEqual(TokenType.ExactTerm);
  expect(tokens[2].text).toEqual(`full stack`);
});

test('it should create tokens when combining terms', () => {
  const tokens = new QueryTokenizer(
    ` -"web design"  ux OR  "user experience"  `
  ).tokenize();
  expect(tokens.length).toBe(4);

  expect(tokens[0].type).toEqual(TokenType.NegatedTerm);
  expect(tokens[0].text).toEqual(`web design`);

  expect(tokens[1].type).toEqual(TokenType.Term);
  expect(tokens[1].text).toEqual('ux');

  expect(tokens[2].type).toEqual(TokenType.OrOperator);
  expect(tokens[2].text).toEqual('or');

  expect(tokens[3].type).toEqual(TokenType.ExactTerm);
  expect(tokens[3].text).toEqual('user experience');
});
