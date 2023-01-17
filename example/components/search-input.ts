import CoreComponent from "./core";

/**
 * Search Input
 */
export default class SearchInput extends CoreComponent {
  inputElement: HTMLInputElement | null = null;

  get classNames() {
    return ['search-input'];
  }

  handleInputChange() {
    if (this.inputElement!.value) {
      this.dispatchInputEvent();
    } else {
      this.dispatchClearEvent();
    }
  }

  dispatchInputEvent() {
    const event = new CustomEvent('input:value', {
      bubbles: true,
      detail: { value: this.inputElement!.value },
    });

    this.dispatchEvent(event);
  }

  dispatchClearEvent() {
    const event = new CustomEvent('input:clear', { bubbles: true });
    this.dispatchEvent(event);
  }

  template() {
    let html = '<form>';
    html += `<input type="search" role="search" placeholder="Search for something...">`;
    html += '</form>';
    return html;
  }

  render() {
    this.element.insertAdjacentHTML('beforeend', this.template());
    this.inputElement = this.element.querySelector('input');

    if (this.inputElement) {
      this.inputElement.addEventListener('input', () => this.handleInputChange());
    }

    return this;
  }
}
