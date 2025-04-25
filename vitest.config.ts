import path from 'node:path'
import {
  defineWorkersProject,
  readD1Migrations,
} from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersProject(async () => {
  const migrationsPath = path.join(process.cwd(), 'drizzle')
  const migrations = await readD1Migrations(migrationsPath)

  return {
    test: {
      setupFiles: ['./tests/apply-migrations.ts'],
      poolOptions: {
        workers: {
          wrangler: {
            configPath: './wrangler.json',
          },
          singleWorker: true,
          miniflare: {
            // Add a test-only binding for migrations, so we can apply them in a
            // setup file
            bindings: { TEST_MIGRATIONS: migrations },
          },
        },
      },
      include: ['./src/**/*.test.{ts,tsx}', './worker/**/*.test.{ts,tsx}'],
    },
  }
})
