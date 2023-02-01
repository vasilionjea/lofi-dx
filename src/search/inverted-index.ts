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
  DocTable,
  DocTermCounts
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
  private readonly docSplitter: RegExp;
  private readonly storageKey: string;

  private fields: Set<string>;
  private docTable: DocTable = {};
  private indexTable: IndexTable = {};
  private docTermCounts: DocTermCounts = {};

  private totalDocs = 0;

  constructor(opts: InvertedIndexConfig) {
    this.uidKey = opts.uidKey || DEFAULT_UID_KEY;
    this.fields = new Set(opts.fields || []);
    this.docSplitter = opts.splitter || DEFAULT_DOCUMENT_SPLITTER;
    this.storageKey = opts.storageKey || DEFAULT_STORAGE_KEY;
  }

  private tokenizeText(text: string) {
    return collapseWhitespace(text).toLocaleLowerCase().split(this.docSplitter);
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

    for (const doc of Object.values(this.docTable)) {
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
    this.docTermCounts[uid] += tokens.length;

    for (const token of tokens) {
      if (!this.indexTable[token.term]) this.indexTable[token.term] = {};

      // Update positions for this doc
      const meta = this.getDocumentEntry(token.term, uid) as ParsedMetadata;
      meta.postings?.push(token.posting);

      // Add to term index
      this.indexTable[token.term][uid] = encodeMetadata(meta);
    }
  }

  addDocuments(docs: Doc[]) {
    if (isNone(docs) || !Array.isArray(docs)) return this;

    for (const doc of docs) {
      const uid = doc[this.uidKey] as string;

      // Count unique docs
      if (!this.docTable[uid]) this.totalDocs += 1;

      // Add doc
      this.docTable[uid] = doc;
      this.docTermCounts[uid] = 0;

      // Index doc
      this.fields.forEach((field) => this.indexDocument(field, doc));
    }

    return this;
  }

  getDocument(uid: string): Doc {
    return this.docTable[uid];
  }

  getDocumentCount(): number {
    return this.totalDocs;
  }

  getDocumentTermCount(uid: string): number {
    return this.docTermCounts[uid] || 0;
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
        this.totalDocs,
        deepClone(this.docTable),
        deepClone(this.docTermCounts),
      ],
      index: deepClone(this.indexTable),
    };
  }

  private setLoaded({ fields, documents, index }: Serializable) {
    const [totalDocs, docTable, docTermCounts] = documents;

    this.fields = new Set(fields);
    this.totalDocs = totalDocs;
    this.docTable = docTable;
    this.docTermCounts = docTermCounts;
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
