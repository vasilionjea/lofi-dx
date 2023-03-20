import Component from '../core/component';

/**
 * SearchInput component
 */
export default class SearchInput extends Component {
  private input!: HTMLInputElement;
  private clearButton!: HTMLButtonElement;
  private handleInput!: EventListener;
  private handleReset!: EventListener;

  protected init() {
    this.handleInput = this.onInputChange.bind(this);
    this.handleReset = this.reset.bind(this);
  }

  protected didMount() {
    this.input = this.element.querySelector('input')!;
    this.clearButton = this.element.querySelector('.btn-clear')!;

    this.input.addEventListener('input', this.handleInput);
    this.clearButton.addEventListener('click', this.handleReset);
  }

  private onInputChange() {
    const { value } = this.input;
    const { onInputValue, onInputClear } = this.props;

    if (value) {
      onInputValue?.(value);
    } else {
      onInputClear?.();
    }
  }

  setValue(value: string) {
    this.input.value = value;
    this.onInputChange();
  }

  reset() {
    this.setValue('');
    this.input?.focus();
  }

  template(): string {
    const labelId = 'prompt', inputId = 'searchInput';
    return `
      <label id="${labelId}" for="${inputId}" class="visuallyhidden">Search national parks</label>
      <input type="search" id="${inputId}" placeholder="Search for something..." aria-labelledby="${labelId}" autocorrect="off" spellcheck="false" autocapitalize="off">
      <button class="btn btn-icon btn-clear" aria-label="Clear search">${this.clearIcon()}</button>
    `;
  }

  clearIcon() {
    return `
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        focusable="false"
        style="pointer-events:none; display:block; width:inherit; height:inherit">
        <g>
          <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path>
        </g>
      </svg>
    `;
  }

  destroy(): void {
    this.input?.removeEventListener('input', this.handleInput);
    this.clearButton?.removeEventListener('click', this.handleReset);
    this.input = this.clearButton = null!;
    super.destroy();
  }
}
