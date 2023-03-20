import State from './core/state';
import { debounce, $ } from './utils/index';
import { AppService } from './services/app';
import SearchInput from './components/input';
import SearchResults from './components/results';

const DEBOUNCE_MS = 150;
const EXAMPLE_QUERY = `"sierra nevada" california`;

/**
 * Example application
 */
export default class App extends State {
  private readonly inputElement = $('.search-input')!;
  private readonly resultsElement = $('.search-results')!;
  private readonly statsElement = $('.search-stats');

  private inputComponent!: SearchInput;
  private resultsComponent!: SearchResults;

  private debouncedSearch: Function;

  constructor(private readonly appService: AppService) {
    super();

    this.debouncedSearch = debounce(this.search, DEBOUNCE_MS, this);

    this.inputComponent = new SearchInput(this.inputElement, {
      onInputValue: (value: string) => this.debouncedSearch(value),
      onInputClear: () => this.setState({ resultList: null }),
    });

    this.addEventListener('statechange', () => {
      this.renderResults();
      this.renderStats();
    });
  }

  async start() {
    try {
      await this.appService.loadDocuments();
      this.inputComponent.setValue(EXAMPLE_QUERY);
    } catch (err) {
      console.error(err);
    }
  }

  search(queryText: string) {
    const resultList = this.appService.search(queryText);
    this.setState({ resultList });
  }

  private renderResults() {
    const { resultList } = this.getState();

    this.resultsComponent?.destroy?.();

    if (!resultList) return;

    this.resultsComponent = new SearchResults(this.resultsElement, {
      resultList,
      onSuggestionClick: (value: string) => this.inputComponent.setValue(value),
    });
  }

  private renderStats() {
    const { resultList } = this.getState();
    let text = ''

    if (!resultList) {
      this.statsElement!.textContent = text;
      return;
    }

    const size = resultList.length;

    if (size === 0) {
      text = 'no results found';
    } else if (size === 1) {
      text = `1 result found`;
    } else if (size > 1) {
      text = `${size} results found`;
    }

    this.statsElement!.textContent = text;
  }
}
