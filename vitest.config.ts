// cloudflare サービスをテスト環境で使用する設定
// https://developers.cloudflare.com/workers/testing/vitest-integration/write-your-first-test/
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
    },
    projects: [
      {
        test: {
          name: 'unit',
          include: [
            './app/**/*.test.{ts,tsx}',
            './scripts/**/*.test.ts',
          ],
          exclude: ['./app/**/*.browser.test.{ts,tsx}'],
          environment: 'node',
        },
      },
      {
        plugins: [react(), tsconfigPaths()],
        test: {
          name: 'browser',
          include: ['./app/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            provider: 'playwright',
            instances: [
              { browser: 'webkit' },
            ],
          },
        },
      },
    ],
  },
},
)
