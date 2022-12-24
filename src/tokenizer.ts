export enum TokenType {
  Invalid = 'Invalid',
  PresenceTerm = 'PresenceTerm',
  ExactTerm = 'ExactTerm',
  Term = 'Term',
}

// Test at: https://regex101.com
const termRegexes = {
  [TokenType.PresenceTerm]: /(?<PresenceTerm>(-|\+)(\w{2,}|"(?:[\s\w]+)"))/, // unquoted or quoted
  [TokenType.ExactTerm]: /(?<ExactTerm>("(?:[\s\w]+)"))/, // quoted
  [TokenType.Term]: /(?<Term>\w+)/, // unquoted
};

const tokenizerRegex = new RegExp(
  `${termRegexes[TokenType.PresenceTerm].source}|` +
    `${termRegexes[TokenType.ExactTerm].source}|` +
    `${termRegexes[TokenType.Term].source}`,
  'g'
);

export class Token {
  constructor(public type: TokenType, public text: string) {}
}

export class QueryTokenizer {
  readonly queryText: string;
  private queryInvalidChars = /(?:[^-+a-z0-9\s"]+)/gi;

  constructor(rawQuery: string) {
    // Strip all chars except what's allowed inside a query
    this.queryText = rawQuery.replace(this.queryInvalidChars, '');
  }

  private getTokenType(matchGroup: { [key: string]: string } = {}) {
    let type = TokenType.Invalid;

    if (matchGroup.PresenceTerm) {
      type = TokenType.PresenceTerm;
    } else if (matchGroup.ExactTerm) {
      type = TokenType.ExactTerm;
    } else if (matchGroup.Term) {
      type = TokenType.Term;
    }

    return type;
  }

  tokenize() {
    const tokens: Token[] = [];

    for (const match of this.queryText.matchAll(tokenizerRegex)) {
      if (match && match.groups) {
        const type = this.getTokenType(match.groups);
        const text = match[0] || '';

        tokens.push(new Token(type, text));
      }
    }

    return tokens;
  }
}
