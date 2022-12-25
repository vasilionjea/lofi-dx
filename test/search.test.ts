import { Search } from '../src/search';

let people;
beforeEach(() => {
  people = new Search({ uidKey: 'id' }).addDocuments([
    { id: 11, name: 'Alice Smith', title: 'Product Designer' },
    { id: 32, name: 'Joe Brown', title: 'Senior Software Engineer' },
    { id: 7, name: 'Jay Doe', title: 'Senior Product Designer' },
    { id: 55, name: 'Mary', title: 'Senior Product Designer' },
    { id: 49, name: 'Helen Queen', title: 'Senior Staff Software Engineer' },
  ]);

  people.index('title');
});

test.skip('it should ...', () => {
  // TODO
});
