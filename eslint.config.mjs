import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylisticTs from "@stylistic/eslint-plugin-ts";
import parserTs from "@typescript-eslint/parser";

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "out/"
    ],
  },
  {
    plugins: {
      eslint: eslint,
      "@stylistic/ts": stylisticTs
    },
    languageOptions: {
      parser: parserTs
    },
    rules: {
      "@stylistic/ts/indent": ['error', 2],
      "no-unused-vars": "off", // Note: you must disable the base rule as it can report incorrect errors
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    },
  }
];
