export interface DocParsedMetadata {
  frequency: number;
  totalTerms: number;
  postings: number[];
}

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
export function parseDocMetadata(meta: string): DocParsedMetadata {
  if (!meta) {
    return { frequency: 0, totalTerms: 0, postings: [] };
  }

  const [str, postingsStr] = meta.split('/');
  const [frequencyStr, totalStr] = str.split(':');

  return {
    frequency: parseInt(frequencyStr, 36),
    totalTerms: parseInt(totalStr, 36),
    postings: decodePostings(postingsStr.split(',')),
  };
}

/**
 * Encodes the meta for a doc using delta and base36 for postings,
 * and only base36 for everything else.
 */
export function encodeDocMetadata(meta: DocParsedMetadata): string {
  const { frequency, totalTerms } = meta;

  const rankingMeta = `${frequency.toString(36)}:${totalTerms.toString(36)}`;
  const encodedPostings = encodePostings(meta.postings);

  return `${rankingMeta}/${encodedPostings.join(',')}`;
}
