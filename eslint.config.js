import stylistic from '@stylistic/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import { globalIgnores } from 'eslint/config'
import tailwindPlugin from 'eslint-plugin-better-tailwindcss'
import importPlugin from 'eslint-plugin-import-x'
import globals from 'globals'

const ERROR = 'error'
const WARN = 'warn'
const OFF = 'off'
const REACT_FILES = '**/*.{jsx,tsx}'
const JS_AND_TS = '**/*.{js,jsx,ts,tsx}'
const TS_FILES = '**/*.{ts,tsx}'

/** @type {import("eslint").Linter.Config} */
export default [
  parser(),
  misc(),
  importRules(),
  tailwind(),
  style(),
  ignoreFiles(),
]

function parser() {
  return {
    files: [TS_FILES],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: true,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
  }
}

function misc() {
  return {
    rules: {
      'no-warning-comments': [
        ERROR,
        { terms: ['FIXME'], location: 'anywhere' },
      ],
    },
  }
}

function importRules() {
  return {
    files: [JS_AND_TS],
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/consistent-type-specifier-style': [ERROR, 'prefer-top-level'],
      // TODO: モジュール間の依存関係のルールを追加
      // https://zenn.dev/yamachan0625/books/ddd-hands-on/viewer/chapter16_eslint
      'import/order': [
        WARN,
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [
            { pattern: '~/**/*', group: 'internal' },
            {
              pattern: '{react,react-dom/**}',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'react-router',
              group: 'external',
              position: 'before',
            },
          ],
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroupsExcludedImportTypes: ['react', 'react-dom/**', 'react-router'],
        },
      ],
    },
  }
}

function style() {
  return {
    files: [JS_AND_TS],
    // 自動生成されるのでフォーマットが制御できない
    ignores: ['./app/components/icons/**/*'],
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      ...stylistic.configs['recommended'].rules,
      '@stylistic/arrow-parens': [ERROR, 'always'],
      '@stylistic/operator-linebreak': [OFF],
    },
  }
}

// TODO: eslint-plugin-tailwindcssが正式にv4に対応したら乗り換える
// https://github.com/francoismassart/eslint-plugin-tailwindcss
function tailwind() {
  return {
    files: [REACT_FILES],
    plugins: {
      'better-tailwindcss': tailwindPlugin,
    },
    rules: {
      // enable all recommended rules as warning
      ...tailwindPlugin.configs['recommended-warn'].rules,
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: './app/app.css',
      },
    },
  }
}

function ignoreFiles() {
  return globalIgnores(['build', '**/*.d.ts'])
}
