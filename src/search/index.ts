import { InvertedIndex, IndexConfig } from './inverted-index';
import { InvertedSearch, SearchConfig } from './inverted-search';

function createIndex(config: IndexConfig) {
  return new InvertedIndex(config);
}

function createSearch(index: InvertedIndex, config: SearchConfig) {
  return new InvertedSearch(index, config);
}

export { createIndex, createSearch };
