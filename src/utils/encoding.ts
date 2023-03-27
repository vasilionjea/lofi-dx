export interface ParsedMetadata {
  positions: number[];
}

const POSITIONS_SEPARATOR = ',';

/**
 * Encodes term positions using delta and base36 encoding.
 */
export function encodePositions(nums: number[]): string[] {
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
 * Decodes positions from base36, then delta-decodes them.
 */
export function decodePositions(arr: string[]): number[] {
  const nums = arr.concat();
  const result: number[] = [];

  if (!nums.length) return result;

  let prev = Number.parseInt(nums.shift() as string, 36);
  result.push(prev);

  for (const current of nums) {
    const n = prev + Number.parseInt(current, 36);
    result.push(n);
    prev = n;
  }

  return result;
}

/**
 * Encodes the meta for a doc using delta and base36 for positions,
 * and only base36 for everything else.
 */
export function encodeMetadata(meta: ParsedMetadata): string {
  const positions = encodePositions(meta.positions);
  return `${positions.join(POSITIONS_SEPARATOR)}`;
}

/**
 * Parses the encoded meta for a doc back into a readable POJO.
 */
export function parseMetadata(meta: string): ParsedMetadata {
  if (!meta) return {positions: []};
  return {
    positions: decodePositions(meta.split(POSITIONS_SEPARATOR)),
  };
}

/**
 * Returns length of positions without decoding them.
 */
export function getPositionsCount(meta: string): number {
  return meta.split(POSITIONS_SEPARATOR).length;
}
