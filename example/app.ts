import './styles/style.scss';
import { QueryTokenizer, QueryParser, Query, Token, Search } from '../src/index';

// Create and add docs to the index
const people = new Search({
  uidKey: 'id',
  searchFields: ['title'],
});

people.addDocuments([
  { id: 3, name: 'Mike', title: 'Chief Forward Impact Engineer 3 Foo' },
  { id: 7, name: 'Joe Doe', title: 'Chief Interactions Liason' },
  { id: 11, name: 'Alice Smith', title: 'UX Designer Bar Baz' },
  { id: 21, name: 'Jamie Black', title: 'Foo Graphic Designer Biz' },
  { id: 32, name: 'Joe Brown', title: 'Senior Software Engineer Barfoo' },
  { id: 49, name: 'Helen Queen', title: 'Staff Dynamic Resonance Orchestrator Foo' },
  { id: 55, name: 'Mary', title: 'Queen Product Program Executive Manager Foo' },
  { id: 101, name: 'Alan Smith', title: 'Bar Senior Staff Software Engineer 3 Foobar' },
]);

console.log('toJSON:', people.toJSON());

// Example search
function searchPeople(queryText: string) {
  const tokens: Token[] = new QueryTokenizer(queryText).tokenize();
  const query: Query = new QueryParser(tokens).parse();

  // console.log(tokens);
  // console.log(query.parts);

  const results = people.search(query);
  // console.log(results);
  console.log('results:', Object.values(results).map(obj => obj.id));
}

searchPeople(`"software engineer" ux designer -"engineer 3"`); //=> [11, 21, 32]
// searchPeople(`+senior +software +engineer`); //=> [32, 101]
// searchPeople(` +senior +"software engineer" +staff `); //=> [101]
// searchPeople(` +senior +"software engineer" +staff -"engineer 3" `); //=> []
// searchPeople(`+engineer -staff`); //=> [3, 32]
// searchPeople(` +"engineer 3" +"software engineer" `); //=> [101]
// searchPeople(`+senior +software +engineer -"senior staff"`); //=> [32]
// searchPeople(`"software engineer" designer -graphic`); //=> [11, 32, 101]
// searchPeople(`+"software engineer" -"engineer 3"`); //=> [32]

// Term & ExactTerm
// ` word apostophe's [not_okay] the  "exactly this"  "exactly, that!"  12-word-34 "#!^$%&" `

// PresenceTerm
// ` -negated  it is  -"also negated"  -"also, this one's"   +required  +"also required"  + `

// Mixed with invalid chars
// ` @#* +required notrequired  ~!} 10.5% /(  "10% off"  -negated  "exact,  term "   -"also, negated's." `
