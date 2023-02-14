import { State, $, debounce } from '../utils/index';
import { AppService } from '../services/app';
import SearchInput from './input';
import SearchResults from './results';

const DEBOUNCE_MS = 150;
const EXAMPLE_QUERY = `"sierra nevada" california`;

/**
 * Example Application
 */
export default class App extends State {
  private readonly $header = $('header')!;
  private readonly $main = $('main')!;
  private readonly $stats = $('.search-stats');

  private readonly searchInput = new SearchInput();
  private readonly searchResults = new SearchResults();

  private readonly debouncedSearch: Function;

  constructor(private readonly appService: AppService) {
    super();
    this.debouncedSearch = debounce(this.search, DEBOUNCE_MS, this);
    this.addEventListener('statechange', this);
  }

  async start() {
    this.$header.prepend(this.searchInput.render().element);
    this.$main.append(this.searchResults.element);

    try {
      await this.appService.loadDocuments();

      this.searchInput.addEventListener('input:value', this);
      this.searchInput.addEventListener('input:clear', this);
      this.searchInput.setValue(EXAMPLE_QUERY);

      this.searchResults.addEventListener('results:suggestion', this);
    } catch (err) {
      console.error(err);
    }
  }

  search(queryText: string) {
    const results = this.appService.search(queryText);
    this.setState({ results });
  }

  handleEvent(event: CustomEvent) {
    const { type, detail } = event;

    switch (type) {
      case 'input:value':
        this.debouncedSearch(detail.value);
        break;

      case 'input:clear':
        this.setState({ results: null });
        break;

      case 'statechange':
        this.renderResults();
        break;

      case 'results:suggestion':
        this.searchInput.setValue(detail.value);
        break;
    }
  }

  renderResults() {
    const { results } = this.getState();
    this.searchResults.render(results);
    this.renderStats(results);
  }

  renderStats(results: unknown[]) {
    let text = ''

    if (!results) {
      this.$stats!.textContent = text;
      return;
    }

    const size = results.length;

    if (size === 0) {
      text = 'no results found';
    } else if (size === 1) {
      text = `1 result found`;
    } else if (size > 1) {
      text = `${size} results found`;
    }

    this.$stats!.textContent = text;
  }
}
