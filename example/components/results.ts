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
    let str = '<div class="query-suggestions">';
    str += '<p>Suggestions</p>';
    str += '<ul>';
    str += `<li class="pill pill--outlined">camping waterfalls -Teton</li>`;
    str += `<li class="pill pill--outlined">"sierra nevada" +mojave</li>`;
    str += `<li class="pill pill--outlined">southwestern Utah</li>`;
    str += '</ul>';
    return str + '</div>';
  }

  private noResultsTemplate() {
    let str = '<div class="no-results">';
    str += '<p>No results found :(</p>';
    str += this.querySuggestions();
    return str + '</div>';
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
