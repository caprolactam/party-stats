import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/vitest-setup.ts'],
    include: ['**/components/**/*.test.tsx'],
    globals: true,
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './app'),
    },
  },
})
