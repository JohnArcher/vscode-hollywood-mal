// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    '@stylistic/ts',
  ],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    '@stylistic/ts/indent': ['error', 2],
    "no-unused-vars": "off", // Note: you must disable the base rule as it can report incorrect errors
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
  }
};
