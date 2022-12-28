import {
  collapseWhitespace,
  isNone,
  isBlank,
  hasOwnProperty,
  objectIntersection,
  objectDifference,
} from './utils';
import { Query, QueryPart } from './parser';

interface SearchOptions {
  uidKey: string;
  searchFields?: string[];
}

interface Doc {
  [key: string]: unknown;
}

interface DocTable {
  [key: string]: Doc;
}

interface IndexTokenTable {
  // doc uid: frequency
  [key: string]: number;
}

interface IndexTable {
  // token
  [key: string]: IndexTokenTable;
}

interface PartGroups {
  required: QueryPart[];
  negated: QueryPart[];
  rest: QueryPart[];
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

  private readonly documentsTable: DocTable = {};
  private readonly indexTable: IndexTable = {};

  constructor(opts: SearchOptions) {
    this.uidKey = opts.uidKey || DEFAULT_UID_KEY;
    this.searchFields = (
      opts.searchFields || Search.defaultSearchFields
    ).concat();
  }

  private tokenizeFieldValue(value: string) {
    return collapseWhitespace(value)
      .toLocaleLowerCase()
      .split(DOCUMENT_SPLITTER);
  }

  index(field: string) {
    if (isNone(field) || isBlank(field)) return this;
    for (const doc of Object.values(this.documentsTable)) {
      this.indexDocument(field, doc);
    }
    return this;
  }

  private indexDocument(field: string, doc: Doc) {
    const uid = doc[this.uidKey] as string;
    if (isNone(uid)) return;

    for (const token of this.tokenizeFieldValue(doc[field] as string)) {
      if (!this.indexTable[token]) this.indexTable[token] = {};

      let frequency = this.indexTable[token][uid] || 0;
      this.indexTable[token][uid] = ++frequency;
    }
  }

  addDocuments(docs: Doc[]) {
    if (isNone(docs) || !Array.isArray(docs)) return this;

    for (const doc of docs) {
      const uid = doc[this.uidKey] as string;
      this.documentsTable[uid] = doc;
    }

    // Re-index search fields after adding docs
    this.searchFields.forEach((field) => this.index(field));
    return this;
  }

  private groupParts(parts: QueryPart[]): PartGroups {
    const groups = { required: [], negated: [], rest: [] } as PartGroups;

    for (const part of parts) {
      if (part.required) {
        groups.required.push(part);
      } else if (part.negated) {
        groups.negated.push(part);
      } else {
        groups.rest.push(part);
      }
    }

    return groups;
  }

  private getMatches(parts: QueryPart[]) {
    const matches = {};

    for (const part of parts) {
      const tokenTable = this.indexTable[part.term] || {};
      Object.assign(matches, tokenTable);
    }

    return matches;
  }

  private getMatchesForRequired(parts: QueryPart[]) {
    let matches = {};

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const tokenTable = this.indexTable[part.term];

      if (tokenTable) {
        // Multiple required terms are a logical AND, e.g. `+foo +bar` means "foo" AND "bar"
        matches =
          i === 0 ? tokenTable : objectIntersection(matches, tokenTable);
      }
    }

    return Object.keys(matches as IndexTokenTable);
  }

  search(query: Query) {
    const groupedParts = this.groupParts(query.parts);
    const negatedMatches = this.getMatches(groupedParts.negated);

    // Stop early if we have required terms
    if (groupedParts.required.length) {
      return this.getMatchesForRequired(groupedParts.required)
        .filter((uid) => !hasOwnProperty(negatedMatches, uid))
        .map((uid) => this.documentsTable[uid]);
    }

    // Return matches without the ones from negated terms
    const restOfMatches = this.getMatches(groupedParts.rest);
    return Object.keys(objectDifference(restOfMatches, negatedMatches)).map(
      (uid) => this.documentsTable[uid]
    );
  }

  getDocumentsTable() {
    return { ...this.documentsTable };
  }

  getIndexTable() {
    return { ...this.indexTable };
  }

  toJSON() {
    return {
      searchFields: this.searchFields.concat(),
      documents: this.getDocumentsTable(),
      index: this.getIndexTable(),
    };
  }
}
