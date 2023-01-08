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
    { label: 'Index before:', name: 'index-before.json' },
    { label: 'Index after:', name: 'index-after.json' }
  ];

  for (const file of files) {
    const data = await readFile(path.join(__dirname, file.name), { encoding: 'utf-8' });
    logStats(file.label, data);
  }
}

runStats();
