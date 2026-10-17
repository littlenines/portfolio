// Class names follow BEM: block, block__element, block--modifier, plus is-* state classes
const BEM_CLASS =
  /^(?:is-[a-z0-9-]+|[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?)$/;

// Function, mixin and variable names are written out in full, at least three characters (see docs/conventions.md)
const FULL_NAME = /^(?=[a-z0-9-]{3,}$)[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

// Blank lines and spacing are Prettier's job; Stylelint checks conventions and correctness
const LEFT_TO_PRETTIER = [
  'at-rule-empty-line-before',
  'declaration-empty-line-before',
  'custom-property-empty-line-before',
  'scss/dollar-variable-empty-line-before',
  'scss/double-slash-comment-empty-line-before',
  // The table of contents in main.scss uses empty // lines as spacers
  'scss/comment-no-empty',
];

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    ...Object.fromEntries(LEFT_TO_PRETTIER.map((rule) => [rule, null])),
    'selector-class-pattern': [BEM_CLASS, { message: 'Use BEM class names (block__element--modifier) or is-* states' }],
    'scss/at-function-pattern': [FULL_NAME, { message: 'Write function names out in full' }],
    'scss/at-mixin-pattern': [FULL_NAME, { message: 'Write mixin names out in full' }],
    'scss/dollar-variable-pattern': [FULL_NAME, { message: 'Write variable names out in full' }],
    'declaration-property-unit-disallowed-list': [
      { 'font-size': ['px'] },
      { message: 'Use font-size() or a rem value' },
    ],
    'declaration-property-value-disallowed-list': [
      { 'z-index': [/^-?\d+$/] },
      { message: 'Use z-index() instead of a raw number' },
    ],
    'max-nesting-depth': [4, { ignore: ['pseudo-classes'], ignoreAtRules: ['include', 'media'] }],
  },
};
