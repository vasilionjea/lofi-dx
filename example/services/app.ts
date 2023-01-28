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

  async loadDocuments() {
    const response = await fetch('./data.json');
    const { data } = await response.json();

    this.invertedIndex.addDocuments(data);

    console.log(this.invertedIndex.toJSON());
  }

  search(queryText = '') {
    if (queryText.length <= 1) return;

    const start = performance.now();
    const results = this.invertedSearch.search(queryText);
    const end = performance.now();

    console.log(`Search took ${end - start} milliseconds.`);

    return results;
  }
}

// Singleton
export default new Service();
