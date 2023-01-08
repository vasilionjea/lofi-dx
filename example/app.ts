import './styles/style.scss';
import { QueryTokenizer, QueryParser, Query, Token, Search } from '../src/index';

/**
 * Example application.
 */
class App {
  private readonly searchIndex = new Search({
    uidKey: 'id',
    searchFields: ['body'],
    splitter: /\W+|\d+/g, // splits on non-words and digits
  });

  async start() {
    try {
      const result = await this.fetchData();
      this.searchIndex.addDocuments(result.data);
    } catch (error) {
      console.error(error);
    }

    console.log(this.searchIndex.toJSON());
    console.log('Index size:', Object.keys(this.searchIndex.getIndexTable()).length);
  }

  async fetchData() {
    const result = await fetch('./data.json');
    return result.json();
  }

  search(queryText: string) {
    const tokens: Token[] = new QueryTokenizer(queryText).tokenize();
    const query: Query = new QueryParser(tokens).parse();
    return this.searchIndex.search(query);
  }
}

const app = new App();

app.start().then(() => {
  const queryText = `"national park located in southwestern Utah"`;
  const results = app.search(queryText);
  const element = document.querySelector('main');

  if (!element) return;
  element.innerHTML += `<pre>Query text:${queryText}</pre>`;

  if (!results.length) {
    element.innerHTML += `<article>No results found...</article>`;
  } else {
    for (const document of results) {
      element.innerHTML += `<article>${document.title}${document.body}</article>`;
    }
  }

  console.log('Search results:', results);
});
