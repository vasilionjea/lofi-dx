# About
[![Build Status](https://github.com/vasilionjea/webpack-frontend-template/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/vasilionjea/webpack-frontend-template/actions/workflows/unit-tests.yml)

Experiment building a client side search query parser. Parses strings like `+jaguar speed "south america" -car` to a query object:
```js
{
  "parts": [
    {"term": "jaguar", "negate": false, "require": true }, // term must appear in search results
    {"term": "speed", "negate": false, "require": false }, // term may appear 
    {"term": "south america", "negate": false, "require": false }, // term may appear but exactly as "south america"
    {"term": "car", "negate": true, "require": false } // term must NOT appear in search results
  ]
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

