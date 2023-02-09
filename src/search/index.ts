import { InvertedIndex, IndexConfig, Serializable } from './inverted-index';
import { InvertedSearch, SearchConfig } from './inverted-search';

export {
  InvertedIndex as Index,
  IndexConfig,
  Serializable,
  SearchConfig,
  InvertedSearch as Search,
};

export function createIndex(config: IndexConfig) {
  return new InvertedIndex(config);
}

export function createSearch(index: InvertedIndex, config?: SearchConfig) {
  return new InvertedSearch(index, config);
}
