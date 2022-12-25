import { Token, TokenType } from './tokenizer';
import { unquote, stripModifiers, collapseWhitespace } from './utils';

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
    const term = collapseWhitespace(unquote(part.term));

    if (term.startsWith('-')) {
      part.negate = true;
    } else if (term.startsWith('+')) {
      part.require = true;
    }

    part.term = stripModifiers(term);
  }

  private parseExact(part: QueryPart) {
    part.term = collapseWhitespace(unquote(part.term));
  }

  parse() {
    const query = new Query();

    for (const token of this.tokens) {
      const part: QueryPart = {
        term: token.text.toLocaleLowerCase(),
        negate: false,
        require: false,
      };

      switch (token.type) {
        case TokenType.PresenceTerm:
          this.parsePresence(part);
          break;

        case TokenType.ExactTerm:
          this.parseExact(part);
          break;
      }

      query.add(part);
    }

    return query;
  }
}
