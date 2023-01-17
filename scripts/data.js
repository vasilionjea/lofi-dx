#!/usr/bin/env node

import path from 'node:path';
import url from 'node:url';
import { createReadStream } from 'node:fs';
import { readdir } from 'node:fs/promises';
import * as readline from 'node:readline/promises';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const assetsDir = path.normalize(path.join(__dirname, '..', 'example', 'assets'));

let uid = 0;

function isWhitespace(line) {
  return (/^(\s+|\r?\n)$/g).test(line);
}

function emptyObject() {
  return {
    id: ++uid,
    title: '',
    body: '',
  };
}

function lineBuilder(obj) {
  let lineIndex = 0;

  return (line) => {
    if (!line.length || isWhitespace(line)) return;

    if (lineIndex === 0) {
      obj.title = `<h3>${line}</h3>`;
    } else {
      obj.body += `<p>${line}</p>`;
    }

    lineIndex++;
  };
}

/**
 * Returns an `AsyncIterator` that iterates through each line in the input stream as a string.
 * https://nodejs.org/dist/latest-v19.x/docs/api/readline.html#rlsymbolasynciterator
 */
function getLines(file) {
  const filePath = path.resolve(path.join(assetsDir, file));
  return readline.createInterface({
    input: createReadStream(filePath),
    crlfDelay: Infinity,
  });
}

/**
 * Creates JSON data from .txt files in the example/assets directory.
 * Data is used for the library example.
 */
export async function getExampleData() {
  const result = { createdAt: Date.now(), data: [] };
  const files = await readdir(assetsDir);

  for (const file of files) {
    if (!file.endsWith('.txt')) continue;

    const obj = emptyObject();
    const addLine = lineBuilder(obj);

    for await (const line of getLines(file)) {
      addLine(line);
    }

    result.data.push(obj);
  }

  return result;
}
