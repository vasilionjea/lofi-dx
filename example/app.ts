import './styles/style.scss';
import { QueryTokenizer, QueryParser, Query, Token, Search } from '../src/index';
import { $, debounce, StateEvent, State } from './utils';
import SearchInput from './components/search-input';
import SearchResults from './components/search-results';

/**
 * Example app
 */
class App {
  private readonly searchIndex = new Search({
    uidKey: 'id',
    searchFields: ['body'],
    splitter: /\W+|\d+/g, // non-words or digits
  });

  private readonly state = new State();

  private readonly $header = $('header')!;
  private readonly $main = $('main')!;
  private readonly $stats = $('.search-stats');

  private readonly searchInput = new SearchInput();
  private readonly searchResults = new SearchResults();

  private readonly debouncedSearch = debounce(this.search, 100, this);

  async start() {
    try {
      await this.loadDocuments();
    } catch (err) {
      return console.error(err);
    }

    this.$header.prepend(this.searchInput.render().element);
    this.$main.append(this.searchResults.element);

    this.searchInput.addEventListener('input:value', this);
    this.searchInput.addEventListener('input:clear', this);
    this.state.addEventListener('statechange', this);

    this.dispatchDefaultInputValue();
  }

  private async loadDocuments() {
    const response = await fetch('./data.json');
    const { data } = await response.json();
    this.searchIndex.addDocuments(data);
    console.log(this.searchIndex.toJSON());
  }

  private dispatchDefaultInputValue() {
    this.searchInput.dispatchEvent(
      new CustomEvent('input:value', {
        detail: { value: `"sierra nevada"` }
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

    const tokens: Token[] = new QueryTokenizer(queryText).tokenize();
    const query: Query = new QueryParser(tokens).parse();

    this.state.set({
      results: this.searchIndex.search(query)
    });
  }
}

const app = new App();
app.start();
