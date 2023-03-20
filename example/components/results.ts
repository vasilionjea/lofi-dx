import Component from '../core/component';

type Article = {
  id: number;
  title: string;
  body: string;
};

const TEXT_MORE = 'read more';
const TEXT_LESS = 'read less';
const CLASS_EXPANDED = 'expanded';

/**
 * SearchResults component
 */
export default class SearchResults extends Component {

  private handleClick!: EventListener;

  protected init() {
    this.handleClick = this.onClick.bind(this);
  }

  protected didMount() {
    this.element.addEventListener('click', this.handleClick);
  }

  private onClick(e: Event) {
    const target = e.target as Element;

    if (target.classList.contains('see-more')) {
      this.toggleArticle(target, target.parentElement!);
    } else if (target.classList.contains('suggestion')) {
      const value = target.textContent;
      value && this.props.onSuggestionClick(value);
    }
  }

  private toggleArticle(trigger: Element, article: Element) {
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

  template(): string {
    const { resultList } = this.props;

    if (!resultList) return '';

    return resultList.length ?
      this.resultsHtml() :
      this.noResultsHtml();
  }

  private resultsHtml(): string {
    const { resultList } = this.props;
    return resultList.reduce((str: string, obj: Article) => str + `<article>${obj.title}${obj.body}</article>`, '');
  }

  private noResultsHtml() {
    return `
      <div class="no-results">
        <p>No results found.</p>
        <div class="query-suggestions">
          <p>Suggestions</p>
          <button class="btn pill pill--outlined suggestion">camping waterfalls -Teton</button>
          <button class="btn pill pill--outlined suggestion">"sierra nevada" +mojave</button>
          <button class="btn pill pill--outlined suggestion">southwestern Utah</button>
        </div>
      </div>
    `;
  }

  destroy(): void {
    this.element.removeEventListener('click', this.handleClick)
    super.destroy();
  }
}
