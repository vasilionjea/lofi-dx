import {createStorage, Storage} from '../../src/utils/storage';
import {InvertedIndex} from '../../src/search/inverted-index';

let storage: Storage;
let index: InvertedIndex;

const storageKey = 'test-key';
const docs = [
  {id: 3, name: 'Mike', title: 'Chief Forward Impact Engineer 3 Foo'},
  {id: 7, name: 'Joe Doe', title: 'Chief Interactions Liason'},
  {id: 11, name: 'Alice Smith', title: 'UX Designer Bar Baz'},
];

beforeEach(() => {
  localStorage.clear();
  index = new InvertedIndex({uidKey: 'id', fields: ['title']}).addDocuments(
    docs
  );
  storage = createStorage(index, {storageKey});
});

describe('Storage', () => {
  test('it should get key', () => {
    expect(storage.getKey()).toBe(storageKey);
  });

  test('it should save to localStorage', async () => {
    expect(storage.isSaved()).toBe(false);
    expect(localStorage.getItem(storageKey)).toBeNull();

    await storage.save();
    expect(storage.isSaved()).toBe(true);
    expect(localStorage.getItem(storageKey)).toBeTruthy();
  });

  test('it should save to localStorage with TTL', async () => {
    expect(storage.isSaved()).toBe(false);
    expect(localStorage.getItem(storageKey)).toBeNull();

    const TEN_SECONDS = 1000 * 10;
    await storage.save({ttl: TEN_SECONDS});

    expect(localStorage.getItem(storageKey)).toBeTruthy();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const item = JSON.parse(localStorage.getItem(storageKey)!);
    expect(item.expiry > 0).toBe(true);
  });

  test('it should load from localStorage', async () => {
    expect(await storage.load()).toBe(false);

    await storage.save();

    expect(await storage.load()).toBe(true);
    expect(index.getDocumentCount()).toBe(docs.length);
  });

  test('it should clear from localStorage', async () => {
    expect(storage.isSaved()).toBe(false);
    await storage.save();

    expect(storage.isSaved()).toBe(true);
    expect(localStorage.getItem(storageKey)).not.toBeNull();

    await storage.clear();
    expect(storage.isSaved()).toBe(false);
    expect(localStorage.getItem(storageKey)).toBeNull();
  });
});
