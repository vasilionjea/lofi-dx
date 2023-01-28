export const $ = (selector: string) => document.querySelector(selector);

export function debounce(callback: Function, ms = 0, context?: object) {
  let timer: number | null = null;

  return (...args: unknown[]) => {
    timer && window.clearTimeout(timer);
    timer = window.setTimeout(() => callback.apply(context, args), ms);
  };
}

export class StateEvent extends Event {
  constructor(readonly state: POJO) {
    super('statechange');
  }
}

export class State extends EventTarget {
  private value: POJO;

  constructor(initialValue = {}) {
    super();
    this.value = initialValue;
  }

  setState(newValue: POJO) {
    this.value = newValue;
    this.dispatchEvent(new StateEvent(this.value));
  }

  getState() {
    return this.value;
  }
}
