import {
  collapseWhitespace,
  unquote,
  stripModifiers,
  stemWord,
} from '../utils/string';
import { stripStopwords } from '../stopwords';
import { QueryToken, QueryTokenType } from './tokenizer';

/**
 * A query is made of parts, each part being of a specific type.
 */
export enum QueryPartType {
  Simple,
  Negated,
  Required,
}

/**
 * A query is made of parts and a part can be a phrase.
 */
export interface QueryPart {
  term: string;
  type: QueryPartType;
  isPhrase: boolean;
}

/**
 * An instance of ParsedQuery is used to search the index.
 */
export class ParsedQuery {
  readonly parts: QueryPart[] = [];

  add(part: QueryPart) {
    this.parts.push(part);
  }
}

/**
 * From an array of QueryToken instances, it returns a ParsedQuery
 * instance, which can be used to search the index.
 */
export class QueryParser {
  constructor(public readonly tokens: QueryToken[]) {}

  /**
   * Parses a presence token into a Required or Negated query part.
   */
  private parsePresence(token: QueryToken): QueryPart {
    let term = collapseWhitespace(token.text.toLocaleLowerCase()).trim();
    let type = QueryPartType.Simple;
    let isPhrase = false;

    if (term.startsWith('-')) {
      type = QueryPartType.Negated;
    } else if (term.startsWith('+')) {
      type = QueryPartType.Required;
    }

    term = stripModifiers(term);

    if (term.startsWith('"')) {
      term = unquote(term).trim();
      isPhrase = true;
    }

    term = stripStopwords(term);
    term = stemWord(term);

    return {
      term,
      type,
      isPhrase,
    };
  }

  /**
   * Parses an exact token into a simple phrase part.
   */
  private parseExact(token: QueryToken): QueryPart {
    let term = unquote(token.text.toLocaleLowerCase());
    term = collapseWhitespace(term).trim();
    term = stripStopwords(term);
    term = stemWord(term);

    return {
      term,
      type: QueryPartType.Simple,
      isPhrase: true,
    };
  }

  /**
   * Parses a token into a simple query part.
   */
  private parseSimple(token: QueryToken): QueryPart {
    return {
      term: stemWord(token.text.toLocaleLowerCase().trim()),
      type: QueryPartType.Simple,
      isPhrase: false,
    };
  }

  /**
   * Parses each query token into query parts and returns a ParsedQuery.
   */
  parse() {
    const query = new ParsedQuery();

    for (const token of this.tokens) {
      let part: QueryPart;

      switch (token.type) {
        case QueryTokenType.PresenceTerm:
          part = this.parsePresence(token);
          break;

        case QueryTokenType.ExactTerm:
          part = this.parseExact(token);
          break;

        default:
          part = this.parseSimple(token);
          break;
      }

      if (part.term) query.add(part);
    }

    return query;
  }
}
