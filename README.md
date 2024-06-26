# lofi-dx
[![Build Status](https://github.com/vasilionjea/lofi-dx/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/vasilionjea/lofi-dx/actions/workflows/unit-tests.yml) [![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)

A small, fast, local-first, searchable index for client side apps written in Typescript. Has support for required, negated, and phrase queries. A set of default stopwords that can be extended are filtered out from queries and the index. Search results are ranked using simple [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf).

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
First install the npm package using `npm i lofi-dx`, then import it in your project. Now create an index and add documents to it:
```js
import * as lofi from 'lofi-dx';

const index = lofi.createIndex({
  uidKey: 'id', // document unique identifier
  fields: ['title'] // document fields to index
});

index.addDocuments([
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
const people = lofi.createSearch(index);
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

See [example](https://github.com/vasilionjea/lofi-dx/tree/main/example) directory for UI integration.

## Persistence
There are methods for writing the index to `localStorage` using a TTL and later loading it but no other assumptions are made. Perhaps `localStorage` (_limited to 5MB_) works for your usecase or you may need to reach for `IndexedDB`.

```js
// Create storage for an index
const storage = lofi.createStorage(index);

async function loadDocs() {
  // load index from storage
  if (storage.isSaved()) {
    await storage.load();
    return;
  }
  
  // fetch docs & add them to the index
  const response = await fetch('./data.json');
  const { data } = await response.json();
  index.addDocuments(data);

  // save to storage
  const ONE_DAY = 1000 * 60 * 60 * 24;
  storage.save({ ttl: ONE_DAY });
}

// Maybe later...
// await storage.clear();
```

## Inverted Index
An [inverted index](https://en.wikipedia.org/wiki/Inverted_index) is an index of words and which documents those words occur in. Instead of linearly scanning every document looking for words, the inverted index reverses the logic by using the words to find the documents. Positions of every term occurrence are included in the index to support phrase queries and are [delta encoded](https://en.wikipedia.org/wiki/Delta_encoding) and [base36 encoded](https://en.wikipedia.org/wiki/Base36) before entering the index. 

The index's internal word map is represented space efficiently as follows:
```js
{
  // word
  "yosemite": { 
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

The point of client side full-text search is to improve the user experience in offline mode, or when Internet connection is flakey, or when such client side feature is desirable over querying a server. However, if your app runs into memory issues and crashes the Browser tab because you're trying to load many megabytes worth of documents, then that will actually derail the UX. Have a cap on the total bytes you're storing client-side and loading into memory. 
