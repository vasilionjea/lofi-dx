import { collapseWhitespace, isNone, isBlank } from './utils';
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

interface IndexTable {
  // token
  [key: string]: {
    // uid: frequency
    [key: string]: number;
  };
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

  private getMatchesForParts(parts: QueryPart[]) {
    const matches = {};

    for (const part of parts) {
      const tokenTable = this.indexTable[part.term] || {};
      Object.assign(matches, tokenTable);
    }

    return matches;
  }

  private getGroupedParts(parts: QueryPart[]): PartGroups {
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

  search(query: Query) {
    const groupedParts = this.getGroupedParts(query.parts);
    const matches = {
      required: this.getMatchesForParts(groupedParts.required),
      negated: this.getMatchesForParts(groupedParts.negated),
      rest: this.getMatchesForParts(groupedParts.rest),
    };

    console.log('matches:', matches.rest);
    console.log('negated matches:', matches.negated);
    console.log('required matches:', matches.required);
  }
}
