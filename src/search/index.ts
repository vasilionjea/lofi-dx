import { InvertedIndex, IndexConfig, Serializable } from './inverted-index';
import { InvertedSearch, SearchConfig } from './inverted-search';

export type Index = InvertedIndex;
export type Search = InvertedSearch;

export { IndexConfig, Serializable, SearchConfig };

export function createIndex(config: IndexConfig) {
  return new InvertedIndex(config);
}

export function createSearch(index: InvertedIndex, config: SearchConfig) {
  return new InvertedSearch(index, config);
}
