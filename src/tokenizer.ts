export enum TokenType {
  Invalid = 'Invalid',
  NegatedTerm = 'NegatedTerm',
  ExactTerm = 'ExactTerm',
  OrOperator = 'OrOperator',
  Term = 'Term',
}

// Test at: https://regex101.com
const termRegexes = {
  [TokenType.NegatedTerm]: /(?<NegatedTerm>-(\w{2,}|"(?:[\s\w]+)"))/, // unquoted or quoted
  [TokenType.ExactTerm]: /(?<ExactTerm>("(?:[\s\w]+)"))/, // quoted
  [TokenType.OrOperator]: /(?<OrOperator>OR)/,
  [TokenType.Term]: /(?<Term>\w+)/, // unquoted
};

const tokenizerRegex = new RegExp(
  `${termRegexes[TokenType.NegatedTerm].source}|` +
    `${termRegexes[TokenType.ExactTerm].source}|` +
    `${termRegexes[TokenType.OrOperator].source}|` +
    `${termRegexes[TokenType.Term].source}`,
  'g'
);

export class Token {
  constructor(public type: TokenType | undefined, public text: string) {}
}

export class QueryTokenizer {
  query: string;
  private queryInvalidChars = /[^-a-zA-Z0-9\s"]+/g;

  constructor(rawQuery: string) {
    // Strip all chars except what's allowed inside a query
    this.query = rawQuery.replace(this.queryInvalidChars, '');
  }

  private getTokenType(matchGroup: { [key: string]: string }) {
    if (!matchGroup) return TokenType.Invalid;
    let type;

    if (matchGroup.NegatedTerm) {
      type = TokenType.NegatedTerm;
    } else if (matchGroup.ExactTerm) {
      type = TokenType.ExactTerm;
    } else if (matchGroup.OrOperator) {
      type = TokenType.OrOperator;
    } else if (matchGroup.Term) {
      type = TokenType.Term;
    }

    return type;
  }

  tokenize() {
    const tokens: Token[] = [];
    for (const match of this.query.matchAll(tokenizerRegex)) {
      if (match && match.groups) {
        const type = this.getTokenType(match.groups);
        tokens.push(new Token(type, match[0]));
      }
    }
    return tokens;
  }
}
