interface TFValues {
  frequency: number; // number of times a term appears in the document
  totalTerms: number; // total number of all terms in the document
}

interface IDFValues {
  totalDocs: number; // total number of all documents in the index
  totalTermDocs: number; // // total number of documents that contain the term
}

/**
 * Computes the `tf` part.
 *
 * The number of times a word appears in a document divided by
 * the total number of words in that document
 */
export function tf(frequency: number, totalTerms: number) {
  return frequency / totalTerms;
}

/**
 * Computes the `idf` part.
 *
 * Log of the total number of all documents in the index divided by the total
 * number of documents that contain the specific term.
 */
export function idf(totalDocs: number, totalTermDocs: number): number {
  return Math.log(totalDocs / totalTermDocs);
}

/**
 * TF-IDF ranks the importance of a term in a document relative to a collection. The
 * importance increases proportionally to the number of times a term appears in the
 * document but it's offset by the frequency of the word in the whole corpus.
 */
export function tfidf(
  { frequency, totalTerms }: TFValues,
  { totalDocs, totalTermDocs }: IDFValues
): number {
  const tfValue = tf(frequency, totalTerms);
  const idfValue = idf(totalDocs, totalTermDocs);
  return tfValue * idfValue;
}
