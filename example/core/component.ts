import State from './state';

/**
 * Component
 */
export default class Component extends State {
  constructor(
    protected readonly element: Element,
    protected props: { [key: string]: any } = {}
  ) {
    super();
    this.init?.();
    this.render();
  }

  protected init?(): void;
  protected didMount?(): void;
  protected didUnmount?(): void;

  template() {
    return '';
  }

  render() {
    this.element.innerHTML = this.template();
    this.didMount?.();
  }

  destroy(): void {
    this.element.innerHTML = '';
    this.didUnmount?.();

    this.props = {};
  }
}
