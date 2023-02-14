import CoreComponent from './core';

const TEXT_MORE = 'read more';
const TEXT_LESS = 'read less';
const CLASS_EXPANDED = 'expanded';

/**
 * Search Results
 */
export default class SearchResults extends CoreComponent {
  get classNames() {
    return ['search-results'];
  }

  constructor() {
    super();
    this.element.addEventListener('click', this)
  }

  private resultsTemplate(data: any[]): string {
    return data.reduce((str, o) => str + `<article>${o.title}${o.body}</article>`, '');
  }

  private querySuggestions() {
    return `
      <div class="query-suggestions">
        <p>Suggestions</p>
        <button class="btn pill pill--outlined suggestion">camping waterfalls -Teton</button>
        <button class="btn pill pill--outlined suggestion">"sierra nevada" +mojave</button>
        <button class="btn pill pill--outlined suggestion">southwestern Utah</button>
      </div>
    `;
  }

  private noResultsTemplate() {
    return `
      <div class="no-results">
        <p>No results found :(</p>
        ${this.querySuggestions()}
      </div>
    `;
  }

  private toggle(trigger: Element, article: Element) {
    const isExpanded = article.classList.contains(CLASS_EXPANDED);

    if (isExpanded) {
      article.classList.remove(CLASS_EXPANDED);
      trigger.textContent = TEXT_MORE;
      article.firstElementChild?.scrollIntoView();
    } else {
      article.classList.add(CLASS_EXPANDED);
      trigger.textContent = TEXT_LESS;
    }
  }

  private dispatchSuggestion(value: string) {
    if (!value) return;

    const event = new CustomEvent('results:suggestion', {
      bubbles: true,
      detail: { value },
    });

    this.dispatchEvent(event);
  }

  handleEvent(e: Event) {
    const target = e.target as Element;

    if (target.classList.contains('see-more')) {
      this.toggle(target, target.parentElement!);
    } else if (target.classList.contains('suggestion')) {
      this.dispatchSuggestion(target.textContent!);
    }
  }

  render(data: POJO[] | null = []) {
    if (!data) {
      this.element.innerHTML = '';
    } else {
      this.element.innerHTML = (
        data.length ?
          this.resultsTemplate(data) :
          this.noResultsTemplate()
      );
    }

    return this;
  }
}
