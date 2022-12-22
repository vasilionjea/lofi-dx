import './styles/style.scss';
import { QueryTokenizer } from './tokenizer';

function logTokens(query: string) {
  console.table(
    new QueryTokenizer(query).tokenize(), ['type', 'text']
  );
}

// Terms
logTokens(` Hello  world! `);

// Exact term, term
logTokens(` "sea bass"  salmon `);

// Negated term, term, term
logTokens(` -car jaguar speed `);

// Negate exact term, term, exact term
logTokens(` -"web design"  ux  "user experience" `);

// Term, term, negated term OR exact term, negated exact term
logTokens(`  frontend engineer -backend  OR  "ux engineer" -"full stack"`);
