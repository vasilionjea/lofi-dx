import './styles/style.scss';
import { QueryTokenizer, QueryParser, Query, Token, Search } from '../src/index';

// Add documents to the index
const people = new Search({ uidKey: 'id' }).addDocuments([
  { id: 11, name: 'Alice Smith', title: 'Product Designer' },
  { id: 32, name: 'Joe Brown', title: 'Senior Software Engineer' },
  { id: 7, name: 'Jay Doe', title: 'Senior Product Designer' },
  { id: 55, name: 'Mary', title: 'Senior Product Designer' },
  { id: 49, name: 'Helen Queen', title: 'Senior Staff Software Engineer' },
]).index('title');

function searchPeople(queryText: string) {
  const tokens: Token[] = new QueryTokenizer(queryText).tokenize();
  const query: Query = new QueryParser(tokens).parse();

  const results = people.search(query);


  console.log(query);
  console.log(results);
}

searchPeople('Engineer');

// Term & ExactTerm
// ` word apostophe's [not_okay] the  "exactly this"  "exactly, that!"  12-word-34 "#!^$%&" `

// PresenceTerm
// ` -negated  it is  -"also negated"  -"also, this one's"   +required  +"also required"  + `

// Mixed with invalid chars
// ` @#* +required notrequired  ~!} 10.5% /(  "10% off"  -negated  "exact,  term "   -"also, negated's." `
