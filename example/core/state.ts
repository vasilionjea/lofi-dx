export class StateEvent extends Event {
  constructor(private readonly state: POJO) {
    super('statechange');
  }
}

export default class State extends EventTarget {
  private state: POJO;

  constructor(initState = {}) {
    super();
    this.state = initState;
  }

  setState(newState: POJO) {
    if (newState === this.state) return;
    this.state = newState;
    this.dispatchEvent(new StateEvent(newState));
  }

  getState() {
    return { ...this.state };
  }
}
