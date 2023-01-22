import {
  isNone,
  objectIntersection,
  objectDifference,
  removeArrayItem,
} from './utils/core';
import { collapseWhitespace, isBlank, stemWord } from './utils/string';
import { encodePostings, decodePostings } from './utils/encoding';
import { isStopword } from './stopwords';
import { ParsedQuery, QueryPart, QueryPartType } from './query/index';

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

interface DocParsedMetadata {
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
      if (!isStopword(text)) {
        const token = { text: stemWord(text), posting: start };
        start += text.length + 1;

        result.push(token);
      }
    }

    return result;
  }

  parseDocMetadata(meta: string): DocParsedMetadata {
    if (!meta) return { frequency: 0, postings: [] };

    const [frequencyStr, postingsStr] = meta.split('/');

    return {
      frequency: Number(frequencyStr),
      postings: decodePostings(postingsStr.split(',')),
    };
  }

  stringifyDocMetadata(meta: DocParsedMetadata): string {
    return `${meta.frequency}/${encodePostings(meta.postings).join(',')}`;
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

  private groupQueryParts(parts: QueryPart[]): PartGroups {
    const groups = { required: [], negated: [], simple: [] } as PartGroups;

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

  private searchPhrase({ uids, terms }: { uids: string[]; terms: string[] }) {
    const result: { [key: string]: number } = {};
    const totalTerms = terms.length;
    const postings: { [key: string]: number[] } = {};

    for (const uid of uids) {
      for (const term of terms) {
        const meta = this.parseDocMetadata(this.indexTable[term][uid]);
        postings[term] = meta.postings;
      }

      let t = 0;
      const stack = [postings[terms[0]].shift()];

      while (stack.length) {
        if (isNone(terms[t + 1]) || result[uid] === totalTerms) break;
        if (t === 0) result[uid] = 1;

        const currentPos = stack[stack.length - 1] as number;
        const nextExpected = currentPos + terms[t].length + 1;
        const nextPos = removeArrayItem(postings[terms[t + 1]], nextExpected);

        if (!isNone(nextPos)) {
          stack.push(nextPos);
          result[uid] += 1;
          t++;
        } else {
          t = 0;
          stack.length = 0;

          const firstNext = postings[terms[0]].shift();
          if (!isNone(firstNext)) stack.push(firstNext);
        }
      }

      if (result[uid] !== totalTerms) delete result[uid];
    }

    return result;
  }

  private getPhraseMatches(part: QueryPart) {
    const subterms = part.term.split(this.documentSplitter);

    // We're done if query part contains only a single term
    if (subterms.length === 1) {
      return this.getSimpleMatches(part);
    }

    // Retrieve docs that contain all subterms (phrase or not)
    const matches = this.getRequiredMatches(
      subterms.map((term) => ({ term, isPhrase: false } as QueryPart))
    );

    return this.searchPhrase({
      terms: subterms,
      uids: Object.keys(matches),
    });
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

  search(query: ParsedQuery) {
    const groupedParts = this.groupQueryParts(query.parts);
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
