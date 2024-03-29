import {hasOwn, isNone, isNumber, isString, deepClone} from '../utils/core';
import {collapseWhitespace, isBlank, stemWord} from '../utils/string';
import {encodeMetadata, parseMetadata} from '../utils/encoding';
import {isStopword} from '../stopwords';
import type {ParsedMetadata} from '../utils/encoding';

export interface IndexConfig {
  uidKey?: string;
  fields: string[];
  splitter?: RegExp;
}

export type Doc = {[key: string]: unknown};
export type DocTable = {[key: string]: Doc};

export type TermTable = {[key: string]: string};
export type IndexTable = {[key: string]: TermTable};

export type DocTermCounts = {[key: string]: number};

export type SerializableDocData = [
  number, // total docs
  DocTable,
  DocTermCounts,
];

export interface Serializable {
  fields: string[];
  documents: SerializableDocData;
  index: IndexTable;
}

const DEFAULT_UID_KEY = 'id';
const DEFAULT_DOCUMENT_SPLITTER = /\s+/g;

/**
 * InvertedIndex contains both the index table and the documents.
 */
export class InvertedIndex {
  private readonly uidKey: string;
  private readonly docSplitter: RegExp;

  private fields: Set<string>;
  private docTable: DocTable = {};
  private indexTable: IndexTable = {};
  private docTermCounts: DocTermCounts = {};

  private totalDocs = 0;

  constructor(opts: IndexConfig) {
    this.uidKey = opts.uidKey || DEFAULT_UID_KEY;
    this.fields = new Set(opts.fields || []);
    this.docSplitter = opts.splitter || DEFAULT_DOCUMENT_SPLITTER;
  }

  private tokenizeText(text: string) {
    return collapseWhitespace(text).toLocaleLowerCase().split(this.docSplitter);
  }

  private tokensWithPositions(tokens: string[]) {
    const result = [];
    let start = 0;

    for (const term of tokens) {
      if (!isStopword(term)) {
        const stemmed = stemWord(term);
        const token = {term: stemmed, position: start};
        start += stemmed.length + 1;
        result.push(token);
      }
    }

    return result;
  }

  private normalizeUid(val: string) {
    let uid = val;

    if (isNumber(uid)) uid = uid.toString();
    if (isString(uid)) uid = uid.trim();

    return uid;
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
    const uid = this.normalizeUid(doc[this.uidKey] as string);
    if (!isString(uid) || isBlank(uid)) return;

    const fieldValue = doc[field] as string;
    if (!isString(fieldValue) || isBlank(fieldValue)) return;

    const tokens = this.tokensWithPositions(this.tokenizeText(fieldValue));
    this.docTermCounts[uid] += tokens.length;

    for (const token of tokens) {
      if (!hasOwn(this.indexTable, token.term)) {
        this.indexTable[token.term] = {};
      }

      // Update positions for this doc
      const meta = this.getDocumentEntry(token.term, uid) as ParsedMetadata;
      meta.positions?.push(token.position);

      // Add to term index
      this.indexTable[token.term][uid] = encodeMetadata(meta);
    }
  }

  addDocuments(docs: Doc[]) {
    if (!Array.isArray(docs) || !docs.length) return this;

    for (const doc of docs) {
      const uid = this.normalizeUid(doc[this.uidKey] as string);
      if (!isString(uid) || isBlank(uid)) continue;

      // Count unique docs
      if (!hasOwn(this.docTable, uid)) this.totalDocs += 1;

      // Add doc
      this.docTable[uid] = doc;
      this.docTermCounts[uid] = 0;

      // Index doc
      this.fields.forEach(field => this.indexDocument(field, doc));
    }

    return this;
  }

  loadFromStorage({fields, documents, index}: Serializable) {
    const [totalDocs, docTable, docTermCounts] = documents;
    this.fields = new Set(fields);
    this.totalDocs = totalDocs;
    this.docTable = docTable;
    this.docTermCounts = docTermCounts;
    this.indexTable = index;
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

  hasTermEntry(term: string): boolean {
    return hasOwn(this.indexTable, term);
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

  forEach(callback: (value: string) => void) {
    Object.keys(this.indexTable).forEach(callback);
  }
}
