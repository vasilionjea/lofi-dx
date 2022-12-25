import './styles/style.scss';
import { QueryTokenizer, QueryParser, Query, Token } from '../src/index';

function log(queryText: string) {
  const tokens: Token[] = new QueryTokenizer(queryText).tokenize();
  const query: Query = new QueryParser(tokens).parse();

  console.log(`\n${queryText}`);
  console.log(tokens);
  console.log(query);
}

// Term & ExactTerm
log(` word apostophe's [not_okay] the  "exactly this"  "exactly, that!"  12-word-34 "#!^$%&" `);

// PresenceTerm
log(` -negated  it is  -"also negated"  -"also, this one's"   +required  +"also required"  + `);

// Mixed with invalid chars
log(` @#* +required notrequired  ~!} 10.5% /(  "10% off"  -negated  "exact,  term "   -"also, negated's." `);
