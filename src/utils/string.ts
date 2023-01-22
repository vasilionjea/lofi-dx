/**
 * True for empty or whitespace-only strings.
 */
export function isBlank(text: string): boolean {
  return !text || !/\S+/g.test(text);
}

/**
 * Normalizes multiple whitespace chars to a single one.
 */
export function collapseWhitespace(text = ''): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Removes all double quotes found in text.
 */
export function unquote(text = ''): string {
  return text.replace(/["]/g, '');
}

/**
 * Removes `+` or `-` prefixes from text.
 */
export function stripModifiers(text = ''): string {
  return text.replace(/^([-+]+)/, '');
}

/**
 * A simple default that only drops "s" from some plural words. Doesn't touch
 * words that end with 'ss', 'es' (e.g. grass, centuries, goes/trees). Used
 * for both query words and index words.
 */
const sSuffix = /s$/i;
const ssIesSuffix = /(ss|i?es)$/i;
export function stemWord(text: string): string {
  const result = [];

  for (const word of text.split(/\s+/g)) {
    if (sSuffix.test(word) && !ssIesSuffix.test(word)) {
      result.push(word.replace(sSuffix, ''));
    } else {
      result.push(word);
    }
  }

  return result.join(' ');
}
