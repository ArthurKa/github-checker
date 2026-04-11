// @ts-check
'use strict';

module.exports = ((/** @type {import('eslint').Linter.Config} */ e) => e)({
  extends: [
    './node_modules/@arthurka/eslint',
    'plugin:react/recommended',
  ],
  plugins: [
    'react',
    'jsx-a11y',
  ],
  rules: {
    'react/jsx-key': 'warn',
    'react/no-unknown-property': 'off',
    'react/jsx-curly-spacing': ['warn', {
      when: 'never',
      children: true,
    }],
    '@typescript-eslint/ban-types': 'off',
    'react/jsx-no-leaked-render': ['warn', {
      validStrategies: ['coerce', 'ternary'],
    }],
    'implicit-arrow-linebreak': 'warn',
    'react/jsx-tag-spacing': ['warn', {
      closingSlash: 'never',
      beforeSelfClosing: 'always',
      afterOpening: 'never',
      beforeClosing: 'never',
    }],
    'react-hooks/exhaustive-deps': ['error', {
      additionalHooks: '\\buseIonView(Will|Did)(Enter|Leave)\\b',
    }],
    'react/jsx-props-no-multi-spaces': 'warn',
    'react/self-closing-comp': 'warn',
    'space-before-blocks': 'warn',
    'wrap-iife': 'warn',
    'array-callback-return': 'warn',
    'no-implicit-coercion': ['warn', {
      boolean: false,
      number: false,
      string: true,
      disallowTemplateShorthand: true,
    }],
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/display-name': 'off',
    'react/jsx-curly-brace-presence': 'warn',
    '@typescript-eslint/array-type': ['warn', {
      default: 'array-simple',
    }],
    '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
    '@typescript-eslint/no-extra-non-null-assertion': 'warn',
    '@typescript-eslint/no-for-in-array': 'warn',
    '@typescript-eslint/no-misused-new': 'warn',
    '@typescript-eslint/no-unnecessary-type-constraint': 'warn',
    '@typescript-eslint/prefer-as-const': 'warn',
    '@typescript-eslint/prefer-for-of': 'warn',
    '@typescript-eslint/prefer-function-type': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/prefer-ts-expect-error': 'warn',
    'no-process-env': 'error',
    'react/jsx-curly-newline': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/anchor-is-valid': 'warn',
    'react/jsx-equals-spacing': 'warn',
    'react/jsx-closing-bracket-location': 'warn',
    'no-labels': 'off',
    'react/jsx-no-useless-fragment': 'warn',
    'react/jsx-boolean-value': 'warn',
    'react/jsx-wrap-multilines': ['warn', {
      declaration: 'parens-new-line',
      assignment: 'parens-new-line',
      return: 'parens-new-line',
      arrow: 'parens-new-line',
      condition: 'parens-new-line',
      logical: 'parens-new-line',
      prop: 'ignore', // 'never' doesn't fit here
    }],
    'react/no-unstable-nested-components': 'warn',
    'react/no-danger': 'off',
    'react/jsx-one-expression-per-line': 'off',
    'react/jsx-indent': 'off',
    'react/jsx-first-prop-new-line': 'warn',
    'import/no-useless-path-segments': 'warn',
    'react/jsx-max-props-per-line': ['warn', { when: 'multiline' }],
    'default-case': 'warn',
    'jsx-a11y/alt-text': 'warn',
    'jsx-a11y/media-has-caption': 'warn',
  },
  overrides: [
    {
      files: '**.d.ts',
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/consistent-type-definitions': 'off',
      },
    },
    {
      files: '**.config.js',
      rules: {
        'require-await': 'off',
        'arthurka/remove-async-keyword-if-no-await': 'off',
      },
    },
    {
      files: 'vite.config.ts',
      rules: {
        'import/no-relative-packages': 'off',
      },
    },
    {
      files: ['**.tsx', '**/styles.ts'],
      rules: {
        'arthurka/space-before-keywords': 'off',
        'arthurka/space-after-keywords': 'off',
      },
    },
  ],
});
