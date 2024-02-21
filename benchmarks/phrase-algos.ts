import Benchmark from 'benchmark';
import {isNone, bsDelete, bsIncludes} from '../src/utils/core';

function oldSearchPhrase(words: string[], positions: {[key: string]: number[]}) {
  let totalMatches = 0;
  const totalWords = words.length;

  let t = 0;
  const validSequence = [positions[words[0]].shift()]; // (mutation)

  while (validSequence.length) {
    if (isNone(words[t + 1]) || totalMatches === totalWords) break;
    if (t === 0) totalMatches = 1;

    const currentPos = validSequence[validSequence.length - 1];
    const nextExpected = currentPos + words[t].length + 1;
    const nextPos = bsDelete(positions[words[t + 1]], nextExpected); // (mutation)

    if (!isNone(nextPos)) {
      validSequence.push(nextPos);
      totalMatches++;
      t++;
    } else {
      t = 0;
      validSequence.length = 0;

      const firstNext = positions[words[0]].shift(); // (mutation)
      if (!isNone(firstNext)) validSequence.push(firstNext);
    }
  }

  return validSequence;
}

function newSearchPhraseV1(words: string[], positions: {[key: string]: number[]}) {
  const totalWords = words.length;
  const firstWordPositions = positions[words[0]];
  const validSequence = [];

  for (const startPos of firstWordPositions) {
    validSequence.push(startPos);

    for (let i = 1; i < totalWords; i++) {
      const nextWord = words[i];
      const currentPos = validSequence[validSequence.length - 1];
      const nextExpectedPos = currentPos + words[i - 1].length + 1;

      if (positions[nextWord]?.includes(nextExpectedPos)) { // (no binary search)
        validSequence.push(nextExpectedPos);
      } else {
        validSequence.length = 0;
        break;
      }

      if (validSequence.length === totalWords) {
        return validSequence;
      }
    }
  }

  return validSequence;
}

function newSearchPhraseV2(words: string[], positions: {[key: string]: number[]}) {
  const totalWords = words.length;
  const firstWordPositions = positions[words[0]];
  const validSequence = [];

  for (const startPos of firstWordPositions) {
    validSequence.push(startPos);

    for (let i = 1; i < totalWords; i++) {
      const nextWord = words[i];
      const currentPos = validSequence[validSequence.length - 1];
      const nextExpectedPos = currentPos + words[i - 1].length + 1;

      if (bsIncludes(positions[nextWord], nextExpectedPos)) {
        validSequence.push(nextExpectedPos);
      } else {
        validSequence.length = 0;
        break;
      }

      if (validSequence.length === totalWords) {
        return validSequence;
      }
    }
  }

  return validSequence;
}

function generatePositions(words: string[], maxPositions = 1000) {
  const wordPositions = {};
  words.forEach((word) => {
    let currentPosition = 0;
    const positions = [];
    for (let i = 0; i < maxPositions; i++) {
      // Increment currentPosition by a random value between 1 and 10
      currentPosition += Math.floor(Math.random() * 10) + 1;
      positions.push(currentPosition);
    }
    wordPositions[word] = positions;
  });
  return wordPositions;
}

export async function runPhraseAlgosSuite() {
  const words = ['sierra', 'nevada', 'california'];
  const positions = generatePositions(words);

  new Benchmark.Suite()
    .add('oldSearchPhrase', () => {
      oldSearchPhrase(words, positions);
    })
    .add('newSearchPhraseV1', () => {
      newSearchPhraseV1(words, positions);
    })
    .add('newSearchPhraseV2', () => {
      newSearchPhraseV2(words, positions);
    })
    .on('cycle', event => {
      const bench = event.target;
      console.log(String(bench));
    })
    .on('complete', function () {
      console.log('Winner -> ' + this.filter('fastest').map('name'));
    })
    .run({async: false});
}
