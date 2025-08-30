import { defineConfig, devices } from '@playwright/test'

const PORT = process.env.PORT || '4173'

export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/*.test.ts'],
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone SE (3rd gen)'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    port: Number(PORT),
  },
})
