import './styles/style.scss';
import { InvertedIndex, InvertedSearch } from '../src/index';
import { $, debounce, StateEvent, State } from './utils';
import SearchInput from './components/search-input';
import SearchResults from './components/search-results';

/**
 * Example app
 */
class App {
  private readonly invertedIndex: InvertedIndex;
  private readonly invertedSearch: InvertedSearch;

  private readonly state = new State();

  private readonly $header = $('header')!;
  private readonly $main = $('main')!;
  private readonly $stats = $('.search-stats');

  private readonly searchInput = new SearchInput();
  private readonly searchResults = new SearchResults();

  private readonly debouncedSearch = debounce(this.search, 100, this);

  constructor() {
    this.invertedIndex = new InvertedIndex({
      uidKey: 'id',
      fields: ['body'],
      splitter: /\W+|\d+/g, // non-words or digits
    });

    this.invertedSearch = new InvertedSearch(this.invertedIndex);
  }

  async start() {
    this.$header.prepend(this.searchInput.render().element);
    this.$main.append(this.searchResults.element);

    try {
      await this.loadDocuments();
    } catch (err) {
      return console.error(err);
    }

    this.searchInput.addEventListener('input:value', this);
    this.searchInput.addEventListener('input:clear', this);
    this.state.addEventListener('statechange', this);

    this.dispatchDefaultInputValue();
  }

  private async loadDocuments() {
    const response = await fetch('./data.json');
    const { data } = await response.json();

    this.invertedIndex.addDocuments(data);

    console.log(this.invertedIndex.toJSON());
  }

  private dispatchDefaultInputValue() {
    this.searchInput.dispatchEvent(
      new CustomEvent('input:value', {
        detail: { value: `"sierra nevada" -death` }
      })
    );
  }

  handleEvent(event: Event) {
    if (event.type === 'input:value') {
      return this.debouncedSearch((event as CustomEvent).detail.value);
    }

    if (event.type === 'input:clear') {
      return this.state.set({ results: null });
    }

    if (event.type === 'statechange') {
      const { results } = (event as StateEvent).state;
      this.searchResults.render(results);
      this.$stats!.textContent = results ? `Total results: ${results.length}` : '';
    }
  }

  search(queryText = '') {
    if (queryText.length <= 1) return;
    const results = this.invertedSearch.search(queryText);
    this.state.set({ results });
  }
}

const app = new App();
app.start();
