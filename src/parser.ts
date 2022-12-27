import { Token, TokenType } from './tokenizer';
import { unquote, stripModifiers, collapseWhitespace } from './utils';

export interface QueryPart {
  term: string;
  negated: boolean;
  required: boolean;
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
      part.negated = true;
    } else if (term.startsWith('+')) {
      part.required = true;
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
        negated: false,
        required: false,
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
