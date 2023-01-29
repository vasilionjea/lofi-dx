import Benchmark from 'benchmark';
import { InvertedIndex, InvertedSearch } from '../src/index';

const suite = new Benchmark.Suite();

suite.add('RegExp#test', () => {
  /o/.test('TODO');
});

suite.on('complete', () => {
  console.log('Fastest is ' + suite.filter('fastest').map('name'));
});

suite.run({ async: true });
