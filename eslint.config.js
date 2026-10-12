import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig(
  {
    ignores: ['**/dist/', 'apps/homepage/', 'node_modules/', '*.config.*'],
  },
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parserOptions: {
        project: ['./packages/react-zeugma/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'semi': ['error', 'never'],
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
);
