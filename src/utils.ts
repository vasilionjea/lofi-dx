export function isNone(obj: unknown): boolean {
  return obj === null || obj === undefined;
}

export function unquote(text = '') {
  return text.replace(/["]/g, '');
}

export function stripModifiers(text = '') {
  return text.replace(/^([-+]+)/g, '');
}

export function stripWhitespace(text = '') {
  return text
    .trim()
    .split(/(?:\s+)/g)
    .join(' ');
}
