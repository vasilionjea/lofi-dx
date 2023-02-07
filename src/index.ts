import * as stopwords from './stopwords';
import { createStorage } from './utils/storage';
import { parseQuery } from './query/index';
import { createIndex, createSearch } from './search/index';

export { stopwords, parseQuery, createIndex, createSearch, createStorage };
