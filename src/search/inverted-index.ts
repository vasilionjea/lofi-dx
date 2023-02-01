import { isNone, deepClone } from '../utils/core';
import { collapseWhitespace, isBlank, stemWord } from '../utils/string';
import {
  encodeMetadata,
  parseMetadata,
  ParsedMetadata,
} from '../utils/encoding';
import { isStopword } from '../stopwords';

export interface InvertedIndexConfig {
  uidKey: string;
  fields?: string[];
  splitter?: RegExp;
  storageKey?: string;
}

export type Doc = { [key: string]: unknown };
export type DocTable = { [key: string]: Doc };

export type TermTable = { [key: string]: string };
export type IndexTable = { [key: string]: TermTable };

export type DocTermCounts = { [key: string]: number };

export type SerializableDocData = [
  number, // total docs
  DocTable, // doc table
  DocTermCounts // doc term counts
];

export interface Serializable {
  fields: string[];
  documents: SerializableDocData;
  index: IndexTable;
}

const DEFAULT_UID_KEY = 'id';
const DEFAULT_DOCUMENT_SPLITTER = /\s+/g;
const DEFAULT_STORAGE_KEY = 'lofi-dx:index';

/**
 * InvertedIndex contains both the index table and the documents.
 */
export class InvertedIndex {
  private readonly uidKey: string;
  private readonly documentSplitter: RegExp;
  private readonly storageKey: string;

  private fields: Set<string>;
  private documentsTable: DocTable = {};
  private indexTable: IndexTable = {};
  private documentTermCounts: DocTermCounts = {};

  private totalDocuments = 0;

  get totalDocs(): number {
    return this.totalDocuments;
  }

  constructor(opts: InvertedIndexConfig) {
    this.uidKey = opts.uidKey || DEFAULT_UID_KEY;
    this.fields = new Set(opts.fields);
    this.documentSplitter = opts.splitter || DEFAULT_DOCUMENT_SPLITTER;
    this.storageKey = opts.storageKey || DEFAULT_STORAGE_KEY;
  }

  private tokenizeText(text: string) {
    return collapseWhitespace(text)
      .toLocaleLowerCase()
      .split(this.documentSplitter);
  }

  private tokensWithPostings(tokens: string[]) {
    const result = [];
    let start = 0;

    for (const term of tokens) {
      if (!isStopword(term)) {
        const stemmed = stemWord(term);
        const token = { term: stemmed, posting: start };
        start += stemmed.length + 1;
        result.push(token);
      }
    }

    return result;
  }

  index(field: string) {
    if (isNone(field) || isBlank(field)) return this;
    this.fields.add(field);

    for (const doc of Object.values(this.documentsTable)) {
      this.indexDocument(field, doc);
    }

    return this;
  }

  private indexDocument(field: string, doc: Doc) {
    const uid = doc[this.uidKey] as string;
    if (isNone(uid) || isNone(doc[field])) return;

    const tokens = this.tokensWithPostings(
      this.tokenizeText(doc[field] as string)
    );
    this.documentTermCounts[uid] += tokens.length;

    for (const token of tokens) {
      if (!this.indexTable[token.term]) this.indexTable[token.term] = {};

      // Update positions, and total terms for this doc
      const meta = this.getDocumentEntry(token.term, uid) as ParsedMetadata;
      meta.postings?.push(token.posting);

      // Add to index
      this.indexTable[token.term][uid] = encodeMetadata(meta);
    }
  }

  addDocuments(docs: Doc[]) {
    if (isNone(docs) || !Array.isArray(docs)) return this;

    for (const doc of docs) {
      const uid = doc[this.uidKey] as string;

      // Count unique docs
      if (!this.documentsTable[uid]) this.totalDocuments += 1;

      // Add document
      this.documentsTable[uid] = doc;
      this.documentTermCounts[uid] = 0;

      // Re-index search fields for added doc
      this.fields.forEach((field) => this.indexDocument(field, doc));
    }

    return this;
  }

  getDocument(uid: string): Doc {
    return this.documentsTable[uid];
  }

  getDocumentTermCount(uid: string): number {
    return this.documentTermCounts[uid] || 0;
  }

  getTermEntry(term: string): TermTable {
    return this.indexTable[term] || {};
  }

  getDocumentEntry(
    term: string,
    uid: string,
    parse = true
  ): ParsedMetadata | string {
    const termEntry = this.getTermEntry(term);
    if (parse) return parseMetadata(termEntry[uid]);
    return termEntry[uid];
  }

  toJSON(): Serializable {
    return {
      fields: [...this.fields],
      documents: [
        this.totalDocuments,
        deepClone(this.documentsTable),
        deepClone(this.documentTermCounts),
      ],
      index: deepClone(this.indexTable),
    };
  }

  private setLoaded({ fields, documents, index }: Serializable) {
    const [totalDocuments, documentsTable, documentTermCounts] = documents;

    this.fields = new Set(fields);
    this.totalDocuments = totalDocuments;
    this.documentsTable = documentsTable;
    this.documentTermCounts = documentTermCounts;
    this.indexTable = index;
  }

  get isStored(): boolean {
    return Boolean(localStorage.getItem(this.storageKey));
  }

  /**
   * Saves a snapshot of the index and its document to local storage.
   */
  saveStore(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const data: Serializable = this.toJSON();
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        resolve(true);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  /**
   * Sets a previously stored index and its documents.
   */
  loadStore(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const result = localStorage.getItem(this.storageKey);

      if (!result) {
        resolve(false);
        return;
      }

      try {
        const parsed = JSON.parse(result) as Serializable;
        this.setLoaded(parsed);
        resolve(true);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  /**
   * Clear stored index and its documents.
   */
  clearStore(): Promise<void> {
    return new Promise((resolve) => {
      localStorage.removeItem(this.storageKey);
      resolve();
    });
  }
}
