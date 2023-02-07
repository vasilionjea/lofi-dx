import { InvertedIndex } from './search/inverted-index';
import { InvertedSearch } from './search/inverted-search';

export type Index = InvertedIndex;
export { IndexConfig, Serializable } from './search/inverted-index';

export type Search = InvertedSearch;
export { SearchConfig } from './search/inverted-search';

export { Storage } from './utils/storage';
