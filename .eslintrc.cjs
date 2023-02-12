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
    "block-scoped-var": "error",
    "eqeqeq": "error",
    "no-var": "error",
    "prefer-const": "error",
    "eol-last": "error",
    "prefer-arrow-callback": "error",
    "no-trailing-spaces": "error",
    "quotes": ["warn", "single", { "avoidEscape": true }],
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
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
      ],
      rules: {
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
      },
    },
    {
      files: ['test/**/*.ts'],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./test/tsconfig.json'],
        sourceType: 'module',
      },
      extends: [
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
      },
    },
  ],
};
