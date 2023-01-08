import sizeof from 'object-sizeof';
import prettyBytes from 'pretty-bytes';
import indexTableBefore from './index-before.js';
import indexTableAfter from './index-after.js';

console.log('Before:', {
  size: prettyBytes(Buffer.byteLength(JSON.stringify(indexTableBefore))),
  memory: prettyBytes(sizeof(indexTableBefore))
});

console.log('After:', {
  size: prettyBytes(Buffer.byteLength(JSON.stringify(indexTableAfter))),
  memory: prettyBytes(sizeof(indexTableAfter))
});
