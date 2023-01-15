# search-query
[![Build Status](https://github.com/vasilionjea/webpack-frontend-template/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/vasilionjea/webpack-frontend-template/actions/workflows/unit-tests.yml)

(_in progress_) A client side query tokenizer, parser, and [inverted index](https://en.wikipedia.org/wiki/Inverted_index). Stopwords like _an, the, it, is_ are filtered out from search queries and the index. The purpose of this is to allow making queries like `+jaguar speed "south america" -car` in a client side application (think offline PWA).

* A `+` indicates a required term and it will result only in documents which have that term but may also contain other terms indicated by your query. 
* A `-` indicates term exclusion and it will result in documents that don't have that term. 
* A quoted string such as `"south america"` indicates an exact phrase. A `+` or `-` can be added in front of phrases: `+"foo bar"` `-"biz baz"`
* Simple terms like `software engineer` will result in documents that may have either one or both terms, but not necessarily as a phrase.

## Example
Create instance and add documents to the index:
```js
const people = new Search({ uidKey: 'id', searchFields: ['title'] });

people.addDocuments([
  { id: 3, name: 'Mike', title: 'Chief Forward Impact Engineer 3 Foo' },
  { id: 7, name: 'Joe Doe', title: 'Chief Interactions Liason' },
  { id: 11, name: 'Alice Smith', title: 'UX Designer Bar Baz' },
  { id: 21, name: 'Jamie Black', title: 'Foo Graphic Designer Biz' },
  { id: 32, name: 'Joe Brown', title: 'Senior Software Engineer Barfoo' },
  { id: 49, name: 'Helen Queen', title: 'Staff Dynamic Resonance Orchestrator Foo' },
  { id: 55, name: 'Mary', title: 'Queen Product Program Executive Manager Foo' },
  { id: 101, name: 'Alan Smith', title: 'Bar Senior Staff Software Engineer 3 Foobar' },
]);
```
Search the index:
```js
const results = people.search(`"software engineer" ux designer -"engineer 3"`);
console.log(results);
```
```js 
[
  { "id": 11, "name": "Alice Smith", "title": "UX Designer Bar Baz" },
  { "id": 21, "name": "Jamie Black", "title": "Foo Graphic Designer Biz"},
  { "id": 32, "name": "Joe Brown", "title": "Senior Software Engineer Barfoo" }
]
```

## Tokenizer 
For the query `+jaguar speed "south america" -car`, it results in tokens:
```js
[
  { "type": "PresenceTerm", "text": "+jaguar" },
  { "type": "Term", "text": "speed" },
  { "type": "ExactTerm", "text": "\"south america\"" },
  { "type": "PresenceTerm", "text": "-car" }
]
```
## Parser
From the tokens above, it results in the following query parts:
```js
[
  { "term": "jaguar", "isPhrase": false, "type": 2 }, // Required
  { "term": "speed", "isPhrase": false, "type": 0 }, // Simple
  { "term": "south america", "isPhrase": true, "type": 0 }, // Simple
  { "term": "car", "isPhrase": false, "type": 1 } // Negated
]
```

## Inverted Index
An inverted index is an index of words and which documents those words occur in. Instead of linearly scanning every document looking for words, the inverted index reverses the logic by using the words to find the documents. Positions of every term occurrence are included in the index to support phrase queries. 

The index's internal word map is structured compactly as follows:
```js
{
  // word
  "yosemite": { 
    // document UID: metadata
    "1": "7/9,32,1039,1078,1189,1276,1310",
    "2": "7/9,23,530,574,611,761,830",
    "3": "9/15,42,426,492,659,717,813,855,1008",
  },

  "other": {}
}
```
This compact strucure reduces the index byte size and JS memory allocation for it by about 50% as compared to the expanded structure below. The term position lists are also encoded using [delta encoding](https://en.wikipedia.org/wiki/Delta_encoding). 

At runtime, when documents are indexed or during a phrase match, a document entry is **momentarily** parsed to the following structure:
```js
{
  // word
  "yosemite": {
    // document UID: metadata
    "1": {
      "frequency": 7,
      "postings": [9,32,1039,1078,1189,1276,1310]
    }
  }
}
```
Once documents have entered the index or a phrase match completes, the expanded structure above gets garbage-collected by the JS engine. See [scripts/index-stats.js](https://github.com/vasilionjea/search-query/blob/main/scripts/index-stats.js) for size and memory of these structures or run `npm run index-stats`.

**Note:** Currently there isn't any support for document ranking (_see [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) or [BM25](https://en.wikipedia.org/wiki/Okapi_BM25)_). This has been tested only in English and likely won't work with other alphabets.

## Environments
You must have NodeJS already installed on your machine, then run `npm install` before running any other commands.

### Development 
* `npm run start` to start the webpack development server with live reload and point your browser to http://localhost:3000
* `npm run lint` to lint your code with ESLint.
* `npm run format` to format your code with Prettier.
* `npm run test` to run tests in watch mode, or `npm run test:ci` to run tests once.

### Production
There are only _devDependencies_ listed in _package.json_. There are a couple example TS files, styles, and tests that can be deleted but otherwise there are no production _dependencies_ here. Feel free to write vanilla TS or bring in other libraries.

1. Run `npm run build` to build project.
2. Then deploy the generated `dist/` directory.

