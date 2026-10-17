// @ts-check
import stylistic from '@stylistic/eslint-plugin';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

const BLOCKS = ['function', 'class', 'block-like', 'if', 'for', 'while', 'do', 'switch', 'try'];
const MULTILINE = ['multiline-expression', 'multiline-const', 'multiline-let'];

export default tseslint.config(
  { ignores: ['dist', '.astro', 'node_modules', 'demo'] },
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tseslint.parser },
  },
  ...astro.configs['flat/base'],
  {
    files: ['**/*.{js,mjs,ts,astro}'],
    plugins: { '@stylistic': stylistic },
    rules: {
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: [...BLOCKS, ...MULTILINE, 'return', 'export'] },
        { blankLine: 'always', prev: [...BLOCKS, ...MULTILINE], next: '*' },
        { blankLine: 'always', prev: ['const', 'let'], next: '*' },
        { blankLine: 'always', prev: '*', next: ['const', 'let'] },
        { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
        { blankLine: 'always', prev: ['const', 'let'], next: ['multiline-const', 'multiline-let'] },
        { blankLine: 'any', prev: 'import', next: 'import' },
        { blankLine: 'any', prev: 'export', next: 'export' },
      ],
      '@stylistic/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    },
  },
);
