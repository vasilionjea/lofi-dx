import sizeof from 'object-sizeof';
import prettyBytes from 'pretty-bytes';
import indexTableBefore from './index-before.js';
import indexTableAfter from './index-after.js';

// Before: { size: '117 kB', memory: '162 kB' }
console.log('Before:', {
  size: prettyBytes(Buffer.byteLength(JSON.stringify(indexTableBefore))),
  memory: prettyBytes(sizeof(indexTableBefore))
});

// After: { size: '54 kB', memory: '63.8 kB' }
console.log('After:', {
  size: prettyBytes(Buffer.byteLength(JSON.stringify(indexTableAfter))),
  memory: prettyBytes(sizeof(indexTableAfter))
});
