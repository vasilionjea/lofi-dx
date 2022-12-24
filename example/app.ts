import './styles/style.scss';
import { QueryTokenizer, QueryParser } from '../src/index';

function log(queryText: string) {
  const tokens = new QueryTokenizer(queryText).tokenize();
  const parser = new QueryParser(tokens);
  const query = parser.parse();

  console.log(`\n${queryText}`);
  console.log(query);
}

// Terms
log(` Hello  world! `);

// Exact term, presence term
log(` "sea bass"  +salmon `);

// Presence term, term, exact term, presence term
log(` +jaguar speed "south america" -car `);

// Presence term, term, exact term
log(` -"web design"  ux  "user  experience" `);

// Mixed terms with invalid chars
log(`  +frontend engineer [~!{%}/*) -backend  "ux  engineer "   -"full stack" `);
