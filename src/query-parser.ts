import { Token, TokenType } from './query-tokenizer';
import {
  unquote,
  stripModifiers,
  collapseWhitespace,
  stripStopWords,
  stemmer,
} from './utils';

export enum QueryPartType {
  Simple,
  Negated,
  Required,
}

export interface QueryPart {
  term: string;
  type: QueryPartType;
  isPhrase: boolean;
}

export class Query {
  readonly parts: QueryPart[] = [];

  add(part: QueryPart) {
    this.parts.push(part);
  }
}

export class QueryParser {
  constructor(public readonly tokens: Token[]) { }

  private parsePresence(part: QueryPart) {
    let term = collapseWhitespace(part.term).trim();

    if (term.startsWith('-')) {
      part.type = QueryPartType.Negated;
    } else if (term.startsWith('+')) {
      part.type = QueryPartType.Required;
    }

    term = stripModifiers(term);

    if (term.startsWith('"')) {
      part.isPhrase = true;
    }

    part.term = unquote(term).trim();
    part.term = stripStopWords(part.term);
    part.term = stemmer(part.term);
  }

  private parseExact(part: QueryPart) {
    part.isPhrase = true;
    part.term = collapseWhitespace(unquote(part.term));
    part.term = stripStopWords(part.term);
    part.term = stemmer(part.term);
  }

  parse() {
    const query = new Query();

    for (const token of this.tokens) {
      const part: QueryPart = {
        term: stemmer(token.text.toLocaleLowerCase()),
        isPhrase: false,
        type: QueryPartType.Simple,
      };

      switch (token.type) {
        case TokenType.PresenceTerm:
          this.parsePresence(part);
          break;

        case TokenType.ExactTerm:
          this.parseExact(part);
          break;
      }

      if (part.term) {
        query.add(part);
      }
    }

    return query;
  }
}
