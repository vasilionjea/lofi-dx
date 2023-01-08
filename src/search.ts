import {
  collapseWhitespace,
  isNone,
  isBlank,
  isStopWord,
  objectIntersection,
  objectDifference,
} from './utils';
import { Query, QueryPart, QueryPartType } from './parser';

interface SearchOptions {
  uidKey: string;
  searchFields?: string[] | Set<string>;
  splitter?: RegExp;
}

interface Doc {
  [key: string]: unknown;
}

interface DocTable {
  [key: string]: Doc;
}

interface DocEntry {
  // uid: metadata
  [key: string]: string;
}

interface IndexTable {
  // word: doc entry
  [key: string]: DocEntry;
}

interface DocEntryParsedMetadata {
  frequency: number;
  postings: number[];
}

interface PartGroups {
  required: QueryPart[];
  negated: QueryPart[];
  simple: QueryPart[];
}

const DEFAULT_UID_KEY = 'id';
const DEFAULT_DOCUMENT_SPLITTER = /\s+/g;

/**
 * Search class contains both the index table, the documents,
 * and allows searching them.
 */
export class Search {
  public static defaultSearchFields: Set<string> = new Set();
  readonly searchFields: Set<string>;

  private readonly uidKey: string;

  private readonly documentSplitter: RegExp;

  private readonly documentsTable: DocTable = {};
  private readonly indexTable: IndexTable = {};

  constructor(opts: SearchOptions) {
    this.uidKey = opts.uidKey || DEFAULT_UID_KEY;
    this.searchFields = new Set([
      ...(opts.searchFields || Search.defaultSearchFields),
    ]);
    this.documentSplitter = opts.splitter || DEFAULT_DOCUMENT_SPLITTER;
  }

  private tokenizeText(text: string) {
    return collapseWhitespace(text)
      .toLocaleLowerCase()
      .split(this.documentSplitter);
  }

  private tokensWithPostings(tokens: string[]) {
    const result = [];
    let start = 0;

    for (const text of tokens) {
      if (!isStopWord(text)) {
        const token = { text, posting: start };
        start += text.length + 1;

        result.push(token);
      }
    }

    return result;
  }

  parseDocMetadata(meta: string): DocEntryParsedMetadata {
    if (!meta) return { frequency: 0, postings: [] };

    const [frequencyStr, postingsStr] = meta.split('/');

    return {
      frequency: Number(frequencyStr),
      postings: postingsStr.split(',').map(Number),
    };
  }

  stringifyDocMetadata(meta: DocEntryParsedMetadata): string {
    return `${meta.frequency}/${meta.postings.join(',')}`;
  }

  index(field: string) {
    if (isNone(field) || isBlank(field)) return this;

    this.searchFields.add(field);

    for (const doc of Object.values(this.documentsTable)) {
      this.indexDocument(field, doc);
    }
    return this;
  }

  private indexDocument(field: string, doc: Doc) {
    const uid = doc[this.uidKey] as string;
    if (isNone(uid)) return;

    const tokens = this.tokensWithPostings(
      this.tokenizeText(doc[field] as string)
    );

    for (const token of tokens) {
      if (!this.indexTable[token.text]) this.indexTable[token.text] = {};

      const meta = this.parseDocMetadata(this.indexTable[token.text][uid]);

      // Postings & frequency
      meta.postings.push(token.posting);
      meta.frequency += 1;

      // Add to index
      this.indexTable[token.text][uid] = this.stringifyDocMetadata(meta);
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
    const groups = {
      required: [],
      negated: [],
      simple: [],
    } as PartGroups;

    for (const part of parts) {
      switch (part.type) {
        case QueryPartType.Required:
          groups.required.push(part);
          break;

        case QueryPartType.Negated:
          groups.negated.push(part);
          break;

        case QueryPartType.Simple:
          groups.simple.push(part);
          break;
      }
    }

    return groups;
  }

  private getSimpleMatches(part: QueryPart) {
    const tokenTable = (part && this.indexTable[part.term]) || {};
    return { ...tokenTable };
  }

  private getRequiredMatches(parts: QueryPart[]) {
    let matches = {};

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const tokenTable = part.isPhrase
        ? this.getPhraseMatches(part)
        : this.getSimpleMatches(part);

      if (tokenTable) {
        matches =
          i === 0 ? tokenTable : objectIntersection(matches, tokenTable);
      } else {
        matches = {};
        break;
      }
    }

    return matches;
  }

  private getPhraseMatches(part: QueryPart) {
    const result: { [key: string]: unknown } = {};
    const terms = part.term.split(this.documentSplitter);

    // Retrieve docs that have all the terms
    const matches = this.getRequiredMatches(
      terms.map((term) => ({ term, isPhrase: false } as QueryPart))
    );

    // Stop here if query part contains a single term for this phrase
    if (terms.length === 1) return matches;

    // Now check them for a phrase
    for (const uid of Object.keys(matches)) {
      for (let i = 0; i < terms.length; i++) {
        const term = terms[i];
        const nextTerm = terms[i + 1];

        if (isNone(nextTerm)) break; // no more terms

        const currentRef = this.parseDocMetadata(this.indexTable[term][uid]);
        const nextRef = this.parseDocMetadata(this.indexTable[nextTerm][uid]);

        for (const pos of currentRef.postings) {
          if (nextRef.postings.includes(pos + term.length + 1)) {
            result[uid] = currentRef;
            break;
          } else {
            // Delete the happy path as it's now invalid
            delete result[uid];
            break;
          }
        }
      }
    }

    return result;
  }

  private getMatches(parts: QueryPart[]) {
    const matches = {};

    for (const part of parts) {
      if (part.isPhrase) {
        Object.assign(matches, this.getPhraseMatches(part));
      } else {
        Object.assign(matches, this.getSimpleMatches(part));
      }
    }

    return matches;
  }

  search(query: Query) {
    const groupedParts = this.groupParts(query.parts);
    const negatedMatches = this.getMatches(groupedParts.negated);

    // Stop early if we have required terms
    if (groupedParts.required.length) {
      const requiredMatches = this.getRequiredMatches(groupedParts.required);
      return Object.keys(objectDifference(requiredMatches, negatedMatches)).map(
        (uid) => this.documentsTable[uid]
      );
    }

    // Return matches without the ones from negated terms
    const simpleMatches = this.getMatches(groupedParts.simple);
    return Object.keys(objectDifference(simpleMatches, negatedMatches)).map(
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
      searchFields: [...this.searchFields],
      documents: this.getDocumentsTable(),
      index: this.getIndexTable(),
    };
  }
}
