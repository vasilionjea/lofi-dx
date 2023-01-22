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
