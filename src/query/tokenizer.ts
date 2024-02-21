import {isStopword} from '../stopwords';

/**
 * The query token types that are supported.
 */
export enum QueryTokenType {
  Invalid = 'Invalid', // unsupported
  PresenceTerm = 'PresenceTerm', // prefixed term with `+` or `-`
  ExactTerm = 'ExactTerm', // quoted term
  Term = 'Term', // simple terms
}

// Test at: https://regex101.com
const termRegexes: {[key: string]: RegExp} = {
  [QueryTokenType.PresenceTerm]:
    /(?<PresenceTerm>(?:(\s+)?([-+]))((\w{2,})|"(?:[^"]+)"))/, // unquoted or quoted
  [QueryTokenType.ExactTerm]: /(?<ExactTerm>("(?:[^"]+)"))/, // quoted
  [QueryTokenType.Term]: /(?<Term>[^ ]+)/, // unquoted
};

// Ordered from most to least specific
const tokenizerRegex = new RegExp(
  `${termRegexes[QueryTokenType.PresenceTerm].source}|` +
    `${termRegexes[QueryTokenType.ExactTerm].source}|` +
    `${termRegexes[QueryTokenType.Term].source}`,
  'g'
);

const invalidCharsRegex = /(?:[\^*()_}\]\\[{>\\<|\\/…`~}^]+)/gi;
export const stripQueryInvalidChars = (rawText: string): string =>
  rawText.replace(invalidCharsRegex, '');

/**
 * A query token has a type and text.
 */
export class QueryToken {
  constructor(
    public type: QueryTokenType,
    public text: string
  ) {}
}

/**
 * Tokenizes a raw query text into the supported tokens.
 */
export class QueryTokenizer {
  private getTokenType(
    matchGroup: {[key: string]: string} = {}
  ): QueryTokenType {
    let type = QueryTokenType.Invalid;

    if (matchGroup.PresenceTerm) {
      type = QueryTokenType.PresenceTerm;
    } else if (matchGroup.ExactTerm) {
      type = QueryTokenType.ExactTerm;
    } else if (matchGroup.Term) {
      type = QueryTokenType.Term;
    }

    return type;
  }

  tokenize(rawQuery: string): QueryToken[] {
    const queryText = stripQueryInvalidChars(rawQuery);
    const tokens: QueryToken[] = [];

    for (const match of queryText.matchAll(tokenizerRegex)) {
      if (match && match.groups) {
        const type = this.getTokenType(match.groups);
        const text = (match[0] || '').trim();

        if (text && !isStopword(text)) {
          tokens.push(new QueryToken(type, text));
        }
      }
    }

    return tokens;
  }
}
