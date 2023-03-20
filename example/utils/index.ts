export const $ = (selector: string) => document.querySelector(selector);

export function debounce(callback: Function, ms = 0, context?: object) {
  let timer: number | null = null;

  return (...args: unknown[]) => {
    timer && window.clearTimeout(timer);
    timer = window.setTimeout(() => callback.apply(context, args), ms);
  };
}
