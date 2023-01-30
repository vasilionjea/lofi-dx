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

  private noResultsTemplate() {
    return '<p class="no-results">No results found</p>';
  }

  private toggle(trigger: Element, article: Element) {
    const isExpanded = article.classList.contains(CLASS_EXPANDED);

    if (isExpanded) {
      article.classList.remove(CLASS_EXPANDED);
      trigger.textContent = TEXT_MORE;
    } else {
      article.classList.add(CLASS_EXPANDED);
      trigger.textContent = TEXT_LESS;
    }
  }

  handleEvent(e: Event) {
    const target = e.target as Element;

    if (target.classList.contains('see-more')) {
      this.toggle(target, target.parentElement!);
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
