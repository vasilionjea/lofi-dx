#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import sizeof from 'object-sizeof';
import prettyBytes from 'pretty-bytes';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function logStats(label = '', data = {}) {
  const stats = {
    'file size': prettyBytes(Buffer.byteLength(data)),
    'object memory': prettyBytes(sizeof(JSON.parse(data)))
  };

  console.log('\n', label);
  console.table([stats]);
}

async function runStats() {
  const files = [
    { label: 'Parsed', name: 'parsed.json' },
    { label: 'Stringified', name: 'stringified.json' },
    { label: 'Delta encoded', name: 'delta-encoded.json' },
    { label: 'Base36 encoded', name: 'base36-encoded.json' },
    { label: 'Current', name: 'current.json' },
  ];

  console.log('Index Stats\n___________');

  for (const file of files) {
    try {
      const data = await readFile(path.join(__dirname, 'index', file.name), { encoding: 'utf-8' });
      logStats(file.label, data);
    } catch (err) { }
  }
}

runStats();
