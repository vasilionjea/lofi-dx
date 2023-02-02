import LocalStorageMock from './local-storage';

Object.defineProperty(global, 'localStorage', {
  value: new LocalStorageMock(),
  writable: false,
});
