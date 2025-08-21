// cloudflare サービスをテスト環境で使用する設定
// https://developers.cloudflare.com/workers/testing/vitest-integration/write-your-first-test/
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
    },
    include: ['./app/**/*.test.ts'], // .tsxファイルを除外
  },
},
)
