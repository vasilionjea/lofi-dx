#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

npm version patch

npm run clean
npm run build

cp README.md dist/
cp package.json dist/

cd dist/
npm publish --dry-run
