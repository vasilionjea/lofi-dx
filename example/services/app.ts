import * as lofi from '../../src/index';

export interface AppService extends InterfaceOf<Service> { }

/**
 * The AppService fetches documents and creates the index
 */
class Service {
  private readonly docIndex: lofi.Index;
  private readonly docSearch: lofi.Search;

  constructor() {
    this.docIndex = new lofi.Index({
      uidKey: 'id',
      fields: ['body'],
      splitter: /\W+|\d+/g, // non-words or digits
    });

    this.docSearch = new lofi.Search(this.docIndex);
  }

  async fetch() {
    const start = performance.now();
    const response = await fetch('./data.json');
    const { data } = await response.json();
    this.docIndex.addDocuments(data);
    const end = performance.now();
    console.log(`Loaded (init): ${end - start}ms`);
  }

  async loadStore() {
    const start = performance.now();
    await this.docIndex.loadStore();
    const end = performance.now();
    console.log(`Loaded (cache): ${end - start}ms`);
  }

  async loadDocuments() {
    if (this.docIndex.isStored) {
      await this.loadStore();
    } else {
      await this.fetch();
      this.docIndex.saveStore();
    }

    console.log(this.docIndex.toJSON());
  }

  search(queryText = '') {
    if (queryText.length <= 1) return;

    const start = performance.now();
    const results = this.docSearch.search(queryText);
    const end = performance.now();

    console.log(`Search took ${end - start}ms`);

    return results;
  }
}

// Singleton
export default new Service();
