import {typeOf} from './utils/core';

/**
 * Stopwords that are stripped away from queries and the index.
 */
const STOPWORDS: {[key: string]: boolean} = {
  a: true,
  able: true,
  about: true,
  above: true,
  across: true,
  after: true,
  again: true,
  against: true,
  ain: true,
  all: true,
  am: true,
  an: true,
  and: true,
  any: true,
  are: true,
  aren: true,
  "aren't": true,
  as: true,
  at: true,
  be: true,
  because: true,
  been: true,
  before: true,
  being: true,
  below: true,
  between: true,
  both: true,
  but: true,
  by: true,
  can: true,
  cannot: true,
  couldn: true,
  "couldn't": true,
  d: true,
  did: true,
  didn: true,
  "didn't": true,
  do: true,
  does: true,
  doesn: true,
  "doesn't": true,
  doing: true,
  don: true,
  "don't": true,
  down: true,
  during: true,
  each: true,
  few: true,
  for: true,
  from: true,
  further: true,
  had: true,
  hadn: true,
  "hadn't": true,
  has: true,
  hasn: true,
  "hasn't": true,
  have: true,
  haven: true,
  "haven't": true,
  having: true,
  he: true,
  her: true,
  here: true,
  hers: true,
  herself: true,
  him: true,
  himself: true,
  his: true,
  how: true,
  i: true,
  if: true,
  in: true,
  into: true,
  is: true,
  isn: true,
  "isn't": true,
  it: true,
  "it's": true,
  its: true,
  itself: true,
  just: true,
  ll: true,
  m: true,
  ma: true,
  me: true,
  mightn: true,
  "mightn't": true,
  more: true,
  most: true,
  mustn: true,
  "mustn't": true,
  my: true,
  myself: true,
  needn: true,
  "needn't": true,
  no: true,
  nor: true,
  not: true,
  now: true,
  o: true,
  of: true,
  off: true,
  on: true,
  once: true,
  only: true,
  or: true,
  other: true,
  our: true,
  ours: true,
  ourselves: true,
  out: true,
  over: true,
  own: true,
  re: true,
  s: true,
  same: true,
  shan: true,
  "shan't": true,
  she: true,
  "she's": true,
  should: true,
  "should've": true,
  shouldn: true,
  "shouldn't": true,
  so: true,
  some: true,
  such: true,
  t: true,
  than: true,
  that: true,
  "that'll": true,
  the: true,
  their: true,
  theirs: true,
  them: true,
  themselves: true,
  then: true,
  there: true,
  these: true,
  they: true,
  this: true,
  those: true,
  through: true,
  to: true,
  too: true,
  under: true,
  until: true,
  up: true,
  ve: true,
  very: true,
  was: true,
  wasn: true,
  "wasn't": true,
  we: true,
  were: true,
  weren: true,
  "weren't": true,
  what: true,
  when: true,
  where: true,
  which: true,
  while: true,
  who: true,
  whom: true,
  why: true,
  will: true,
  with: true,
  won: true,
  "won't": true,
  wouldn: true,
  "wouldn't": true,
  y: true,
  you: true,
  "you'd": true,
  "you'll": true,
  "you're": true,
  "you've": true,
  your: true,
  yours: true,
  yourself: true,
  yourselves: true,
};

/**
 * Returns all stopwords present in the internal map.
 */
export function getStopwords(): string[] {
  return Object.keys(STOPWORDS);
}

/**
 * True if a word is in the internal map.
 */
export function hasStopword(word: string) {
  return Boolean(STOPWORDS[word]);
}

/**
 * Adds additional stopwords to the internal map.
 */
export function addStopwords(words: string[] = []) {
  if (!Array.isArray(words)) {
    throw new TypeError(
      `Expected array of stopwords but received ${typeOf(words)}`
    );
  }

  if (!words.length) return;

  for (const word of words) {
    if (!hasStopword(word)) {
      STOPWORDS[word] = true;
    }
  }
}

/**
 * True if a word is a stopword, or if it's made up of only non-word chars.
 */
export function isStopword(word: string) {
  return hasStopword(word) || !word.match(/(\w+)/g);
}

/**
 * Removes all stopwords from the provided text.
 */
export function stripStopwords(text: string) {
  const result: string[] = [];

  for (const word of text.split(/\s+/g)) {
    if (isStopword(word)) continue;
    result.push(word);
  }

  return result.join(' ');
}
