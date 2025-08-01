import {
  defineWorkersProject,
} from '@cloudflare/vitest-pool-workers/config'

// cloudflare サービスをテスト環境で使用する設定
// https://developers.cloudflare.com/workers/testing/vitest-integration/write-your-first-test/

export default defineWorkersProject(async () => {
  return {
    test: {
      coverage: {
        provider: 'istanbul',
      },
      poolOptions: {
        workers: {
          wrangler: {
            configPath: './wrangler.jsonc',
          },
          singleWorker: true,
        },
      },
      include: ['./app/**/*.test.{ts,tsx}'],
    },
  }
})
