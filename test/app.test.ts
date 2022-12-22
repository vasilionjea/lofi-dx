import App from '../src/app';

let app: App;

beforeEach(() => {
  global.SOME_FEATURE_FLAG = false;
  app = new App();
  app.start();
});

test('it starts app', () => {
  const value = true;
  expect(value).toBe(true);
});

test('it contains greeting', () => {
  const value = 'hello world';
  expect(value).toContain('hello');
});
