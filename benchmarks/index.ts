import {runPhraseAlgosSuite} from './phrase-algos';
import {runPhraseSearchSuite} from './search';

const allSuites = [runPhraseAlgosSuite, runPhraseSearchSuite];

async function runAll() {
  console.log('Running all benchmarks...');
  for (const suite of allSuites) {
    await suite();
  }
}

runAll();
