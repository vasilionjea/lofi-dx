export const DEFAULT_VALUE = 100;

export function add(...args: number[]) {
  return args.reduce((a, b) => a + b);
}
