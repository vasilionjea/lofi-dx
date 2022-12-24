import { Token, TokenType } from './tokenizer';
import { unquote, stripModifiers, stripWhitespace } from './utils';

export interface QueryPart {
  term: string;
  negate: boolean;
  require: boolean;
}

export class Query {
  readonly parts: QueryPart[] = [];

  add(part: QueryPart) {
    this.parts.push(part);
  }
}

export class QueryParser {
  constructor(public readonly tokens: Token[]) {}

  private parsePresence(part: QueryPart) {
    const term = unquote(part.term).trim();

    if (term.startsWith('-')) {
      part.negate = true;
    } else if (term.startsWith('+')) {
      part.require = true;
    }

    part.term = stripModifiers(term);
  }

  parse() {
    const query = new Query();

    for (const token of this.tokens) {
      const term = stripWhitespace(token.text.toLocaleLowerCase());
      const part: QueryPart = { term, negate: false, require: false };

      switch (token.type) {
        case TokenType.PresenceTerm:
          this.parsePresence(part);
          break;

        case TokenType.ExactTerm:
          part.term = unquote(part.term).trim();
          break;
      }

      query.add(part);
    }

    return query;
  }
}
