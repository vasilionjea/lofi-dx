export function unquote(text = '') {
  return text.replace(/["]/g, '');
}

export function stripModifiers(text = '') {
  return text.replace(/^([-]+)/g, '');
}
