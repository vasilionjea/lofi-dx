// https://eslint.org/docs/latest/user-guide/configuring/configuration-files
// https://json.schemastore.org/eslintrc
module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],

  parserOptions: {
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },

  // Project-specific rules
  rules: {
    // Example disabling a plugin rule
    // 0 = off, 1 = warn, 2 = error
    // '@typescript-eslint/no-unused-vars': 0,
  },

  overrides: [
    {
      files: ['src/**/*.ts'],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
        sourceType: 'module',
      },
      extends: [
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
      ],
    },
    {
      files: ['test/**/*.ts'],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./test/tsconfig.json'],
        sourceType: 'module',
      },
    },
  ],
};
