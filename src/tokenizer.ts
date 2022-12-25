import { isStopWord } from './utils';

export enum TokenType {
  Invalid = 'Invalid',
  PresenceTerm = 'PresenceTerm',
  ExactTerm = 'ExactTerm',
  Term = 'Term',
}

// Test at: https://regex101.com
const termRegexes = {
  [TokenType.PresenceTerm]:
    /(?<PresenceTerm>(?:(\s+)?([-+]))((\w{2,})|"(?:[^"]+)"))/, // unquoted or quoted
  [TokenType.ExactTerm]: /(?<ExactTerm>("(?:[^"]+)"))/, // quoted
  [TokenType.Term]: /(?<Term>[^ ]+)/, // unquoted
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
  private queryInvalidChars = /(?:[\^*()_}\]\\[{>\\<|\\/`~}]+)/gi;

  constructor(rawQuery: string) {
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
        const text = (match[0] || '').trim();

        if (text && !isStopWord(text)) {
          tokens.push(new Token(type, text));
        }
      }
    }

    return tokens;
  }
}
