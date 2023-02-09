import CoreComponent from './core';

const TEXT_PLACEHOLDER = 'Search for something...';

/**
 * Search Input
 */
export default class SearchInput extends CoreComponent {
  input!: HTMLInputElement;
  clearButton!: HTMLButtonElement;

  get classNames() {
    return ['search-input'];
  }

  private onInputChange() {
    if (this.input!.value) {
      this.dispatchInput();
    } else {
      this.dispatchClear();
    }
  }

  private dispatchInput() {
    const event = new CustomEvent('input:value', {
      bubbles: true,
      detail: { value: this.input!.value },
    });

    this.dispatchEvent(event);
  }

  private dispatchClear() {
    const event = new CustomEvent('input:clear', { bubbles: true });
    this.dispatchEvent(event);
  }

  setValue(value: string) {
    if (!this.input) return;

    this.input.value = value;
    this.onInputChange();
  }

  reset() {
    this.setValue('');
    this.input?.focus();
  }

  private clearIconTemplate() {
    let str = `<svg aria-hidden="true" viewBox="0 0 24 24" focusable="false" style="pointer-events: none; display: block; width: inherit; height: inherit">`;
    str += `<g><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></g>`;
    return str + '</svg>';
  }

  private template() {
    const labelId = 'prompt';
    const inputId = 'searchInput';

    let str = `<label id="${labelId}" for="${inputId}" class="visuallyhidden">Search national parks</label>`;
    str += `<input type="search" id="${inputId}" placeholder="${TEXT_PLACEHOLDER}" aria-labelledby="${labelId}" autocorrect="off" spellcheck="false" autocapitalize="off">`;
    str += `<button class="btn btn-icon btn-clear" aria-label="Clear search">${this.clearIconTemplate()}</button>`;

    return str;
  }

  render() {
    this.element.insertAdjacentHTML('beforeend', this.template());

    this.input = this.element.querySelector('input')!;
    this.input.addEventListener('input', () => this.onInputChange());

    this.clearButton = this.element.querySelector('.btn-clear')!;
    this.clearButton.addEventListener('click', (e) => this.reset());

    return this;
  }
}
