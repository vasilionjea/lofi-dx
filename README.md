# lofi-dx
[![Build Status](https://github.com/vasilionjea/webpack-frontend-template/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/vasilionjea/webpack-frontend-template/actions/workflows/unit-tests.yml) 

A searchable inverted index for client side web apps written in Typescript. Has support for required, negated, and phrase queries. A set of default stopwords that can be extended are filtered out from queries and the index. Search results are ranked using simple [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf).

The purpose of this is to allow making queries like `+jaguar speed "south america" -car` in a client side application (_think offline PWA_): 
<table>
  <colgroup>
    <col span="1" style="width: 30%;">
    <col span="1" style="width: 70%;">
  </colgroup>
  <thead>
    <tr>
      <th>Operator</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>+</code></td>
      <td>Indicates a required term and it will result only in documents which have that term, but may also contain other terms indicated by your query</td>
    </tr>
    <tr>
      <td><code>-</code></td>
      <td>Indicates term exclusion and it will result in documents that don't have that term</td>
    </tr>
    <tr>
      <td><code>"south america"</code></td>
      <td>A quoted term indicates an exact phrase. A <code>+</code> or <code>-</code> can be added in front of phrases: <code>+"foo bar"</code> <code>-"biz baz"</code></td>
    </tr>
    <tr>
      <td><code>software engineer</code></td>
      <td>Simple terms will result in documents that may have either one or both terms, but not necessarily as a phrase</td>
    </tr>
  </tbody>
</table>

[Demo app](https://vasilionjea.github.io/lofi-dx/)

## Usage
Add documents to an index:
```js
const peopleIndex = new InvertedIndex({ uidKey: 'id', fields: ['title'] });
peopleIndex.addDocuments([
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
const peopleSearch = new InvertedSearch(peopleIndex);
const results = peopleSearch.search(`"software engineer" ux designer -"engineer 3"`);
console.log(results);
```
```js 
[
  { "id": 11, "name": "Alice Smith", "title": "UX Designer Bar Baz" },
  { "id": 21, "name": "Jamie Black", "title": "Foo Graphic Designer Biz"},
  { "id": 32, "name": "Joe Brown", "title": "Senior Software Engineer Barfoo" }
]
```

## Query 
### Tokenizer 
For the query `+jaguar speed "south america" -car`, it results in tokens:
```js
[
  { "type": "PresenceTerm", "text": "+jaguar" },
  { "type": "Term", "text": "speed" },
  { "type": "ExactTerm", "text": "\"south america\"" },
  { "type": "PresenceTerm", "text": "-car" }
]
```
### Parser
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
An [inverted index](https://en.wikipedia.org/wiki/Inverted_index) is an index of words and which documents those words occur in. Instead of linearly scanning every document looking for words, the inverted index reverses the logic by using the words to find the documents. Positions of every term occurrence are included in the index to support phrase queries and are [delta encoded](https://en.wikipedia.org/wiki/Delta_encoding) and [base36 encoded](https://en.wikipedia.org/wiki/Base36) before entering the index. 

The index's internal word map is represented space efficiently as follows:
```js
{
  // word
  "plateau": { 
    // document UID: metadata
    "2":"ae",
    "3":"5o,nb,2a,2c,n,31",
    "7":"j5",
    "15":"39,1jn"
  },

  "other": {...}
}
```

**Note:** This has been tested only in English and likely won't work with other alphabets.

## Memory
Given that this is a client-side solution to full-text search, the documents and the index are loaded in memory. Although the index is represented space efficiently, keep in mind that a client side full-text search implementation is likely not practical for large enough datasets. 

The point of client side full-text search is to improve the user experience in offline mode, or when Internet connection is flakey, or when such client side feature is more performant than querying a server. However, if your app runs into memory issues and crashes the Browser tab because you're trying to load many megabytes worth of documents, then that will actually derail the user experience. Have a cap on the total bytes you're storing client-side and loading into memory.

## Persistence
There are methods for writing the index to `localStorage` and later loading it but no other assumption is made for persistence. Perhaps `localStorage` (_limited to about 5MB/synchronous API_) works for your usecase or you may need to reach for `IndexedDB`.

## Contributing
I'll work with you to merge in bug or feature pull requests.  

### Development 
You must have NodeJS already installed on your machine, then run `npm install` before running any other commands. There are only _devDependencies_ listed in _package.json_. 

* `npm run start` to start the dev server with live reload, and point your browser to http://localhost:3000
* `npm run lint` to lint your code with ESLint.
* `npm run format` to format your code with Prettier.
* `npm run test` to run tests in watch mode, or `npm run test:ci` to run tests once.
* `npm run test:coverage` to display a test coverage report

### Deployment
The `example/` directory contains a very simple frontend app with Vanilla TS (_no component frameworks_). Run `npm run deploy` to deploy to _gh-pages_

