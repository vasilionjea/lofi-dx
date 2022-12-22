import { add, DEFAULT_VALUE } from './utils';

enum Test {
  One = 'one',
  Two = 'two',
}

export default class App {
  public start() {
    console.log('It works!', Test.One, Test.Two);

    // Example feature flag exposed to client-side JS
    if (SOME_FEATURE_FLAG) {
      console.log('SOME_FEATURE_FLAG:', SOME_FEATURE_FLAG);
    }

    this.calc();
  }

  calc() {
    const result = add(10, 5 * 2, DEFAULT_VALUE);
    console.log(`add: ${result}`);
  }
}
