import { isNone } from '../utils/core';
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
}

export interface Doc {
  [key: string]: unknown;
}

export interface DocTable {
  [key: string]: Doc;
}

export interface DocEntry {
  // uid: metadata
  [key: string]: string;
}

export interface IndexTable {
  // word: doc entry
  [key: string]: DocEntry;
}

const DEFAULT_UID_KEY = 'id';
const DEFAULT_DOCUMENT_SPLITTER = /\s+/g;

/**
 * InvertedIndex contains both the index table and the documents.
 */
export class InvertedIndex {
  private readonly uidKey: string;
  private readonly fields: Set<string>;
  private readonly documentSplitter: RegExp;

  private readonly documentsTable: DocTable = {};
  private tempDocTermCount: { [key: string]: number } = {};
  private totalDocuments = 0;

  private readonly indexTable: IndexTable = {};

  get totalDocs() {
    return this.totalDocuments;
  }

  constructor(opts: InvertedIndexConfig) {
    this.uidKey = opts.uidKey || DEFAULT_UID_KEY;
    this.fields = new Set(opts.fields);
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
    if (isNone(uid)) return;

    const tokens = this.tokensWithPostings(
      this.tokenizeText(doc[field] as string)
    );
    const totalTokens = tokens.length; // tokens for this field
    const totalDocTerms = this.tempDocTermCount[uid] || 0;

    for (const token of tokens) {
      if (!this.indexTable[token.term]) this.indexTable[token.term] = {};

      // Update positions, and total terms for this doc
      const meta = this.getDocumentEntry(token.term, uid) as ParsedMetadata;
      meta.postings?.push(token.posting);
      meta.totalTerms = totalDocTerms
        ? totalDocTerms + totalTokens
        : totalTokens;
      this.tempDocTermCount[uid] = meta.totalTerms;

      // Add to index
      this.indexTable[token.term][uid] = encodeMetadata(meta);
    }
  }

  addDocuments(docs: Doc[]) {
    if (isNone(docs) || !Array.isArray(docs)) return this;

    for (const doc of docs) {
      const uid = doc[this.uidKey] as string;
      this.documentsTable[uid] = doc;
      this.totalDocuments += 1;
    }

    // Re-index search fields after adding docs
    this.fields.forEach((field) => this.index(field));
    this.tempDocTermCount = {}; // cleanup

    return this;
  }

  getDocument(uid: string): Doc {
    return this.documentsTable[uid];
  }

  getTermEntry(term: string): DocEntry {
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

  toJSON() {
    return {
      fields: [...this.fields],
      documents: { ...this.documentsTable },
      index: { ...this.indexTable },
    };
  }
}
