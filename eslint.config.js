// @ts-check
import javascript from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import astro from 'eslint-plugin-astro';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

const BLOCKS = ['function', 'class', 'block-like', 'if', 'for', 'while', 'do', 'switch', 'try'];
const MULTILINE = ['multiline-expression', 'multiline-const', 'multiline-let'];

const MIN_NAME_LENGTH = 3;
const ALLOWED_SHORT_NAMES = ['_', 'x', 'y', 'cx', 'cy', 'id'];

export default defineConfig(
  { ignores: ['dist', '.astro', 'node_modules', 'demo', 'test-results', 'playwright-report'] },
  javascript.configs.recommended,
  tseslint.configs.recommended,
  astro.configs['flat/recommended'],
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: { globals: { process: 'readonly' } },
  },
  {
    files: ['**/*.{js,mjs,ts,astro}'],
    plugins: { '@stylistic': stylistic },
    rules: {
      eqeqeq: 'error',
      'no-console': ['error', { allow: ['info'] }],
      'id-length': ['error', { min: MIN_NAME_LENGTH, exceptions: ALLOWED_SHORT_NAMES, properties: 'never' }],
      '@typescript-eslint/consistent-type-imports': 'error',
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
