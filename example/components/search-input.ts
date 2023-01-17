import CoreComponent from "./core";

/**
 * Search Input
 */
export default class SearchInput extends CoreComponent {
  inputElement: HTMLInputElement | null = null;

  get classNames() {
    return ['search-input'];
  }

  private handleInputChange() {
    if (this.inputElement!.value) {
      this.dispatchInputEvent();
    } else {
      this.dispatchClearEvent();
    }
  }

  private dispatchInputEvent() {
    const event = new CustomEvent('input:value', {
      bubbles: true,
      detail: { value: this.inputElement!.value },
    });

    this.dispatchEvent(event);
  }

  private dispatchClearEvent() {
    const event = new CustomEvent('input:clear', { bubbles: true });
    this.dispatchEvent(event);
  }

  private setValue(value: string) {
    if (this.inputElement) {
      this.inputElement!.value = value;
    }
  }

  private template() {
    let html = '<form>';
    html += `<input type="search" role="search" autocorrect="off" placeholder="Search for something...">`;
    html += '</form>';
    return html;
  }

  render() {
    this.element.insertAdjacentHTML('beforeend', this.template());
    this.inputElement = this.element.querySelector('input');

    if (this.inputElement) {
      this.inputElement.addEventListener('input', () => this.handleInputChange());
      this.addEventListener('input:value', (event: Event) => this.setValue((event as CustomEvent).detail.value));
    }

    return this;
  }
}
