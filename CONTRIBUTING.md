# lofi-dx

## Contributing
I'll work with you to merge in bug or feature pull requests.  

### Development 
You must have NodeJS already installed on your machine, then run `npm install` before running any other commands. There are only _devDependencies_ listed in _package.json_. 

* `npm run start` to start the dev server with live reload, and point your browser to http://localhost:3000
* `npm run lint` to lint your code with ESLint.
* `npm run format` to format your code with Prettier.
* `npm run test` to run tests in watch mode, or `npm run test:ci` to run tests once.
* `npm run coverage` to display a code coverage report

### Deployment
The `example/` directory contains a simple demo app with vanilla TS. Run `npm run deploy` to deploy to _gh-pages_
