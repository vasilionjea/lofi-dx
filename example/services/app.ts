import * as lofi from '../../src/index';

export interface AppService extends InterfaceOf<Service> { }

/**
 * The AppService fetches documents and creates the index
 */
class Service {
  private readonly docsIndex: lofi.Index;
  private readonly docsSearch: lofi.Search;
  private readonly docsStorage: lofi.Storage;

  constructor() {
    const index = this.docsIndex = lofi.createIndex({
      uidKey: 'id',
      fields: ['body'],
      splitter: /\W+|\d+/g, // non-words or digits
    });

    this.docsSearch = lofi.createSearch(index, { prefixMatch: true });
    this.docsStorage = lofi.createStorage(index);
  }

  async fetch() {
    const start = performance.now();
    const response = await fetch('./data.json');
    const { data } = await response.json();
    this.docsIndex.addDocuments(data);
    const end = performance.now();
    console.log(`Loaded (init): ${end - start}ms`);
  }

  async loadStored() {
    const start = performance.now();
    await this.docsStorage.load();
    const end = performance.now();
    console.log(`Loaded (cache): ${end - start}ms`);
  }

  async loadDocuments() {
    const ONE_DAY = 1000 * 60 * 60 * 24;

    if (this.docsStorage.isSaved()) {
      await this.loadStored();
    } else {
      await this.fetch();
      this.docsStorage.save({ ttl: ONE_DAY });
    }

    console.log(this.docsIndex.toJSON());
  }

  search(queryText = '') {
    if (queryText.length <= 1) return;

    const start = performance.now();
    const results = this.docsSearch.search(queryText);
    const end = performance.now();

    console.log(`Search took ${end - start}ms`);

    return results;
  }
}

// Singleton
export default new Service();
