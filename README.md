# Search Query
[![Build Status](https://github.com/vasilionjea/webpack-frontend-template/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/vasilionjea/webpack-frontend-template/actions/workflows/unit-tests.yml)

(_experimental/in progress_) A client side query tokenizer, parser, and [inverted index](https://en.wikipedia.org/wiki/Inverted_index). Stopwords like _an, the, it, is_ etc. are filtered out from search queries. The purpose of this is to allow making queries like `+jaguar speed "south america" -car` in a client side application (think offline PWA).

* A `+` indicates that a term is required (e.g. `+jaguar`), and it will result only in documents that have that term, but may also have other terms indicated by your query. 
* A `-` indicates exclusion (e.g. `-car`), and it will result in documents that don't have that term. 
* A quoted term such as `"south america"` indicates an exact phrase. A `+` or `-` can be added in front of phrases: e.g. `+"ux designer"` or `-"graphic designer"`
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
```js
{
  // word
  "jaguar": {
    // doc uid -> doc metadata
    "3": { "frequency": 1, "postings": [2] },
    "7": { "frequency": 2, "postings": [5, 17] }
  },
  
  "america": {...},
  
  // ...
}
```

This has been tested only in English and likely won't parse other alphabets correctly.

## Environments
You must have NodeJS already installed on your machine, then run `npm install` before running any other commands.

### Development 
* `npm run start` to start the webpack development server with live reload. Opens your browser & points it at http://localhost:3000
* `npm run lint` to lint your code with ESLint.
* `npm run format` to format your code with Prettier.
* `npm run test` to run tests in watch mode, or `npm run test:ci` to run tests once.

### Production
There are only _devDependencies_ listed in _package.json_. There are a couple example TS files, styles, and tests that can be deleted but otherwise there are no production _dependencies_ here. Feel free to write vanilla TS or bring in other libraries.

1. Run `npm run build` to build project.
2. Then deploy the generated `dist/` directory.

