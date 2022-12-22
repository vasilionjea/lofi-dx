import { Token } from './tokenizer';

export class QueryParser {
  constructor(public tokens: Token[]) {}

  parse() {
    // TODO
    console.log(this.tokens);
  }
}
