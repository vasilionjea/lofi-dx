import {
  isNone,
  objectIntersection,
  objectDifference,
  removeArrayItem,
} from '../utils/core';
import {
  QueryPart,
  QueryPartType,
  ParsedQuery,
  parseQuery,
} from '../query/index';
import { InvertedIndex, Doc } from './inverted-index';

export interface PartGroups {
  required: QueryPart[];
  negated: QueryPart[];
  simple: QueryPart[];
}

/**
 * The InvertedSearch class searches the InvertedIndex.
 */
export class InvertedSearch {
  constructor(private readonly invertedIndex: InvertedIndex) {}

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
    const result = part && this.invertedIndex.getTermEntry(part.term);
    return { ...result };
  }

  private getRequiredMatches(parts: QueryPart[]) {
    let matches = {};

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const result = part.isPhrase
        ? this.getPhraseMatches(part)
        : this.getSimpleMatches(part);

      if (result) {
        matches = i === 0 ? result : objectIntersection(matches, result);
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
        const meta = this.invertedIndex.getDocumentEntry(term, uid);
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
    const subterms = part.term.split(/\s+/);

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

  search(queryText: string): Doc[] {
    const query: ParsedQuery = parseQuery(queryText);
    const groupedParts = this.groupQueryParts(query.parts);
    const negatedMatches = this.getMatches(groupedParts.negated);

    // Stop early if we have required terms
    if (groupedParts.required.length) {
      const requiredMatches = this.getRequiredMatches(groupedParts.required);
      return Object.keys(objectDifference(requiredMatches, negatedMatches)).map(
        (uid) => this.invertedIndex.getDocument(uid)
      );
    }

    // Return matches without the ones from negated terms
    const simpleMatches = this.getMatches(groupedParts.simple);
    return Object.keys(objectDifference(simpleMatches, negatedMatches)).map(
      (uid) => this.invertedIndex.getDocument(uid)
    );
  }
}
