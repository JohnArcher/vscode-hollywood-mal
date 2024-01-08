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
  }
};
