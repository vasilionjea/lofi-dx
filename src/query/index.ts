import { QueryToken, QueryTokenizer } from './tokenizer';
import { QueryParser, ParsedQuery } from './parser';

/**
 * Tokenizes a raw query and returns a ParsedQuery instance.
 */
export function createQuery(rawText = ''): ParsedQuery {
  if (!rawText) return new ParsedQuery();
  const tokens: QueryToken[] = new QueryTokenizer(rawText).tokenize();
  return new QueryParser(tokens).parse();
}

// Re-export for outside usage/extension
export * from './tokenizer';
export * from './parser';
