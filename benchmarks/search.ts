import path from 'node:path';
import url from 'node:url';
import {readFile} from 'node:fs/promises';
import Benchmark from 'benchmark';
import {createIndex, createSearch} from '../src/index';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

async function loadData() {
  const json = await readFile(path.join(__dirname, '../public', 'data.json'), {
    encoding: 'utf-8',
  });
  return JSON.parse(json);
}

export async function runPhraseSearchSuite() {
  const {data} = await loadData();

  const docsIndex = createIndex({
    uidKey: 'id',
    fields: ['body'],
    splitter: /\W+|\d+/g, // non-words or digits
  }).addDocuments(data);

  const docsSearch = createSearch(docsIndex);

  new Benchmark.Suite()
    .add('[phrase with 2 words]', () => {
      docsSearch.search(`"sierra nevada"`);
    })
    .add('[phrase with 3 words]', () => {
      docsSearch.search(`"park united states"`);
    })
    .add('[phrase with 4 words]', () => {
      docsSearch.search(`"american national park located"`);
    })
    .add('[2 phrases with 3 words each]', () => {
      docsSearch.search(`"national park located" "National Park Service"`);
    })
    .on('cycle', event => {
      const bench = event.target;
      console.log(String(bench));
    })
    .on('complete', function () {
      console.log('Winner -> ' + this.filter('fastest').map('name'));
    })
    .run({async: false});
}
