import {InvertedIndex} from './inverted-index';
import {InvertedSearch} from './inverted-search';
import type {IndexConfig, Serializable} from './inverted-index';
import type {SearchConfig} from './inverted-search';

export {InvertedIndex as Index, InvertedSearch as Search};
export type {IndexConfig, Serializable, SearchConfig};

export function createIndex(config: IndexConfig) {
  return new InvertedIndex(config);
}

export function createSearch(index: InvertedIndex, config?: SearchConfig) {
  return new InvertedSearch(index, config);
}
