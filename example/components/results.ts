import CoreComponent from './core';

/**
 * Search Results
 */
export default class SearchResults extends CoreComponent {
  get classNames() {
    return ['search-results'];
  }

  private resultsTemplate(data: any[]): string {
    return data.reduce((str, o) => str + `<article>${o.title}${o.body}</article>`, '');
  }

  private noResultsTemplate() {
    return '<p class="no-results">No results found :(</p>';
  }

  private toggle(trigger: Element, article: Element) {
    const isExpanded = article.classList.contains('expanded');

    if (isExpanded) {
      article.classList.remove('expanded');
      trigger.textContent = 'read more';
    } else {
      article.classList.add('expanded');
      trigger.textContent = 'read less';
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
      this.element.innerHTML = data.length ? this.resultsTemplate(data) : this.noResultsTemplate();
    }

    const buttons = this.element.querySelectorAll('.see-more');

    if (buttons) {
      buttons.forEach(btn => btn.addEventListener('click', this))
    }

    return this;
  }
}
