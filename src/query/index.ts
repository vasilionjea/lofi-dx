import {QueryToken, QueryTokenizer} from './tokenizer';
import {QueryParser, QueryPart, QueryPartType, ParsedQuery} from './parser';

export interface PartGroups {
  required: QueryPart[];
  negated: QueryPart[];
  simple: QueryPart[];
}

const queryTokenizer = new QueryTokenizer();
const queryParser = new QueryParser();

/**
 * Tokenizes a raw query and returns a ParsedQuery instance.
 */
export function parseQuery(rawText = ''): ParsedQuery {
  if (!rawText) return new ParsedQuery();
  const tokens: QueryToken[] = queryTokenizer.tokenize(rawText);
  return queryParser.parse(tokens);
}

/**
 * Returns a lookup map for query parts by type.
 */
export function groupQueryParts(parts: QueryPart[]): PartGroups {
  const groups = {
    required: [],
    negated: [],
    simple: [],
  } as PartGroups;

  for (const part of parts) {
    switch (part.type) {
      case QueryPartType.Required:
        groups.required.push(part);
        break;

      case QueryPartType.Negated:
        groups.negated.push(part);
        break;

      case QueryPartType.Simple:
        groups.simple.push(part);
        break;
    }
  }

  return groups;
}

// Re-export for outside usage/extension
export * from './tokenizer';
export * from './parser';
