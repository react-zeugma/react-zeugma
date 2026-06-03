import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/', 'demo/', 'storybook-static/', 'node_modules/', '*.config.*'],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'semi': ['error', 'never'],
      'quotes': ['error', 'single', { 'avoidEscape': true }],
    },
  },
);
