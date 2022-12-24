import './styles/style.scss';
import { QueryTokenizer, QueryParser } from '../src/index';

function log(queryText: string) {
  const tokens = new QueryTokenizer(queryText).tokenize(); console.log(tokens);
  const parser = new QueryParser(tokens);
  const query = parser.parse();

  console.log(`\n${queryText}`);
  console.log(query);
}

// Terms
log(` Hello  world! `);

// Exact term, term
log(` "sea bass"  +salmon `);

// Negated term, term, term
log(` -car +jaguar speed `);

// Negate exact term, term, exact term
log(` -"web design"  ux  "user  experience" `);

// Term, term, negated term OR exact term, negated exact term
log(`  +frontend engineer [~!{%}/*) -backend  "ux  engineer "   -"full stack" `);
