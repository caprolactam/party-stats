import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { default as defaultConfig } from '@epic-web/config/eslint'
import { includeIgnoreFile } from '@eslint/compat'
import prettierPlugin from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')

/** @type {import("eslint").Linter.Config} */
export default [
  ...defaultConfig,
  jsxA11y.flatConfigs.recommended,
  prettierPlugin,
  includeIgnoreFile(gitignorePath),
]
