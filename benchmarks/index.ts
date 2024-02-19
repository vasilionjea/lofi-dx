import {runPhraseSearchSuite} from './search';

const allSuites = [runPhraseSearchSuite];

async function runAll() {
  console.log('Running all suites...');
  for (const suite of allSuites) {
    await suite();
  }
}

runAll();
