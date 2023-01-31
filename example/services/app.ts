import { InvertedIndex, InvertedSearch } from '../../src/index';

export interface AppService extends InterfaceOf<Service> { }

/**
 * The AppService fetches documents and creates the index
 */
class Service {
  private readonly invertedIndex: InvertedIndex;
  private readonly invertedSearch: InvertedSearch;

  constructor() {
    this.invertedIndex = new InvertedIndex({
      uidKey: 'id',
      fields: ['body'],
      splitter: /\W+|\d+/g, // non-words or digits
    });

    this.invertedSearch = new InvertedSearch(this.invertedIndex);
  }

  async fetch() {
    const start = performance.now();
    const response = await fetch('./data.json');
    const { data } = await response.json();
    this.invertedIndex.addDocuments(data);
    const end = performance.now();
    console.log(`Loaded (init): ${end - start}ms`);
  }

  async loadStore() {
    const start = performance.now();
    await this.invertedIndex.loadStore();
    const end = performance.now();
    console.log(`Loaded (cache): ${end - start}ms`);
  }

  async loadDocuments() {
    if (this.invertedIndex.isStored) {
      await this.loadStore();
    } else {
      await this.fetch();
      this.invertedIndex.saveStore();
    }

    console.log(this.invertedIndex.toJSON());
  }

  search(queryText = '') {
    if (queryText.length <= 1) return;

    const start = performance.now();
    const results = this.invertedSearch.search(queryText);
    const end = performance.now();

    console.log(`Search took ${end - start}ms`);

    return results;
  }
}

// Singleton
export default new Service();
