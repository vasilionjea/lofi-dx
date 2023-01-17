export const $ = (selector: string) => document.querySelector(selector);

export function debounce(callback: Function, ms = 0, context?: object) {
  let timer: number | null = null;

  return (...args: unknown[]) => {
    timer && window.clearTimeout(timer);
    timer = window.setTimeout(() => callback.apply(context, args), ms);
  };
}

export type pojo = { [key: string]: any };

export class StateEvent extends Event {
  constructor(readonly state: pojo) {
    super('statechange');
  }
}

export class State extends EventTarget {
  private value: pojo;

  constructor(initialValue = {}) {
    super();
    this.value = initialValue;
  }

  set(newValue: pojo) {
    this.value = newValue;
    this.dispatchEvent(new StateEvent(this.value));
  }

  get() {
    return this.value;
  }
}
