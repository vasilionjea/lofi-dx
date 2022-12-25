import {
  collapseWhitespace,
  isNone,
  isBlank,
  objectIntersection,
  typeOf,
} from './utils';
import { Query } from './parser';

interface SearchOptions {
  uidKey: string;
  searchFields?: string[];
}

interface Doc {
  [key: string]: unknown;
}

interface IndexTable {
  [key: string]: {
    [key: string]: Doc;
  };
}

const DEFAULT_UID_KEY = 'id';
const DOCUMENT_SPLITTER = /\s+/g;

/**
 * Search class contains both the index table, the documents,
 * and allows searching them.
 */
export class Search {
  public static defaultSearchFields: string[] = [];
  readonly searchFields: string[];

  private readonly uidKey: string;

  private readonly documents: Doc[] = [];
  private readonly indexTable: IndexTable = {};

  constructor(opts: SearchOptions) {
    this.uidKey = opts.uidKey || DEFAULT_UID_KEY;
    this.searchFields =
      opts.searchFields || Search.defaultSearchFields.concat();

    // Documents haven't been added yet :(
    // this.searchFields.forEach(field => this.index(field));
  }

  private tokenizeField(value: string) {
    return collapseWhitespace(value)
      .toLocaleLowerCase()
      .split(DOCUMENT_SPLITTER);
  }

  index(field: string) {
    if (isNone(field) || isBlank(field)) return this;
    if (typeOf(field) !== 'string') return this;

    for (const doc of this.documents) {
      const uid = doc[this.uidKey] as string;
      this.indexDocument(field, { uid, doc });
    }

    return this;
  }

  private indexDocument(field: string, obj: { uid: string; doc: Doc }) {
    const { uid, doc } = obj;
    if (isNone(uid)) return;

    for (const token of this.tokenizeField(doc[field] as string)) {
      if (typeOf(this.indexTable[token]) !== 'object') {
        this.indexTable[token] = {};
      }
      this.indexTable[token][uid] = doc;
    }
  }

  addDocuments(docs: Doc[]) {
    if (isNone(docs) || !Array.isArray(docs)) return this;
    this.documents.push(...docs);
    return this;
  }

  search(query: Query) {
    let result = {};
    const size = query.parts.length;

    for (let i = 0; i < size; i++) {
      const part = query.parts[i];
      const tokenTable = this.indexTable[part.term];

      // Currently search works only for single terms like: 'designer'
      //
      // (TODO) Implement all search matchers:
      // 1. Exact terms: "product designer"
      // 2. Presence terms: -designer +engineer

      // eslint-disable-next-line no-debugger
      // debugger;

      if (tokenTable) {
        result = i === 0 ? tokenTable : objectIntersection(result, tokenTable);
      }
    }

    return Object.values(result);
  }
}
