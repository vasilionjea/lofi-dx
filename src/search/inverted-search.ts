import {
  isNone,
  hasOwn,
  objectIntersection,
  objectDifference,
  deleteArrayItem,
} from '../utils/core';
import {
  QueryPart,
  QueryPartType,
  ParsedQuery,
  parseQuery,
  groupQueryParts,
} from '../query/index';
import { tfidf } from '../utils/ranking';
import { getPostingsLength, ParsedMetadata } from '../utils/encoding';
import { InvertedIndex, Doc, TermTable } from './inverted-index';

export type ScoredMatches = {
  // doc uid: tfidf
  [key: string]: number;
};

/**
 * The InvertedSearch class searches the InvertedIndex. Before it returns the results,
 * it computes each term doc's tfidf, and sorts them by the highest score.
 */
export class InvertedSearch {
  constructor(private readonly invertedIndex: InvertedIndex) {}

  /**
   * For a set of matched docs, it computes each doc's tfidf value.
   */
  private matchesWithScores(matches: TermTable) {
    const result: ScoredMatches = {};
    const termDocs = Object.entries(matches);
    const totalDocs = this.invertedIndex.getDocumentCount();
    const totalTermDocs = termDocs.length;

    for (const [uid, docEntry] of termDocs) {
      const totalTerms = this.invertedIndex.getDocumentTermCount(uid);
      const frequency = getPostingsLength(docEntry);
      result[uid] = tfidf(
        { frequency, totalTerms },
        { totalDocs, totalTermDocs }
      );
    }

    return result;
  }

  /**
   * Sums each term doc's tfidf values.
   */
  private sumScores(...args: number[]) {
    return args.reduce((a = 0, b = 0) => Number((a + b).toFixed(6)));
  }

  /**
   * For each doc, it sums a score from a previous term wth a score from a next term.
   */
  private assignScores(
    currentMatches: ScoredMatches,
    nextMatches: ScoredMatches,
    onlyOwn = false
  ) {
    for (const [uid, tfidf] of Object.entries(nextMatches)) {
      if (onlyOwn) {
        if (hasOwn(currentMatches, uid)) {
          currentMatches[uid] = this.sumScores(currentMatches[uid], tfidf);
        }
      } else {
        currentMatches[uid] = this.sumScores(currentMatches[uid], tfidf);
      }
    }
  }

  /**
   * A simple lookup into the index's term table.
   */
  private getSimpleMatches(part: QueryPart) {
    const matches = part && this.invertedIndex.getTermEntry(part.term);
    return this.matchesWithScores(matches);
  }

  /**
   * It returns only docs that are under every term's table.
   */
  private getRequiredMatches(parts: QueryPart[]) {
    let result = {};

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const matches = part.isPhrase
        ? this.getPhraseMatches(part)
        : this.getSimpleMatches(part);

      if (matches) {
        if (i === 0) {
          result = matches;
        } else {
          const intersection = objectIntersection(
            result,
            matches
          ) as ScoredMatches;
          this.assignScores(intersection, matches, true);
          result = intersection;
        }
      } else {
        result = {};
        break;
      }
    }

    return result;
  }

  /**
   * For each doc candidate, the phrase search algorithm iterates through each term's positions
   * to find terms next to each other. It either exits early when it finds all the terms as a
   * phrase, or when the first term's positions are completely drained.
   *
   * The positions that are being looked up through iteration are progressively getting shorter
   * at each loop to avoid unnecessary work. A term-to-positions map is being reused for each
   * doc being looked up.
   *
   * @param candidates Docs that definitely have all the terms that we'll check
   * @param terms Terms being checked for a phrase in each doc candidate
   */
  private searchPhrase({
    candidates,
    terms,
  }: {
    candidates: TermTable;
    terms: string[];
  }) {
    const matches: { [key: string]: number } = {}; // doc uid to term count (it's a phrase if count equals the total terms)
    const totalTerms = terms.length; // total terms being checked for a phrase
    const postings: { [key: string]: number[] } = {}; // term to positions of term

    for (const uid of Object.keys(candidates)) {
      for (const term of terms) {
        const meta = this.invertedIndex.getDocumentEntry(
          term,
          uid
        ) as ParsedMetadata;
        postings[term] = meta.postings;
      }

      let t = 0;
      const stack = [postings[terms[0]].shift()];

      while (stack.length) {
        if (isNone(terms[t + 1]) || matches[uid] === totalTerms) break;
        if (t === 0) matches[uid] = 1;

        const currentPos = stack[stack.length - 1] as number;
        const nextExpected = currentPos + terms[t].length + 1;
        const nextPos = deleteArrayItem(postings[terms[t + 1]], nextExpected);

        if (!isNone(nextPos)) {
          stack.push(nextPos);
          matches[uid] += 1;
          t++;
        } else {
          t = 0;
          stack.length = 0;

          const firstNext = postings[terms[0]].shift();
          if (!isNone(firstNext)) stack.push(firstNext);
        }
      }

      if (matches[uid] !== totalTerms) delete matches[uid];
    }

    // Return the actual doc entries in the index
    return objectIntersection(candidates, matches);
  }

  /**
   * For every term's subterm, it finds docs that contain all subterms as a phrase.
   */
  private getPhraseMatches(part: QueryPart) {
    const subterms = part.term.split(/\s+/);

    // We're done if query part contains only a single term
    if (subterms.length === 1) {
      return this.getSimpleMatches(part);
    }

    // Retrieve candidate docs that contain all terms (phrase or not)
    const candidates = this.getRequiredMatches(
      subterms.map((term) => ({ term, isPhrase: false } as QueryPart))
    );

    // Perform search for the candidate docs
    return this.searchPhrase({
      terms: subterms,
      candidates,
    }) as ScoredMatches;
  }

  /**
   * Handles all simple matches (phrased or not).
   */
  private getMatches(parts: QueryPart[]) {
    const result = {};

    for (const part of parts) {
      const matches = part.isPhrase
        ? this.getPhraseMatches(part)
        : this.getSimpleMatches(part);

      // no need to sum scores for negated matches
      part.type === QueryPartType.Negated
        ? Object.assign(result, matches)
        : this.assignScores(result, matches);
    }

    return result;
  }

  /**
   * For all matched UIDs it retrieves the documents, filtering out the
   * ones that have negated terms. Sorts them by highest tf-idf score.
   */
  private result(allMatches: Doc, negated: Doc) {
    const matches = objectDifference(allMatches, negated);
    const sorted = Object.keys(matches).sort((a, b) => {
      return (matches[b] as number) - (matches[a] as number);
    });

    return sorted.map((uid) => this.invertedIndex.getDocument(uid));
  }

  /**
   * Main entry point to searching the index.
   */
  search(queryText: string): Doc[] {
    const query: ParsedQuery = parseQuery(queryText);
    const groupedParts = groupQueryParts(query.parts);

    // Negated
    const negatedMatches = this.getMatches(groupedParts.negated);

    // Required
    if (groupedParts.required.length) {
      return this.result(
        this.getRequiredMatches(groupedParts.required),
        negatedMatches
      );
    }

    // Simple
    return this.result(this.getMatches(groupedParts.simple), negatedMatches);
  }
}
