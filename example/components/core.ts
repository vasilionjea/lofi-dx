/**
 * Core Component
 */
export default abstract class CoreComponent extends EventTarget {
  private settings: { [key: string]: unknown } = {};
  element!: HTMLElement;

  get tagName(): string {
    return 'div';
  }

  get classNames(): string[] {
    return [];
  }

  constructor(options: { [key: string]: unknown } = {}) {
    super();
    this.settings = { ...this.settings, ...options };
    this._createElement();
  }

  private _createElement() {
    if (!this.settings.element) {
      this.element = document.createElement(this.tagName);
    }

    this.element.classList.add(...this.classNames);
  }

  abstract render(): void;

  destroy(): void {
    this.element.remove();
    this.element = this.settings = null!;
  }
}
