import './styles/style.scss';
import { QueryTokenizer, QueryParser, Query, Token, Search } from '../src/index';

// Create and add docs to the index
const people = new Search({
  uidKey: 'id',
  searchFields: ['title', 'name'],
});

people.addDocuments([
  { id: 11, name: 'Alice Smith', title: 'UX Designer' },
  { id: 32, name: 'Joe Brown', title: 'Senior Software Engineer' },
  { id: 7, name: 'Jay Doe', title: 'UX Product Manager' },
  { id: 55, name: 'Mary', title: 'Queen Senior Product Designer' },
  { id: 49, name: 'Helen Queen', title: 'Staff Software Engineer Engineer' },
]);

console.log('toJSON:', people.toJSON());

// Example search
function searchPeople(queryText: string) {
  const tokens: Token[] = new QueryTokenizer(queryText).tokenize();
  const query: Query = new QueryParser(tokens).parse();

  const results = people.search(query);

  console.log('query:', query);
  console.log('results =>', results);
}

searchPeople('queen -engineer +ux');

// Term & ExactTerm
// ` word apostophe's [not_okay] the  "exactly this"  "exactly, that!"  12-word-34 "#!^$%&" `

// PresenceTerm
// ` -negated  it is  -"also negated"  -"also, this one's"   +required  +"also required"  + `

// Mixed with invalid chars
// ` @#* +required notrequired  ~!} 10.5% /(  "10% off"  -negated  "exact,  term "   -"also, negated's." `
