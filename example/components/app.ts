import { $, debounce, State } from '../utils';
import { AppService } from '../services/app';
import SearchInput from './input';
import SearchResults from './results';

const DEBOUNCE_MS = 150;
const EXAMPLE_QUERY = `"sierra nevada" california`;

/**
 * Example Application.
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

    if (type === 'input:value') {
      this.debouncedSearch(detail.value);
    }

    if (type === 'input:clear') this.setState({ results: null });
    if (type === 'statechange') this.renderResults();
  }

  renderResults() {
    const { results } = this.getState();
    this.searchResults.render(results);
    this.$stats!.textContent = results ? `Total results: ${results.length}` : '';
  }
}
