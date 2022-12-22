import './styles/style.scss';
import { QueryParser } from './parser';
import { QueryTokenizer } from './tokenizer';

function log(query: string) {
  const queryTokenizer = new QueryTokenizer(query);
  const queryParser = new QueryParser(queryTokenizer.tokenize());

  console.log(`\n${query}`);
  queryParser.parse();
}

// Terms
log(` Hello  world! `);

// Exact term, term
log(` "sea bass"  salmon `);

// Negated term, term, term
log(` -car jaguar speed `);

// Negate exact term, term, exact term
log(` -"web design"  ux  "user  experience" `);

// Term, term, negated term OR exact term, negated exact term
log(`  frontend engineer -backend  OR  "ux engineer" -"full stack"`);
