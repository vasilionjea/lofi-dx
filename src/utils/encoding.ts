export interface ParsedMetadata {
  totalTerms: number;
  postings: number[];
}

const CHUNK_SEPARATOR = '/';
const POSTINGS_SEPARATOR = ',';

/**
 * Encodes term postings using delta and base36 encoding.
 */
export function encodePostings(nums: number[]): string[] {
  const result: string[] = [];
  if (!nums.length) return result;

  for (let i = 0; i < nums.length; i++) {
    const prev = nums[i - 1];
    const current = nums[i];

    if (i === 0) {
      result.push(current.toString(36));
    } else {
      const delta = current - prev;
      result.push(delta.toString(36));
    }
  }

  return result;
}

/**
 * Decodes postings from base36, then delta-decodes them.
 */
export function decodePostings(arr: string[]): number[] {
  const nums = arr.concat();
  const result: number[] = [];

  if (!nums.length) return result;

  let prev = parseInt(nums.shift() as string, 36);
  result.push(prev);

  for (const current of nums) {
    const n = prev + parseInt(current, 36);
    result.push(n);
    prev = n;
  }

  return result;
}

/**
 * Parses the encoded meta for a doc back into a readable POJO.
 */
export function parseMetadata(meta: string): ParsedMetadata {
  if (!meta) return { totalTerms: 0, postings: [] };

  const [totalStr, postingsStr] = meta.split(CHUNK_SEPARATOR);

  return {
    totalTerms: parseInt(totalStr, 36),
    postings: decodePostings(postingsStr.split(POSTINGS_SEPARATOR)),
  };
}

/**
 * Parses the encoded term count for a doc back into Base10.
 */
export function parseTermCount(meta: string): number {
  const chunks = meta.split(CHUNK_SEPARATOR);
  return parseInt(chunks[0], 36);
}

/**
 * Returns length of postings without decoding them.
 */
export function getPostingsLength(meta: string): number {
  const chunks = meta.split(CHUNK_SEPARATOR);
  return chunks[1].split(POSTINGS_SEPARATOR).length;
}

/**
 * Encodes the meta for a doc using delta and base36 for postings,
 * and only base36 for everything else.
 */
export function encodeMetadata(meta: ParsedMetadata): string {
  const termCount = meta.totalTerms.toString(36);
  const postings = encodePostings(meta.postings);

  return `${termCount}/${postings.join(POSTINGS_SEPARATOR)}`;
}
