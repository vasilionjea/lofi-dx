import CoreComponent from './core';

/**
 * Search Input
 */
export default class SearchInput extends CoreComponent {
  inputElement!: HTMLInputElement;
  btnClearElement!: HTMLButtonElement;

  get classNames() {
    return ['search-input'];
  }

  private onInputChange() {
    if (this.inputElement!.value) {
      this.dispatchInput();
    } else {
      this.dispatchClear();
    }
  }

  private dispatchInput() {
    const event = new CustomEvent('input:value', {
      bubbles: true,
      detail: { value: this.inputElement!.value },
    });

    this.dispatchEvent(event);
  }

  private dispatchClear() {
    const event = new CustomEvent('input:clear', { bubbles: true });
    this.dispatchEvent(event);
  }

  setValue(value: string) {
    if (!this.inputElement) return;

    this.inputElement.value = value;
    this.onInputChange();
  }

  private clearIconTemplate() {
    return `<svg aria-hidden="true" viewBox="0 0 24 24" focusable="false" style="pointer-events: none; display: block; width: inherit; height: inherit" class=""><g><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path></g></svg>`;
  }

  private template() {
    const labelId = 'prompt';
    const inputId = 'searchInput';
    const placeholder = 'Search for something...';

    let tpl = `<label id="${labelId}" for="${inputId}" class="visuallyhidden">Search national parks</label>`;
    tpl += `<input type="search" id="${inputId}" placeholder="${placeholder}" aria-labelledby="${labelId}" autocorrect="off" spellcheck="false" autocapitalize="off">`;
    tpl += `<button class="btn-icon btn-clear" aria-label="Clear search">${this.clearIconTemplate()}</button>`;

    return tpl;
  }

  render() {
    this.element.insertAdjacentHTML('beforeend', this.template());
    this.inputElement = this.element.querySelector('input')!;
    this.btnClearElement = this.element.querySelector('.btn-clear')!;

    if (this.inputElement) {
      this.inputElement.addEventListener('input', () => this.onInputChange());
    }

    if (this.btnClearElement) {
      this.btnClearElement.addEventListener('click', (e) => {
        e.stopPropagation();

        this.setValue('');
        this.dispatchClear();
        this.inputElement?.focus();
      });
    }

    return this;
  }
}
