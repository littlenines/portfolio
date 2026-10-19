const BEM_CLASS =
  /^(?:is-[a-z0-9-]+|[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?)$/;

const FULL_NAME = /^(?=[a-z0-9-]{3,}$)[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

const LEFT_TO_PRETTIER = [
  'at-rule-empty-line-before',
  'declaration-empty-line-before',
  'custom-property-empty-line-before',
  'scss/dollar-variable-empty-line-before',
  'scss/double-slash-comment-empty-line-before',
  'scss/comment-no-empty',
];

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  plugins: ['stylelint-order'],
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
      { 'z-index': [/^-?\d+$/], 'font-weight': [/^\d+$/], font: [/^\d+\s/] },
      {
        message: (property) => `Use ${property === 'z-index' ? 'z-index()' : 'font-weight()'} instead of a raw number`,
      },
    ],
    'order/order': [
      ['dollar-variables', 'custom-properties', { type: 'at-rule', name: 'include', hasBlock: false }, 'declarations'],
      { message: 'Order a rule as: $variables, --custom-properties, @include, declarations' },
    ],
    'max-nesting-depth': [4, { ignore: ['pseudo-classes'], ignoreAtRules: ['include', 'media'] }],
  },
};
