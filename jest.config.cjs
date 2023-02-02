/** @type {import('ts-jest').JestConfigWithTsJest} */
// For a detailed explanation of each configuration property visit:
// https://jestjs.io/docs/configuration
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['test/'],
  setupFiles: ['./test/__setups__/index.ts'],
  moduleDirectories: [
    'node_modules',
    'src',
  ],
  modulePathIgnorePatterns: ['<rootDir>/__setups__'],
  coveragePathIgnorePatterns: ['__setups__'],
  clearMocks: true,
  resetMocks: true,

  // https://jestjs.io/docs/configuration#globals-object
  globals: {},
};
